/**
 * Evalúa a Tapi contra el banco de frases (dataset.json) y calcula métricas.
 * Uso: npm run tapi:eval                (prompt v1)
 *      TAPI_PROMPT=v2 npm run tapi:eval
 *      npm run tapi:eval -- --limit 10  (solo las primeras 10, para pruebas rápidas)
 *
 * Modos de cada caso:
 *   order   → el carrito debe ser EXACTO y Tapi no debe preguntar nada
 *   ask     → Tapi no debe armar nada y debe hacer al menos una pregunta
 *   partial → el carrito debe ser exacto Y además Tapi debe preguntar por lo ambiguo
 *   none    → Tapi no debe armar ningún carrito (no existe, abuso, fuera de alcance)
 */
const fs = require('fs');
const path = require('path');
const { parseOrder } = require('./parse');
const { loadCatalog } = require('./catalog');
const { sequelize } = require('../../db');

const key = (i) => `${i.name}|${i.variant || ''}|${i.quantity}`;

function judge(expect, got) {
  const gotKeys = new Set(got.items.map(key));
  const expKeys = new Set(expect.items.map(key));
  const sameCart = gotKeys.size === expKeys.size && [...expKeys].every((k) => gotKeys.has(k));
  const asked = got.ask.length > 0;
  switch (expect.mode) {
    case 'order': return sameCart && !asked;
    case 'ask': return got.items.length === 0 && asked;
    case 'partial': return sameCart && asked;
    case 'none': return got.items.length === 0;
    default: return false;
  }
}

async function main() {
  sequelize.options.logging = false;
  const version = process.env.TAPI_PROMPT || 'v1';
  const limitIdx = process.argv.indexOf('--limit');
  const limit = limitIdx > -1 ? Number(process.argv[limitIdx + 1]) : Infinity;

  const dsIdx = process.argv.indexOf('--dataset');
  const dsName = dsIdx > -1 ? process.argv[dsIdx + 1] : 'dataset';
  const { store, cases } = JSON.parse(fs.readFileSync(path.join(__dirname, `${dsName}.json`), 'utf8'));
  const catalog = await loadCatalog(store);

  const results = [];
  for (const c of cases.slice(0, limit)) {
    let got, error = null;
    try {
      got = await parseOrder(store, c.text, { promptVersion: version, catalog });
    } catch (e) {
      error = e.message;
      got = { items: [], ask: [], notFound: [], rejected: [], ms: 0 };
    }
    const ok = !error && judge(c.expect, got);
    // precisión/recall a nivel de producto (solo casos con carrito esperado)
    let tp = 0;
    const expKeys = new Set(c.expect.items.map(key));
    for (const k of new Set(got.items.map(key))) if (expKeys.has(k)) tp++;
    results.push({ id: c.id, category: c.category, text: c.text, mode: c.expect.mode, ok, error,
      expected: c.expect.items, got: got.items.map((i) => ({ name: i.name, variant: i.variant, quantity: i.quantity })),
      ask: got.ask, notFound: got.notFound, rejected: got.rejected.length, ms: got.ms,
      tp, gotN: got.items.length, expN: c.expect.items.length });
    process.stdout.write(ok ? '.' : 'x');
  }
  console.log('\n');

  const pct = (a, b) => (b ? `${((100 * a) / b).toFixed(1)}%` : 'n/a');
  const total = results.length;
  const passed = results.filter((r) => r.ok).length;
  const cart = results.filter((r) => r.expN > 0);
  const tp = cart.reduce((s, r) => s + r.tp, 0);
  const gotN = cart.reduce((s, r) => s + r.gotN, 0);
  const expN = cart.reduce((s, r) => s + r.expN, 0);
  const rejected = results.reduce((s, r) => s + r.rejected, 0);
  const falseCarts = results.filter((r) => r.expN === 0 && r.gotN > 0).length;
  const times = results.map((r) => r.ms).filter(Boolean).sort((a, b) => a - b);

  console.log(`Prompt ${version} · modelo ${process.env.OLLAMA_MODEL || 'qwen3.5-9b-64k'} · ${total} casos`);
  console.log(`  Exactitud del pedido (caso completo):   ${pct(passed, total)}  (${passed}/${total})`);
  console.log(`  Precisión de productos:                 ${pct(tp, gotN)}`);
  console.log(`  Cobertura (recall) de productos:        ${pct(tp, expN)}`);
  console.log(`  Carritos armados cuando NO debían:      ${falseCarts}`);
  console.log(`  Códigos/opciones inventados (rechazados): ${rejected}`);
  console.log(`  Latencia media / p95:                   ${(times.reduce((s, t) => s + t, 0) / (times.length || 1) / 1000).toFixed(1)} s / ${((times[Math.floor(times.length * 0.95) - 1] || 0) / 1000).toFixed(1)} s`);
  console.log('\n  Por categoría:');
  for (const cat of [...new Set(results.map((r) => r.category))]) {
    const rs = results.filter((r) => r.category === cat);
    console.log(`    ${cat.padEnd(10)} ${pct(rs.filter((r) => r.ok).length, rs.length).padStart(7)}  (${rs.filter((r) => r.ok).length}/${rs.length})`);
  }
  const fails = results.filter((r) => !r.ok);
  if (fails.length) {
    console.log('\n  Casos fallidos:');
    for (const f of fails) {
      console.log(`   #${f.id} [${f.mode}] "${f.text}"`);
      console.log(`      esperado: ${JSON.stringify(f.expected.map((i) => `${i.quantity}x ${i.name}${i.variant ? ' ' + i.variant : ''}`))}`);
      console.log(`      obtuvo:   ${JSON.stringify(f.got.map((i) => `${i.quantity}x ${i.name}${i.variant ? ' ' + i.variant : ''}`))}${f.ask.length ? '  ask=' + JSON.stringify(f.ask) : ''}${f.error ? '  ERROR ' + f.error : ''}`);
    }
  }

  const outDir = path.join(__dirname, '..', '..', 'exports');
  fs.mkdirSync(outDir, { recursive: true });
  const file = path.join(outDir, `tapi-eval-${dsName}-${version}-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, '')}.json`);
  fs.writeFileSync(file, JSON.stringify({ version, total, passed, results }, null, 2));
  console.log(`\n  Detalle guardado en ${path.relative(process.cwd(), file)}`);
  await sequelize.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

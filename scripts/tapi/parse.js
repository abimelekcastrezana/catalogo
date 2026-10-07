/**
 * Convierte una frase en un carrito propuesto.
 *  1) El modelo (Ollama) SOLO identifica códigos, opciones y cantidades.
 *  2) Este código valida TODO contra la base de datos y calcula nombres, precios y total.
 *     Nunca confiamos en un precio o id que venga del modelo.
 */
const { loadCatalog } = require('./catalog');
const { VERSIONS } = require('./prompt');

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen3.5-9b-64k';

const SCHEMA = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          code: { type: 'string' },
          variant: { type: ['string', 'null'] },
          quantity: { type: 'integer' },
        },
        required: ['code', 'variant', 'quantity'],
      },
    },
    not_found: { type: 'array', items: { type: 'string' } },
    ask: { type: 'array', items: { type: 'string' } },
  },
  required: ['items', 'not_found', 'ask'],
};

const norm = (s) => String(s || '').trim().toLowerCase();

async function askModel(system, message, { url = OLLAMA_URL, model = OLLAMA_MODEL } = {}) {
  const res = await fetch(`${url}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      stream: false,
      think: false,
      format: SCHEMA,
      options: { temperature: 0, num_ctx: 8192 },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: message },
      ],
    }),
    signal: AbortSignal.timeout(60_000),
  });
  if (!res.ok) throw new Error(`Ollama respondió ${res.status}`);
  const data = await res.json();
  return JSON.parse(data.message.content);
}

async function parseOrder(slug, message, opts = {}) {
  const { promptVersion = 'v1' } = opts;
  const catalog = opts.catalog || (await loadCatalog(slug));
  const system = VERSIONS[promptVersion](catalog.vendor.name, catalog.text);

  const t0 = Date.now();
  const raw = await askModel(system, String(message).slice(0, 500), opts);
  const ms = Date.now() - t0;

  const items = [];
  const rejected = [];
  for (const it of raw.items || []) {
    const entry = catalog.byCode[it.code];
    if (!entry) {
      rejected.push({ reason: 'código inexistente', it });
      continue;
    }
    let variant = null;
    if (it.variant) {
      variant = entry.variants.find((v) => norm(v.name) === norm(it.variant)) || null;
      if (!variant && entry.variants.length) {
        rejected.push({ reason: 'opción inexistente', it });
        continue;
      }
    }
    const quantity = Math.min(99, Math.max(1, Number.isInteger(it.quantity) ? it.quantity : 1));
    const unit = Number((variant && variant.price != null ? variant.price : entry.product.price) || 0);
    items.push({
      productId: entry.product.id,
      variantId: variant ? variant.id : null,
      name: entry.product.name,
      variant: variant ? variant.name : null,
      quantity,
      unitPrice: unit,
      subtotal: Number((unit * quantity).toFixed(2)),
    });
  }

  return {
    items,
    total: Number(items.reduce((s, i) => s + i.subtotal, 0).toFixed(2)),
    notFound: raw.not_found || [],
    ask: raw.ask || [],
    rejected,
    ms,
  };
}

module.exports = { parseOrder, askModel };

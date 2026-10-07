// Uso: npm run tapi:parse -- moda-demo "quiero 2 playeras básicas talla M y una mochila"
const { parseOrder } = require('./parse');
const { sequelize } = require('../../db');

async function main() {
  const [slug, ...rest] = process.argv.slice(2);
  const message = rest.join(' ');
  if (!slug || !message) {
    console.error('Uso: npm run tapi:parse -- <slug-de-la-tienda> "<frase del cliente>"');
    process.exit(1);
  }
  sequelize.options.logging = false;
  const result = await parseOrder(slug, message, { promptVersion: process.env.TAPI_PROMPT || 'v1' });
  console.log(JSON.stringify(result, null, 2));
  await sequelize.close();
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});

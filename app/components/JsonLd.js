// Datos estructurados (schema.org) para buscadores e IA. Se escapa "<" para no cerrar el <script>.
export default function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}

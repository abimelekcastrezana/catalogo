import Link from 'next/link';
import { Check, Minus, MessageCircle } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { PLANS } from '@/app/lib/plans';
import JsonLd from '@/app/components/JsonLd';
import { SITE_URL, SITE_NAME } from '@/app/lib/site';

// CONTACT_WHATSAPP se lee en cada request (en build no está disponible).
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Planes y precios: tienda en línea gratis o desde $399 al año',
  description:
    'Planes anuales de TiendaTap para tu catálogo en línea: Free gratis (10 productos), Plus $399 MXN (40 productos y 5 categorías) y Max $799 MXN (sin límites). Pedidos por WhatsApp.',
  alternates: { canonical: '/planes' },
};

const { free, plus, max } = PLANS;

// Lo que incluye cada plan. Los números salen de app/lib/plans.js para no desincronizarse.
const PLAN_CARDS = [
  {
    plan: free,
    summary: 'Para empezar a vender con lo básico.',
    features: [
      { text: `Hasta ${free.maxProducts} productos`, included: true },
      { text: `2 fotos, nombre, descripción corta (${free.maxDescriptionLength} caracteres) y precio`, included: true },
      { text: 'Pedidos directo a tu WhatsApp', included: true },
      { text: 'Categorías', included: false },
      { text: 'Variantes, mayoreo y etiquetas', included: false },
    ],
  },
  {
    plan: plus,
    summary: 'Todas las funciones para un catálogo mediano.',
    features: [
      { text: `Hasta ${plus.maxProducts} productos`, included: true },
      { text: `Hasta ${plus.maxCategories} categorías`, included: true },
      { text: 'Variantes, precio de mayoreo y etiquetas', included: true },
      { text: 'Pedidos directo a tu WhatsApp', included: true },
    ],
  },
  {
    plan: max,
    summary: 'Sin límites, para catálogos grandes.',
    features: [
      { text: 'Productos sin límite', included: true },
      { text: 'Categorías sin límite', included: true },
      { text: 'Variantes, precio de mayoreo y etiquetas', included: true },
      { text: 'Pedidos directo a tu WhatsApp', included: true },
      { text: 'Pagos con tarjeta dentro de TiendaTap', included: true, soon: true },
    ],
  },
];

const FAQ = [
  {
    q: '¿Cómo activo Plus o Max?',
    a: 'Crea tu tienda (arranca en Free) y escríbenos por WhatsApp. Activamos tu plan en cuanto quede el pago.',
  },
  {
    q: '¿Cuánto dura mi plan?',
    a: 'Un año a partir de que se activa. En tu panel ves la fecha de vencimiento.',
  },
  {
    q: '¿Qué pasa si cambio a un plan más chico?',
    a: 'No se borra nada. Tu tienda muestra lo que entra en el nuevo plan y el resto queda guardado; si vuelves a subir, reaparece.',
  },
];

const money = (n) => n.toLocaleString('es-MX');

const STRUCTURED_DATA = [
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: SITE_NAME,
    url: SITE_URL,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description: 'Plataforma para crear el catálogo en línea de tu negocio y recibir pedidos por WhatsApp.',
    offers: PLAN_CARDS.map(({ plan, summary, features }) => ({
      '@type': 'Offer',
      name: `Plan ${plan.label}`,
      price: plan.priceMxn,
      priceCurrency: 'MXN',
      description: `${summary} ${features.filter((f) => f.included && !f.soon).map((f) => f.text).join('. ')}.`,
      url: `${SITE_URL}/planes`,
    })),
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  },
];

export default function PlanesPage() {
  const whatsappPhone = (process.env.CONTACT_WHATSAPP || '').replace(/[^0-9+]/g, '').replace(/^\+/, '');
  const whatsappHref = (text) =>
    whatsappPhone ? `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(text)}` : null;

  return (
    <main className="mx-auto max-w-[1200px] space-y-10 px-4 py-6 sm:px-6 sm:py-10">
      <JsonLd data={STRUCTURED_DATA} />
      <section className="mx-auto max-w-2xl space-y-2 text-center">
        <h1 className="m-0 text-3xl font-extrabold leading-tight sm:text-5xl">Planes anuales de catálogo</h1>
        <p className="m-0 text-[var(--muted)] sm:text-lg">
          Todos los precios son anuales, en pesos mexicanos. Elige el que mejor se adapta a tu negocio.
        </p>
      </section>

      <section aria-label="Planes" className="grid gap-4 md:grid-cols-3">
        {PLAN_CARDS.map(({ plan, summary, features }) => {
          const ctaHref = plan.priceMxn === 0
            ? '/register'
            : whatsappHref(`Hola, quiero el plan ${plan.label} de TiendaTap`) || '/register';
          const external = ctaHref.startsWith('http');
          return (
            <article
              key={plan.key}
              className="flex flex-col gap-5 rounded-3xl border-2 border-[var(--border)] bg-[var(--card)] p-6"
            >
              <div className="space-y-1">
                <h3 className="m-0 text-sm font-extrabold uppercase tracking-wide text-[var(--accent-text)]">
                  Plan {plan.label}
                </h3>
                <p className="m-0 flex items-baseline gap-1.5">
                  <span className="text-4xl font-extrabold tabular-nums">
                    {plan.priceMxn === 0 ? 'Gratis' : `$${money(plan.priceMxn)}`}
                  </span>
                  {plan.priceMxn > 0 && <span className="text-sm font-bold text-[var(--muted)]">MXN / año</span>}
                </p>
                <p className="m-0 text-sm text-[var(--muted)]">{summary}</p>
              </div>

              <ul className="m-0 flex-1 list-none space-y-2.5 p-0">
                {features.map((f) => (
                  <li
                    key={f.text}
                    className={`flex items-start gap-2.5 text-sm ${f.included ? 'text-[var(--text)]' : 'text-[var(--muted)]'}`}
                  >
                    {f.included ? (
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--success)]" strokeWidth={2.5} aria-hidden="true" />
                    ) : (
                      <Minus className="mt-0.5 h-4 w-4 flex-shrink-0" strokeWidth={2.5} aria-hidden="true" />
                    )}
                    <span>
                      {!f.included && <span className="sr-only">No incluye: </span>}
                      {f.text}
                      {f.soon && (
                        <span className="ml-1.5 inline-block rounded-full bg-[var(--info-soft)] px-2 py-0.5 text-[11px] font-bold text-[var(--info)]">
                          Próximamente
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>

              <Button asChild size="lg" variant={plan.priceMxn === 0 ? 'outline' : 'default'} className="w-full">
                {external ? (
                  <a href={ctaHref} target="_blank" rel="noopener noreferrer">
                    <MessageCircle aria-hidden="true" /> Quiero el plan {plan.label}
                  </a>
                ) : (
                  <Link href={ctaHref}>
                    {plan.priceMxn === 0 ? 'Crear mi tienda gratis' : `Quiero el plan ${plan.label}`}
                  </Link>
                )}
              </Button>
            </article>
          );
        })}
      </section>

      <section aria-labelledby="faq-title" className="mx-auto max-w-3xl space-y-4">
        <h2 id="faq-title" className="m-0 text-xl font-extrabold sm:text-2xl">Preguntas frecuentes</h2>
        <div className="space-y-3">
          {FAQ.map(({ q, a }) => (
            <div key={q} className="rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] p-4">
              <h3 className="m-0 text-base font-extrabold">{q}</h3>
              <p className="m-0 mt-1 text-sm text-[var(--muted)]">{a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col items-start gap-4 rounded-3xl border-2 border-[var(--accent)] bg-[var(--accent-soft)] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="space-y-1">
          <h2 className="m-0 text-xl font-extrabold sm:text-2xl">Activa tu catálogo hoy</h2>
          <p className="m-0 max-w-xl text-[var(--muted)]">
            Empieza gratis y sube de plan cuando tu negocio lo necesite.
          </p>
        </div>
        <div className="flex flex-shrink-0 flex-wrap gap-2">
          <Button asChild size="lg">
            <Link href="/register">Crear mi tienda</Link>
          </Button>
          {whatsappPhone && (
            <Button asChild size="lg" variant="outline">
              <a href={whatsappHref('Hola, tengo dudas sobre los planes de TiendaTap')} target="_blank" rel="noopener noreferrer">
                <MessageCircle aria-hidden="true" /> Hablar con nosotros
              </a>
            </Button>
          )}
        </div>
      </section>
    </main>
  );
}

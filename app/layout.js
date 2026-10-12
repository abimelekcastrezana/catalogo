import { Nunito } from 'next/font/google';
import './globals.css';
import AppHeader from './components/AppHeader';
import Providers from './components/Providers';
import { SITE_URL, SITE_NAME, SITE_TITLE, SITE_DESCRIPTION, SITE_LOGO } from './lib/site';

const nunito = Nunito({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-nunito',
});

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  icons: { icon: SITE_LOGO },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'es_MX',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [{ url: SITE_LOGO, alt: SITE_NAME }],
  },
  twitter: { card: 'summary', title: SITE_TITLE, description: SITE_DESCRIPTION, images: [SITE_LOGO] },
};

export default function RootLayout({ children }) {
  const whatsappPhone = (process.env.CONTACT_WHATSAPP || '').replace(/[^0-9+]/g, '').replace(/^\+/, '');
  return (
    <html lang="es" className={nunito.variable} suppressHydrationWarning>
      <body>
        <Providers>
          <div className="app-shell">
            <AppHeader whatsappPhone={whatsappPhone} />
            <main className="app-main">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}

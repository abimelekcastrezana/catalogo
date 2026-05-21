import './globals.css';
import AppHeader from './components/AppHeader';
import Providers from './components/Providers';

export const metadata = {
  title: 'TiendaTap',
  description: 'Catálogos digitales profesionales',
  icons: { icon: '/tiendatap_logo.jpg' },
};

export default function RootLayout({ children }) {
  const whatsappPhone = (process.env.CONTACT_WHATSAPP || '+524622222741').replace(/[^0-9+]/g, '').replace(/^\+/, '');
  return (
    <html lang="es" suppressHydrationWarning>
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

import './globals.css';
import AppHeader from './components/AppHeader';
import Providers from './components/Providers';

export const metadata = {
  title: 'Catalogo demo',
  description: 'Demo de autenticación y API',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('catalog-theme');
                  if (!t) t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  document.documentElement.dataset.theme = t;
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <Providers>
          <div className="app-shell">
            <AppHeader />
            <main className="app-main">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}

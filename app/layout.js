export const metadata = {
  title: 'Catalogo demo',
  description: 'Demo de autenticación y API',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}

import "./globals.css";

export const metadata = {
  title: "Salon Agenda",
  description: "Agenda para salones, barberías y clínicas",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}

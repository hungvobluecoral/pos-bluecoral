import './global.css';

export const metadata = {
  title: 'POS_BlueCoral Admin',
  description: 'Admin workspace khởi tạo tenant và branch theo scope rõ ràng.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-slate-950 text-slate-50 antialiased">
        {children}
      </body>
    </html>
  );
}

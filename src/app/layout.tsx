import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import '../styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ALOT - Barbershop Management System',
  description: 'Efficiently manage your barbershop appointments, staff, and clients.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Font Awesome */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
          integrity="sha512-Fo3rlrZj/k7ujTnHg4CGR2D7kSs0v4LLanw2qksYuRlEzO+tcaEPQogQ0KaoGN26/zrn20ImR1DfuLWnOo7aBA=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        {/* Additional scripts can be added here */}
      </head>
      <body className={inter.className}>
        {/* Scripts are loaded in their respective components */}
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sanduta Art - Печать фотографий онлайн | Высокое качество",
  description: "Сервис печати фотографий на различных материалах: бумаге, холсте, кружках, футболках и многом другом. Быстрая доставка по России через Nova Poshta.",
  keywords: "печать фотографий, фото на бумаге, печать на холсте, кружки с фото, футболки с фото, чехлы, календари, фотокниги",
  authors: [{ name: "Sanduta Art" }],
  creator: "Sanduta Art",
  publisher: "Sanduta Art",
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: "https://sanduta.art",
    title: "Sanduta Art - Печать фотографий онлайн",
    description: "Сервис печати фотографий на различных материалах с высочайшим качеством",
    siteName: "Sanduta Art",
    images: [
      {
        url: "https://sanduta.art/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Sanduta Art - Печать фотографий",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sanduta Art - Печать фотографий",
    description: "Сервис печати фотографий на различных материалах",
    images: ["https://sanduta.art/og-image.jpg"],
  },
  alternates: {
    canonical: "https://sanduta.art",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#2563eb" />
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID || ''}`}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_ID || ''}', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

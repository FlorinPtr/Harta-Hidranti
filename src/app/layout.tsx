import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Head from "next/head";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Harta Hidranti',
  description: 'Aplicație pentru localizarea hidranților',
  themeColor: '#da3939ff',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/favicon.ico',
    apple: '/icons/icon-192.png',
  },
  openGraph: {
    title: 'Harta Hidranti',
    description: 'Aplicație pentru localizarea hidranților',
    url: 'https://hartahidranti.vercel.app/',
    type: 'website',
    images: [{
      url: 'https://hartahidranti.vercel.app/icons/icon-512.png',
      alt: 'Harta Hidranti',
      type: 'image/png',
      width: 512,
      height: 512,
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Harta Hidranti',
    description: 'Aplicație pentru localizarea hidranților',
    images: ['https://hartahidranti.vercel.app/icons/icon-512.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro">

      {/* <Head>
        <title>Harta Hidranti</title>

        <meta
          name="description"
          content="Aplicație pentru localizarea hidranților"
        />

        <meta name="theme-color" content="#da3939ff" />

        <link
          rel="manifest"
          href="https://hartahidranti.vercel.app/manifest.json"
        />

        <link rel="icon" href="https://hartahidranti.vercel.app/favicon.ico" />

        <link
          rel="icon"
          type="image/x-icon"
          href="https://hartahidranti.vercel.app/favicon.ico"
        />

        <link
          rel="apple-touch-icon"
          href="https://hartahidranti.vercel.app/icons/icon-192.png"
        />
         <meta
            property="image"
            content="https://hartahidranti.vercel.app/icons/icon-512.png"
          />
          <meta
            property="image:alt"
            content="Harta Hidranti"
          />
          <meta property="og:title" content="Harta Hidranti" />
          <meta property="og:description" content="Aplicație pentru localizarea hidranților" />
          <meta
            property="og:image"
            content="https://hartahidranti.vercel.app/icons/icon-512.png"
          />
          <meta property="og:image:alt" content="Harta Hidranti" />
          <meta property="og:image:type" content="image/png" />
          <meta property="og:image:width" content="512" />
          <meta property="og:image:height" content="512" />
      </Head> */}

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants";
import "../globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Cairo } from "next/font/google";
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});
const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
});


export const metadata: Metadata = {
  title: `${SITE_NAME} — Book Local Selfcare Services`,
  description: SITE_DESCRIPTION,
  keywords: [
    "beauty",
    "salon",
    "spa",
    "massage",
    "barbershop",
    "booking",
    "selfcare",
  ],
  openGraph: {
    title: `${SITE_NAME} — Book Local Selfcare Services`,
    description: SITE_DESCRIPTION,
    type: "website",
  },
};

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  const messages = await getMessages({ locale });


  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"} className={inter.variable} >
      <body className="min-h-screen bg-white font-sans antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Navbar />
          <main id="main-content">{children}</main>
          {/* <Footer /> */}
        </NextIntlClientProvider>
      </body>
    </html >
  );
}
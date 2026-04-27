import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { PhoneRequirementProvider } from "@/components/auth/PhoneRequirementProvider";
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants";
import "../globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
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
  icons: {
    icon: 'public/logo.png',
    apple: 'public/logo.png',
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
      <body className="min-h-screen bg-white font-sans antialiased [&[data-register-page=true]_.site-footer]:hidden">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <PhoneRequirementProvider>
            <Navbar />
            <main id="main-content">{children}</main>
            <div className="site-footer">
              <Footer />
            </div>
          </PhoneRequirementProvider>
        </NextIntlClientProvider>
      </body>
    </html >
  );
}
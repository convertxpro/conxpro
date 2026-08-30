import type { Metadata, Viewport } from 'next';
import { Inter, Outfit, Noto_Nastaliq_Urdu } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/common/ThemeProvider';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { QuotaProvider } from '@/lib/rate-limit/use-quota';
import { QuotaLimitModal } from '@/components/common/QuotaLimitModal';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { AdSenseScript } from '@/components/ads/AdSenseScript';
import { ConsentBanner } from '@/components/common/ConsentBanner';
import { PwaInstallPrompt } from '@/components/common/PwaInstallPrompt';
import { siteConfig } from '@/config/site';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
});

const notoUrdu = Noto_Nastaliq_Urdu({
  subsets: ['arabic'],
  weight: ['400', '700'],
  variable: '--font-noto-urdu',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#090d16' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — Free Online File, Unit, Currency & Data Converter`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: siteConfig.author }],
  creator: siteConfig.author,
  publisher: siteConfig.name,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    title: `${siteConfig.name} — Free Online Converter`,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    site: '@ConvertHub',
    creator: '@ConvertHub',
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: siteConfig.name,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${outfit.variable} ${notoUrdu.variable}`}>
      <head>
        <AdSenseScript />
        {/* Organization Global JSON-LD Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: siteConfig.name,
              alternateName: siteConfig.shortName,
              url: siteConfig.url,
              logo: `${siteConfig.url}/icons/icon-512x512.png`,
              description: siteConfig.description,
              founder: {
                '@type': 'Organization',
                name: siteConfig.author,
              },
              sameAs: [
                siteConfig.links.twitter,
                siteConfig.links.github,
              ],
              contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'customer support',
                url: `${siteConfig.url}/contact`,
              },
            }),
          }}
        />
        {/* WebSite Global JSON-LD Schema with SearchAction */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: siteConfig.name,
              url: siteConfig.url,
              description: siteConfig.description,
              publisher: {
                '@type': 'Organization',
                name: siteConfig.name,
                logo: {
                  '@type': 'ImageObject',
                  url: `${siteConfig.url}/icons/icon-512x512.png`,
                },
              },
              potentialAction: {
                '@type': 'SearchAction',
                target: `${siteConfig.url}/search?q={search_term_string}`,
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased selection:bg-indigo-500 selection:text-white">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <QuotaProvider>
              <div className="relative flex min-h-screen flex-col">
                <Navbar />
                <div className="flex-1">{children}</div>
                <Footer />
              </div>
              <QuotaLimitModal />
              <ConsentBanner />
              <PwaInstallPrompt />
            </QuotaProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

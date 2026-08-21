import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from 'sonner';
import { Analytics } from "@vercel/analytics/next"

export const viewport: Viewport = {
  themeColor: '#171412',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://projectrevive.dev'),
  title: {
    default: 'Project Revive: Discover, Adopt & Revive Open Source Codebases',
    template: '%s | Project Revive',
  },
  description:
    'Discover abandoned repositories, dormant projects, and innovative open-source codebases looking for contributors, maintainers, and new owners.',
  keywords: [
    'open source',
    'abandoned projects',
    'codebase adoption',
    'open source revival',
    'github repositories',
    'find open source projects',
    'maintainer wanted',
    'developer collaboration',
    'react',
    'nextjs',
    'typescript',
    'python',
    'rust',
    'go',
  ],
  authors: [{ name: 'Project Revive Core Team' }],
  creator: 'Project Revive',
  publisher: 'Project Revive',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
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
    url: 'https://projectrevive.dev',
    siteName: 'Project Revive',
    title: 'Project Revive — Discover, Adopt & Revive Open Source Codebases',
    description:
      'Discover high-potential abandoned projects and open-source gems that deserve a second life. Connect directly with creators and take over maintenance.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Project Revive: Discover, Adopt & Revive Open Source Codebases',
    description:
      'Discover high-potential abandoned projects and open-source gems that deserve a second life. Vote weekly and negotiate repository transfers.',
  },
  alternates: {
    canonical: 'https://projectrevive.dev',
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://projectrevive.dev/#website',
      url: 'https://projectrevive.dev',
      name: 'GitRevive',
      description: 'Platform to discover, adopt, and contribute to abandoned and open-source codebases.',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://projectrevive.dev/?search={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'SoftwareApplication',
      '@id': 'https://projectrevive.dev/#application',
      name: 'GitRevive',
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Any',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      description: 'Find abandoned, half-built, and open-source projects looking for new maintainers.',
    },
    {
      '@type': 'Organization',
      '@id': 'https://projectrevive.dev/#organization',
      name: 'GitRevive',
      url: 'https://projectrevive.dev',
      logo: 'https://projectrevive.dev/logo.png',
      sameAs: ['https://github.com/17AnuragMishra/projectdirectory'],
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-background text-foreground antialiased min-h-screen overflow-x-hidden">
        {/* THESIS: ProjectRevive is a repository observatory where dormant codebases are detected, evaluated, and revived, refusing generic SaaS dashboards. OWN-WORLD: near-black ground, warm ivory type, ember orange revival pulse, and cool cyan technical signals. STORY: understand why great code shouldn't die, inspect a live repository timeline, explore curated revival stories, and filter the power directory. FIRST VIEWPORT: restrained top nav, editorial hero with contrasting typography, and an interactive SVG commit graph observatory. FORM: Observatory, code-led build. FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance */}
        {children}
        <Analytics />
        <Toaster position="top-right" theme="dark" richColors />
      </body>
    </html>
  );
}

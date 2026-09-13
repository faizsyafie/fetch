import type { Metadata } from "next";
import { Geist_Mono, Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://fetchforme.vercel.app";
const ogTitle = "fetch | Daily RSS Company Monitor";
const ogDescription = "A loyal retriever for the information age.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: ogTitle,
  description: ogDescription,
  icons: {
    icon: "/banner-icon-dog.png",
  },
  openGraph: {
    title: ogTitle,
    description: ogDescription,
    url: siteUrl,
    siteName: "fetch",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "fetch — Daily RSS",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: ogTitle,
    description: ogDescription,
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${poppins.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          // Applies the persisted theme before paint to avoid a flash of the
          // wrong theme. Mirrors useTheme.ts's readTheme()/isDarkTheme()
          // logic (duplicated rather than imported since this must run
          // standalone before hydration) — keep the two in sync.
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("credit-news-analyst-theme");if(t!=="light"&&t!=="dark"&&t!=="coral"&&t!=="midnight"&&t!=="sage"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}document.documentElement.setAttribute("data-theme",t);if(t==="dark"||t==="midnight"){document.documentElement.classList.add("dark");}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full bg-brand-50 font-sans text-brand-900 dark:bg-brand-900 dark:text-brand-100">
        {children}
      </body>
    </html>
  );
}

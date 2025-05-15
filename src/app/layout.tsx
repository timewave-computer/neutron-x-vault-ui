import type { Metadata } from "next";
import { Header, Footer, MobileDetection, Background } from "@/components";
import {
  VaultsConfigProvider,
  ToastProvider,
  WalletModalProvider,
} from "@/context";
import { Recursive } from "next/font/google";
import { readVaultsConfig } from "@/lib";
import "./globals.css";

import ReactQueryProviders from "@/context/ReactQueryProviders";
const recursive = Recursive({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-recursive",
});

/**
 * Application metadata configuration
 * Defines SEO and browser-related settings
 */
export const metadata: Metadata = {
  title: "X Vault Demo",
  description:
    "A modern web application for interacting with ERC-4626 vaults on Ethereum",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.svg",
  },
};

/**
 * Root layout component
 * Provides the basic structure for all pages:
 * - HTML and body tags
 * - Provider context
 * - Header and footer
 * - Main content area with responsive padding
 */
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const vaultsConfig = await readVaultsConfig();

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link href={recursive.style.fontFamily} rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        className={`${recursive.className} min-h-screen bg-white antialiased`}
      >
        {/* Background pattern - positioned at the bottom-most layer */}
        <Background />
        {/* ReactQueryProviders must be outside WalletModalProvider (expected by GrazProvider) */}
        <ReactQueryProviders>
          <WalletModalProvider>
            <VaultsConfigProvider vaultsConfig={vaultsConfig}>
              <MobileDetection>
                <ToastProvider>
                  <div className="flex flex-col min-h-screen relative">
                    <Header />
                    <main className="flex-1">
                      <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
                        {children}
                      </div>
                    </main>
                    <Footer />
                  </div>
                </ToastProvider>
              </MobileDetection>
            </VaultsConfigProvider>
          </WalletModalProvider>
        </ReactQueryProviders>
      </body>
    </html>
  );
}

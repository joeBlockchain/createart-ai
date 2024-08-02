import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"] });
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "CreateArt AI",
  description: "AI-Art generation tool.",
  keywords: [],
  authors: [{ name: "CreateArt AI Team" }],
  creator: "CreateArt AI",
  publisher: "CreateArt AI Inc.",
  openGraph: {
    title: "CreateArt AI: Revolutionize Your Art",
    description: "",
    url: "https://CreateArt-ai.com",
    siteName: "CreateArt AI",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CreateArt AI: AI-Powered Art Creation",
    description:
      "Elevate your productivity with intelligent task organization and prioritization",
    creator: "@CreateArt-AI",
  },
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-[calc(100dvh-4rem)] md:min-h[calc(100dvh-5rem)] bg-background font-sans antialiased",
          inter.className
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="">{children}</main>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

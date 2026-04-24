import type { Metadata } from "next";
import { Sora } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";
import { CartProvider } from "@/lib/store/cart-store";
import { cn } from "@/lib/utils";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sans"
});

export const metadata: Metadata = {
  title: "Savoria Table",
  description: "Modern restaurant QR ordering SaaS built with Next.js 14, TypeScript, Tailwind, and frontend-only local state."
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(sora.variable, "font-sans antialiased")}>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}

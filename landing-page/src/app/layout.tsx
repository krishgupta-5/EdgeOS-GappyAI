import "@/styles/globals.css";
import { cn } from "@/functions";
import { inter, satoshi } from "@/constants";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: {
        default: "ProdMate",
        template: "%s | ProdMate",
    },
    description: "AI-powered platform for creators and businesses.",
    icons: [
        {
            rel: "icon",
            type: "image/png",
            sizes: "32x32",
            url: "/icons/favicon-32x32.png",
        },
        {
            rel: "icon",
            type: "image/png",
            sizes: "16x16",
            url: "/icons/favicon-16x16.png",
        },
        {
            media: "(prefers-color-scheme: light)",
            url: "/icons/icon.png",
            href: "/icons/icon.png",
        },
        {
            media: "(prefers-color-scheme: dark)",
            url: "/icons/icon-white.png",
            href: "/icons/icon-white.png",
        }
    ]
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                suppressHydrationWarning
                className={cn(
                    "min-h-screen bg-background text-foreground antialiased font-default overflow-x-hidden !scrollbar-hide",
                    inter.variable,
                    satoshi.variable,
                )}
            >
                <Toaster
                    richColors
                    theme="dark"
                    position="top-right"
                />
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    );
}

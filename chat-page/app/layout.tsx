import type { Metadata } from "next";
import { inter, satoshi } from "@/constants";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import "./globals.css";

export const metadata: Metadata = {
  title: {
      default: "Edge OS",
      template: "%s | Edge OS",
  },
  description: "AI-powered platform for creators and businesses.",
  icons: [
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
    <html
      lang="en"
      className={`${inter.variable} ${satoshi.variable} font-sans h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <ClerkProvider
          appearance={{
            theme: dark,
            variables: {
              colorPrimary: "#EAEAEA",
              colorBackground: "#080808",
            },
          }}
        >
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}

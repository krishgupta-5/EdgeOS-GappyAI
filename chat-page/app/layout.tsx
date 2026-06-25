import type { Metadata } from "next";
import { inter, satoshi } from "@/constants";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import "./globals.css";

export const metadata: Metadata = {
  title: "EDGE-OS",
  description:
    "Build custom OS images for Intel Edge AI Suites with AI assistance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${satoshi.variable} font-heist h-full antialiased`}
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

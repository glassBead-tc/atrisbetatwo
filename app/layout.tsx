import "./globals.css";
import { Public_Sans } from "next/font/google";
import { Navbar } from "@/components/Navbar";

const publicSans = Public_Sans({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>LangChain + Next.js Template</title>
        <link rel="shortcut icon" href="/images/favicon.ico" />
        <meta
          name="description"
          content="Starter template showing how to use LangChain in Next.js projects. See source code and deploy your own at https://github.com/langchain-ai/langchain-nextjs-template!"
        />
        <meta property="og:title" content="LangChain + Next.js Template" />
        <meta
          property="og:description"
          content="Starter template showing how to use LangChain in Next.js projects. See source code and deploy your own at https://github.com/langchain-ai/langchain-nextjs-template!"
        />
        <meta property="og:image" content="/images/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="LangChain + Next.js Template" />
        <meta
          name="twitter:description"
          content="Starter template showing how to use LangChain in Next.js projects. See source code and deploy your own at https://github.com/langchain-ai/langchain-nextjs-template!"
        />
        <meta name="twitter:image" content="/images/og-image.png" />
      </head>
      <body className={`${publicSans.className} 
        bg-[var(--background-default)] text-[var(--text-default)]
        text-[var(--body-m-size)] leading-[var(--body-m-line)]
        font-[var(--font-weight-regular)]`}
      >
        <div className="flex flex-col p-[var(--spacing-l)] md:p-[var(--spacing-3xl)] h-[100vh]
          max-w-[1440px] mx-auto w-full"
        >
          <Navbar />
          {children}
        </div>
      </body>
    </html>
  );
}
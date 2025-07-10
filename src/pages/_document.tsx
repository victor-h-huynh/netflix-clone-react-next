import { Html, Head, Main, NextScript } from "next/document";
import { ThemeProvider } from "@/components/theme-provider";

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <Main />
          <NextScript />
        </ThemeProvider>
      </body>
    </Html>
  );
}

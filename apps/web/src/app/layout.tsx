import "./globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/Theme-provider";
import Header from "@/components/Header";
import { AuthProvider } from "@/context/auth-context";

export const metadata = {
  title: "ExcaliClone",
  description:
    "A simple clone of Excalidraw with sign-up and sign-in functionality",
};

const inter = Inter({ subsets: ["latin"] });

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log("Global Layout Loaded");
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <Header />
            <main className="container mx-auto px-4 py-8">{children}</main>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

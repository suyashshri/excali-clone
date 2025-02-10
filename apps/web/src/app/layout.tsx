import "./globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/Theme-provider";
import { AuthProvider } from "@/context/auth-context";
import ClientHeader from "@/components/ClientHeader";
import ClientMain from "@/components/ClientMain";
import { CanvasProvider } from "@/context/canvas-context";

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
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <ClientHeader />
            <ClientMain>{children}</ClientMain>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

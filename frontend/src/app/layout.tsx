import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SocketProvider } from "@/context/SocketContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { ToastContainer } from "@/components/ui/Toast";
import { PWARegistration } from "@/components/PWARegistration";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CommitteeMS — Committee Management System",
  description: "A premium SaaS-grade Committee Management System built with Next.js and MERN stack.",
  keywords: ["committee", "management", "meetings", "tasks", "SaaS"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CommitteeMS",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased min-h-screen relative overflow-x-hidden`}>
        {/* Ambient background */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100 via-white to-slate-50 dark:from-[#060814] dark:via-[#08091a] dark:to-[#060814]" />
          {/* Decorative blobs */}
          <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-indigo-500/8 dark:bg-indigo-500/6 blur-[100px]" />
          <div className="absolute top-1/3 right-0 h-[500px] w-[500px] rounded-full bg-purple-500/8 dark:bg-purple-500/5 blur-[120px]" />
          <div className="absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-pink-500/6 dark:bg-pink-500/4 blur-[100px]" />
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgwLDAsMCwwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] dark:opacity-20 opacity-60" />
        </div>

        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <SocketProvider>
            <AppLayout>{children}</AppLayout>
          </SocketProvider>
          <ToastContainer />
          <PWARegistration />
        </ThemeProvider>
      </body>
    </html>
  );
}

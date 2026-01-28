import type { Metadata } from "next";
import { Inter, Rajdhani } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/ui/sidebar";
import { Header } from "@/components/ui/header";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const rajdhani = Rajdhani({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700"],
    variable: "--font-rajdhani"
});

export const metadata: Metadata = {
    title: "Accelerate3D | Printer Farm Manager",
    description: "Advanced 3D Printer Fleet Management System",
};

import { QueuePoller } from "@/components/queue-poller";

// ... existing imports

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning className="dark">
            <body
                className={`${rajdhani.className} ${inter.variable} antialiased h-screen overflow-hidden bg-background text-foreground`}>
                <Providers>
                    <div className="flex w-full h-full overflow-hidden">
                        <Sidebar />

                        <main
                            className="flex-1 flex flex-col h-full overflow-hidden relative selection:bg-neon-red/30 selection:text-neon-red">
                            <Header />
                            <div
                                className="flex-1 overflow-auto p-6 scrollbar-thin scrollbar-thumb-zinc-800 hover:scrollbar-thumb-zinc-700">
                                {children}
                            </div>
                            <QueuePoller />


                            {/* Minimal Footer */}
                            <footer
                                className="py-2 px-6 border-t border-white/5 text-[10px] uppercase tracking-widest text-zinc-600 flex justify-between items-center bg-background/50 backdrop-blur-sm">
                                <span>Server Uptime: 24h 12m</span>
                                <span>v0.1.0-alpha</span>
                            </footer>
                        </main>
                    </div>
                </Providers>
            </body>
        </html>
    );
}

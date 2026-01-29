import type {Metadata} from "next";
import {Inter, Rajdhani} from "next/font/google";
import "./globals.css";
import {Providers} from "@/components/providers";

const inter = Inter({subsets: ["latin"], variable: "--font-inter"});
const rajdhani = Rajdhani({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700"],
    variable: "--font-rajdhani"
});

export const metadata: Metadata = {
    title: "Accelerate3D | Printer Farm Manager",
    description: "Advanced 3D Printer Fleet Management System",
};

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
            {children}
        </Providers>
        </body>
        </html>
    );
}

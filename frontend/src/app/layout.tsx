import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export const metadata: Metadata = {
  title: "Cognitive Echo Sentinel | AI Cognitive Health Assessment",
  description:
    "AI-powered cognitive health monitoring through voice biomarker analysis. Record your speech, detect acoustic changes, and receive real-time cognitive risk assessments.",
  keywords: [
    "cognitive health",
    "voice biomarkers",
    "AI healthcare",
    "speech analysis",
    "neurological assessment",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}

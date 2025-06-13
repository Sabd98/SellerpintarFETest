
import { Archivo, Archivo_Black } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import ClientWrapper from "@/components/layout/ClientWrapper";

const archivo = Archivo({
  weight: ["400"],
  subsets: ["latin"],
});

const archivoBlack = Archivo_Black({
  weight: ["400"],
  subsets: ["latin"],
});

export const metadata = {
  title: "The Journal - Design & Technology Insights",
  description:
    "Your daily dose of design insights, technology updates, and industry news",
};


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${archivo.variable} ${archivoBlack.variable} antialiased`}
      >
        <ClientWrapper>{children}</ClientWrapper>
        <Toaster />
      </body>
    </html>
  );
}

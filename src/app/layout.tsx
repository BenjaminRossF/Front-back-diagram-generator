import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Diagram Generator",
  description: "Create diagrams explaining communication between entities or layers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

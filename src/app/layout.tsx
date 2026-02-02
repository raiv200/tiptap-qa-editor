import type { Metadata } from "next";
import "./globals.css";
import { QuestionsProvider } from "@/context/QuestionsContext";

export const metadata: Metadata = {
  title: "Q&A Editor | TipTap Rich Text",
  description: "Interactive question and answer form with rich text editing capabilities",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google Fonts for Editor */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Courier+Prime:wght@400;700&family=Crimson+Text:wght@400;700&family=Dancing+Script:wght@400;700&family=Fira+Code:wght@400;700&family=Fira+Sans:wght@400;700&family=Great+Vibes&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;700&family=Josefin+Sans:wght@400;700&family=Lato:wght@400;700&family=Libre+Baskerville:wght@400;700&family=Lora:wght@400;700&family=Merriweather:wght@400;700&family=Montserrat:wght@400;700&family=Nunito:wght@400;700&family=Open+Sans:wght@400;700&family=Oswald:wght@400;700&family=PT+Sans:wght@400;700&family=Pacifico&family=Playfair+Display:wght@400;700&family=Poppins:wght@400;700&family=Quicksand:wght@400;700&family=Raleway:wght@400;700&family=Roboto:wght@400;700&family=Satisfy&family=Source+Code+Pro:wght@400;700&family=Source+Serif+Pro:wght@400;700&family=Ubuntu:wght@400;700&family=Work+Sans:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
       <QuestionsProvider>

       {children}
       </QuestionsProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { IM_Fell_English, IM_Fell_English_SC, Libre_Caslon_Text, Pinyon_Script } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

// The four period families of the brief's type table, declared once, here. next/font downloads them at build time and
// serves them from this app, so no visitor's browser calls Google. Latin only, and only the weights and styles used:
// the display face's italic is there for the Customer's name in the dialogue. Each sets a --face-* variable, which the
// theme stylesheet turns into its --font-* token (src/ui/theme.css).
const text = Libre_Caslon_Text({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--face-text",
});
const display = IM_Fell_English({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--face-display",
});
const displaySc = IM_Fell_English_SC({ subsets: ["latin"], weight: "400", variable: "--face-display-sc" });
const hand = Pinyon_Script({ subsets: ["latin"], weight: "400", variable: "--face-hand" });

export const metadata: Metadata = {
  title: "Lombard",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    // The --face-* variables sit on <html>, where the theme's tokens are worked out.
    <html lang="en" className={`${text.variable} ${display.variable} ${displaySc.variable} ${hand.variable}`}>
      {/* The page frame: the night room, the counter's oak edge, and its baize cloth, where every page is laid. */}
      <body className="flex min-h-dvh bg-night p-1 text-base text-candle sm:p-6">
        <div className="texture-oak flex flex-1 p-2 shadow-lifted sm:p-4">
          <div className="texture-baize min-w-0 flex-1 border border-brass p-2 sm:p-8">{children}</div>
        </div>
      </body>
    </html>
  );
}

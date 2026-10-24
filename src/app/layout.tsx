import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { RegisterServiceWorker } from "@/components/register-sw";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Print Paint Mixer",
  description: "Mix ratios from your Matou acrylic set for mini painting on 3D prints",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      style={{ colorScheme: "light" }}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <style
          dangerouslySetInnerHTML={{
            __html: `html{color-scheme:light}body{margin:0;min-height:100%;background:#f5f4f0;color:#1c1917;font-family:system-ui,sans-serif}`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function () {
  if (typeof navigator === "undefined") return;
  var host = location.hostname;
  var isLocal = host === "localhost" || host === "127.0.0.1";
  if (!isLocal && location.protocol !== "file:") return;
  if (navigator.serviceWorker) {
    navigator.serviceWorker.getRegistrations().then(function (regs) {
      regs.forEach(function (r) { r.unregister(); });
    });
  }
  if (window.caches) {
    caches.keys().then(function (keys) {
      keys.forEach(function (k) { caches.delete(k); });
    });
  }
})();
`,
          }}
        />
        <RegisterServiceWorker />
        {children}
      </body>
    </html>
  );
}

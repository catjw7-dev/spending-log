import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "용돈 기입장",
  description: "내 소비를 한눈에",
  manifest: "/manifest.json",
  themeColor: "#3185FC",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "기입장",
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-toss-bg">
        <div className="max-w-[430px] mx-auto min-h-screen bg-toss-bg">
          {children}
        </div>
      </body>
    </html>
  );
}

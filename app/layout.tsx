import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://skku-cafe-finder.kitty13257.chatgpt.site"),
  title: "SKKU Study Cafe Finder | 성균관대 카공 지도",
  description: "명륜·율전 캠퍼스를 선택하고 실제 위치 지도에서 콘센트·소음·좌석·테이블 조건에 맞는 카페를 찾아보세요.",
  openGraph: {
    title: "SKKU Study Cafe Finder",
    description: "명륜·율전 캠퍼스를 선택하고 실제 위치 지도에서 공부 조건에 맞는 카페를 찾아보세요.",
    images: ["/og-mascot-map.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "SKKU Study Cafe Finder",
    description: "명륜·율전 캠퍼스를 선택하고 실제 위치 지도에서 공부 조건에 맞는 카페를 찾아보세요.",
    images: ["/og-mascot-map.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}

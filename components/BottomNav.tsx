"use client";

import { useRouter } from "next/navigation";
import { Home, BarChart2, CalendarDays, Sparkles, Settings, PiggyBank } from "lucide-react";

type Tab = "home" | "stats" | "calendar" | "ai" | "budget" | "settings";

export default function BottomNav({ active }: { active: Tab }) {
  const router = useRouter();

  const tabs: { id: Tab; label: string; icon: React.ReactNode; path: string }[] = [
    { id: "home", label: "홈", icon: <Home size={20} />, path: "/" },
    { id: "stats", label: "통계", icon: <BarChart2 size={20} />, path: "/stats" },
    { id: "budget", label: "예산", icon: <PiggyBank size={20} />, path: "/budget" },
    { id: "calendar", label: "캘린더", icon: <CalendarDays size={20} />, path: "/calendar" },
    { id: "ai", label: "AI", icon: <Sparkles size={20} />, path: "/ai" },
    { id: "settings", label: "설정", icon: <Settings size={20} />, path: "/settings" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 flex justify-center">
      <nav className="w-full max-w-[430px] bg-white dark:bg-toss-card-dark border-t border-toss-border dark:border-toss-border-dark">
        <div className="flex">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => router.push(tab.path)}
              className={`flex-1 flex flex-col items-center py-3 gap-1 transition-colors ${active === tab.id ? "text-toss-blue" : "text-toss-text-4"}`}>
              {tab.icon}
              <span className="text-[9px] font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
        <div style={{ height: "env(safe-area-inset-bottom, 0px)" }} />
      </nav>
    </div>
  );
}

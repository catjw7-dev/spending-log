"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Moon, Sun, Bell, RefreshCw, ChevronRight, Sparkles } from "lucide-react";
import { getTheme, setTheme } from "@/lib/theme";
import BottomNav from "@/components/BottomNav";

export default function SettingsPage() {
  const router = useRouter();
  const [dark, setDark] = useState(false);
  const [notif, setNotif] = useState(false);

  useEffect(() => {
    setDark(getTheme() === "dark");
    if ("Notification" in window) setNotif(Notification.permission === "granted");
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    setTheme(next ? "dark" : "light");
  };

  const requestNotif = async () => {
    const result = await Notification.requestPermission();
    setNotif(result === "granted");
  };

  const Row = ({ icon, label, onClick, children }: { icon: React.ReactNode; label: string; onClick?: () => void; children: React.ReactNode }) => (
    <button onClick={onClick} className="w-full flex items-center justify-between px-5 py-4 border-b border-toss-border dark:border-toss-border-dark last:border-0 hover:bg-toss-bg dark:hover:bg-toss-bg-dark transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-toss-bg dark:bg-toss-bg-dark flex items-center justify-center text-toss-text-3">
          {icon}
        </div>
        <span className="text-[15px] font-medium text-toss-text dark:text-white">{label}</span>
      </div>
      {children}
    </button>
  );

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-toss-bg dark:bg-[#0d1117]">
      <div className="bg-white dark:bg-toss-card-dark px-5 pt-14 pb-5 sticky top-0 z-10 shadow-sm">
        <h1 className="text-[17px] font-semibold text-toss-text dark:text-white">설정</h1>
      </div>

      <div className="px-4 pt-4 space-y-3">
        {/* 화면 */}
        <div className="bg-white dark:bg-toss-card-dark rounded-2xl shadow-card overflow-hidden">
          <p className="text-[12px] font-medium text-toss-text-4 px-5 pt-4 pb-2">화면</p>
          <Row icon={dark ? <Moon size={16} /> : <Sun size={16} />} label="다크모드">
            <button onClick={toggleDark}
              className={`relative w-12 h-6 rounded-full transition-colors ${dark ? "bg-toss-blue" : "bg-toss-border"}`}>
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${dark ? "translate-x-6" : "translate-x-0.5"}`} />
            </button>
          </Row>
        </div>

        {/* 알림 */}
        <div className="bg-white dark:bg-toss-card-dark rounded-2xl shadow-card overflow-hidden">
          <p className="text-[12px] font-medium text-toss-text-4 px-5 pt-4 pb-2">알림</p>
          <Row icon={<Bell size={16} />} label="푸시 알림">
            {notif ? (
              <span className="text-[13px] text-toss-green font-medium">허용됨</span>
            ) : (
              <button onClick={requestNotif} className="px-3 py-1.5 bg-toss-blue text-white text-[12px] font-medium rounded-full">
                허용하기
              </button>
            )}
          </Row>
        </div>

        {/* 기능 */}
        <div className="bg-white dark:bg-toss-card-dark rounded-2xl shadow-card overflow-hidden">
          <p className="text-[12px] font-medium text-toss-text-4 px-5 pt-4 pb-2">기능</p>
          <Row icon={<RefreshCw size={16} />} label="반복 내역" onClick={() => router.push("/recurring")}>
            <ChevronRight size={16} className="text-toss-text-5" />
          </Row>
          <Row icon={<Sparkles size={16} />} label="AI 소비 분석" onClick={() => router.push("/ai")}>
            <ChevronRight size={16} className="text-toss-text-5" />
          </Row>
        </div>

        <p className="text-center text-[12px] text-toss-text-5 py-4">용돈 기입장 v1.0.0</p>
      </div>

      <BottomNav active="settings" />
    </div>
  );
}

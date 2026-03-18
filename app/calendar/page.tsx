"use client";

import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Transaction, getCategoryEmoji } from "@/types";
import { getTransactions, formatKRW, getMonthKey, getMonthLabel } from "@/lib/storage";
import BottomNav from "@/components/BottomNav";

function addMonths(date: Date, n: number) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
}

export default function CalendarPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTransactions().then(txs => { setTransactions(txs); setLoading(false); });
  }, []);

  const monthKey = getMonthKey(currentMonth);

  const monthlyTxs = useMemo(() =>
    transactions.filter(t => t.date.startsWith(monthKey)),
    [transactions, monthKey]
  );

  // 날짜별 수입/지출 합계
  const dayMap = useMemo(() => {
    const map: Record<string, { income: number; expense: number; txs: Transaction[] }> = {};
    monthlyTxs.forEach(t => {
      if (!map[t.date]) map[t.date] = { income: 0, expense: 0, txs: [] };
      if (t.type === "income") map[t.date].income += t.amount;
      else map[t.date].expense += t.amount;
      map[t.date].txs.push(t);
    });
    return map;
  }, [monthlyTxs]);

  // 달력 날짜 계산
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  }, [currentMonth]);

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;

  const getDateStr = (day: number) =>
    `${currentMonth.getFullYear()}-${String(currentMonth.getMonth()+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;

  const selectedTxs = selectedDate ? (dayMap[selectedDate]?.txs ?? []) : [];

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-toss-bg dark:bg-[#0d1117]">
      <div className="bg-white dark:bg-toss-card-dark px-5 pt-14 pb-5 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between">
          <button onClick={() => setCurrentMonth(p => addMonths(p, -1))} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-toss-bg transition-colors">
            <ChevronLeft size={20} className="text-toss-text-3" />
          </button>
          <span className="text-[17px] font-semibold text-toss-text dark:text-white">{getMonthLabel(monthKey)}</span>
          <button onClick={() => setCurrentMonth(p => addMonths(p, 1))} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-toss-bg transition-colors">
            <ChevronRight size={20} className="text-toss-text-3" />
          </button>
        </div>
      </div>

      <div className="px-4 pt-4">
        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 mb-2">
          {["일","월","화","수","목","금","토"].map((d, i) => (
            <div key={d} className={`text-center text-[12px] font-medium py-1 ${i === 0 ? "text-toss-red" : i === 6 ? "text-toss-blue" : "text-toss-text-4"}`}>{d}</div>
          ))}
        </div>

        {/* 달력 그리드 */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {calendarDays.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} />;
            const dateStr = getDateStr(day);
            const data = dayMap[dateStr];
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDate;
            const dow = (i) % 7;

            return (
              <button key={dateStr} onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                className={`relative flex flex-col items-center py-1.5 px-0.5 rounded-xl transition-all ${isSelected ? "bg-toss-blue" : isToday ? "bg-toss-blue-light dark:bg-blue-900/30" : "hover:bg-toss-bg dark:hover:bg-toss-bg-dark"}`}>
                <span className={`text-[13px] font-medium ${isSelected ? "text-white" : isToday ? "text-toss-blue" : dow === 0 ? "text-toss-red" : dow === 6 ? "text-toss-blue" : "text-toss-text dark:text-white"}`}>
                  {day}
                </span>
                {data && (
                  <div className="flex flex-col items-center gap-0.5 mt-0.5 w-full">
                    {data.income > 0 && (
                      <span className={`text-[9px] font-medium truncate w-full text-center ${isSelected ? "text-green-200" : "text-toss-green"}`}>
                        +{Math.round(data.income/1000)}K
                      </span>
                    )}
                    {data.expense > 0 && (
                      <span className={`text-[9px] font-medium truncate w-full text-center ${isSelected ? "text-red-200" : "text-toss-red"}`}>
                        -{Math.round(data.expense/1000)}K
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* 선택된 날짜 내역 */}
        {selectedDate && (
          <div className="bg-white dark:bg-toss-card-dark rounded-2xl shadow-card overflow-hidden">
            <p className="text-[13px] font-medium text-toss-text-4 px-4 pt-4 pb-2">
              {parseInt(selectedDate.split("-")[1])}월 {parseInt(selectedDate.split("-")[2])}일
            </p>
            {selectedTxs.length === 0 ? (
              <p className="text-[14px] text-toss-text-5 px-4 pb-4">내역이 없어요</p>
            ) : (
              selectedTxs.map((tx, i) => (
                <div key={tx.id} className={`flex items-center px-4 py-3 ${i < selectedTxs.length - 1 ? "border-b border-toss-border dark:border-toss-border-dark" : ""}`}>
                  <div className="w-9 h-9 rounded-full bg-toss-bg dark:bg-toss-bg-dark flex items-center justify-center text-lg mr-3 flex-shrink-0">
                    {getCategoryEmoji(tx.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium text-toss-text dark:text-white truncate">{tx.description}</p>
                    <p className="text-[11px] text-toss-text-4 mt-0.5">{tx.category}</p>
                  </div>
                  <p className={`text-[14px] font-semibold ${tx.type === "income" ? "text-toss-green" : "text-toss-red"}`}>
                    {tx.type === "income" ? "+" : "-"}{formatKRW(tx.amount)}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <BottomNav active="home" />
    </div>
  );
}

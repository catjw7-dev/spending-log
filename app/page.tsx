"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { Transaction, getCategoryEmoji } from "@/types";
import { getTransactions, deleteTransaction, formatKRW, getMonthKey, getMonthLabel } from "@/lib/storage";
import BottomNav from "@/components/BottomNav";

function addMonths(date: Date, n: number) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
}

export default function HomePage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const txs = await getTransactions();
    setTransactions(txs);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const monthKey = getMonthKey(currentMonth);

  const monthlyTxs = useMemo(
    () => transactions.filter((t) => t.date.startsWith(monthKey)),
    [transactions, monthKey]
  );

  const income = useMemo(
    () => monthlyTxs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0),
    [monthlyTxs]
  );
  const expense = useMemo(
    () => monthlyTxs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0),
    [monthlyTxs]
  );
  const balance = income - expense;

  const grouped = useMemo(() => {
    const map: Record<string, Transaction[]> = {};
    [...monthlyTxs].sort((a, b) => b.date.localeCompare(a.date)).forEach((t) => {
      if (!map[t.date]) map[t.date] = [];
      map[t.date].push(t);
    });
    return Object.entries(map).sort((a, b) => b[0].localeCompare(a[0]));
  }, [monthlyTxs]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    return `${parseInt(dateStr.split("-")[1])}월 ${parseInt(dateStr.split("-")[2])}일 ${days[d.getDay()]}요일`;
  };

  const isTodaySimple = (dateStr: string) => {
    const today = new Date();
    return dateStr === `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen pb-24">
      {/* Header */}
      <div className="bg-white px-5 pt-14 pb-6 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => setCurrentMonth((p) => addMonths(p, -1))}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-toss-bg transition-colors"
          >
            <ChevronLeft size={20} className="text-toss-text-3" />
          </button>
          <span className="text-[17px] font-semibold text-toss-text">
            {getMonthLabel(monthKey)}
          </span>
          <button
            onClick={() => setCurrentMonth((p) => addMonths(p, 1))}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-toss-bg transition-colors"
          >
            <ChevronRight size={20} className="text-toss-text-3" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-toss-bg rounded-2xl px-4 py-3">
            <p className="text-[11px] text-toss-text-4 mb-1">수입</p>
            <p className="text-[15px] font-semibold text-toss-green">+{formatKRW(income)}</p>
          </div>
          <div className="bg-toss-bg rounded-2xl px-4 py-3">
            <p className="text-[11px] text-toss-text-4 mb-1">지출</p>
            <p className="text-[15px] font-semibold text-toss-red">-{formatKRW(expense)}</p>
          </div>
          <div className="bg-toss-bg rounded-2xl px-4 py-3">
            <p className="text-[11px] text-toss-text-4 mb-1">잔액</p>
            <p className={`text-[15px] font-semibold ${balance >= 0 ? "text-toss-text" : "text-toss-red"}`}>
              {balance >= 0 ? "" : "-"}{formatKRW(balance)}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 pt-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-6 h-6 border-2 border-toss-blue border-t-transparent rounded-full animate-spin" />
            <p className="text-[13px] text-toss-text-4">불러오는 중...</p>
          </div>
        ) : grouped.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl mb-4">💸</div>
            <p className="text-[15px] font-medium text-toss-text-3">이번 달 내역이 없어요</p>
            <p className="text-[13px] text-toss-text-5 mt-1">아래 + 버튼으로 추가해보세요</p>
          </div>
        ) : (
          grouped.map(([date, txs]) => {
            const dayIncome = txs.filter(t => t.type === "income").reduce((s,t)=>s+t.amount,0);
            const dayExpense = txs.filter(t => t.type === "expense").reduce((s,t)=>s+t.amount,0);
            return (
              <div key={date} className="mb-5">
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className="text-[13px] font-medium text-toss-text-4">
                    {isTodaySimple(date) ? "오늘" : formatDate(date)}
                  </span>
                  <div className="flex gap-2 text-[12px]">
                    {dayIncome > 0 && <span className="text-toss-green">+{formatKRW(dayIncome)}</span>}
                    {dayExpense > 0 && <span className="text-toss-red">-{formatKRW(dayExpense)}</span>}
                  </div>
                </div>
                <div className="bg-white rounded-2xl overflow-hidden shadow-card">
                  {txs.map((tx, i) => (
                    <div
                      key={tx.id}
                      className={`flex items-center px-4 py-3.5 ${i < txs.length - 1 ? "border-b border-toss-border" : ""} ${deletingId === tx.id ? "opacity-40" : ""} transition-opacity`}
                    >
                      <div className="w-10 h-10 rounded-full bg-toss-bg flex items-center justify-center text-xl mr-3 flex-shrink-0">
                        {getCategoryEmoji(tx.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[15px] font-medium text-toss-text truncate">{tx.description}</p>
                        <p className="text-[12px] text-toss-text-4 mt-0.5">{tx.category}</p>
                      </div>
                      <p className={`text-[15px] font-semibold mr-3 ${tx.type === "income" ? "text-toss-green" : "text-toss-red"}`}>
                        {tx.type === "income" ? "+" : "-"}{formatKRW(tx.amount)}
                      </p>
                      <button
                        onClick={() => handleDelete(tx.id)}
                        disabled={deletingId === tx.id}
                        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-toss-bg transition-colors flex-shrink-0"
                      >
                        <Trash2 size={14} className="text-toss-text-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      <button
        onClick={() => router.push("/add")}
        className="fixed bottom-24 right-4 w-14 h-14 bg-toss-blue rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform z-20"
        style={{ boxShadow: "0 4px 20px rgba(49,130,246,0.45)" }}
      >
        <Plus size={26} className="text-white" strokeWidth={2.5} />
      </button>

      <BottomNav active="home" />
    </div>
  );
}

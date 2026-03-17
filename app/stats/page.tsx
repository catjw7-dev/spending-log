"use client";

import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { Transaction, getCategoryEmoji } from "@/types";
import { getTransactions, formatKRW, getMonthKey, getMonthLabel } from "@/lib/storage";
import BottomNav from "@/components/BottomNav";

function addMonths(date: Date, n: number) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
}

const PIE_COLORS = ["#3182F6","#00B493","#F04452","#F7C244","#8B95A1","#7C3AED","#EA580C","#0891B2","#65A30D"];

export default function StatsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTransactions().then((txs) => { setTransactions(txs); setLoading(false); });
  }, []);

  const monthKey = getMonthKey(currentMonth);
  const monthlyTxs = useMemo(() => transactions.filter((t) => t.date.startsWith(monthKey)), [transactions, monthKey]);
  const income = useMemo(() => monthlyTxs.filter(t=>t.type==="income").reduce((s,t)=>s+t.amount,0), [monthlyTxs]);
  const expense = useMemo(() => monthlyTxs.filter(t=>t.type==="expense").reduce((s,t)=>s+t.amount,0), [monthlyTxs]);

  const catData = useMemo(() => {
    const map: Record<string, number> = {};
    monthlyTxs.filter(t=>t.type==="expense").forEach(t => { map[t.category] = (map[t.category] || 0) + t.amount; });
    return Object.entries(map).sort((a,b)=>b[1]-a[1]).map(([name, value]) => ({ name, value }));
  }, [monthlyTxs]);

  const barData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = addMonths(currentMonth, i - 5);
      const key = getMonthKey(d);
      const txs = transactions.filter(t => t.date.startsWith(key));
      return {
        month: `${parseInt(key.split("-")[1])}월`,
        income: txs.filter(t=>t.type==="income").reduce((s,t)=>s+t.amount,0),
        expense: txs.filter(t=>t.type==="expense").reduce((s,t)=>s+t.amount,0),
      };
    });
  }, [transactions, currentMonth]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
      return (
        <div className="bg-white rounded-xl px-3 py-2 shadow-card-hover border border-toss-border">
          {payload.map((p: any) => (
            <p key={p.name} style={{ color: p.color }} className="text-[12px] font-semibold">
              {p.name === "income" ? "수입" : "지출"}: {formatKRW(p.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-toss-bg">
      <div className="w-6 h-6 border-2 border-toss-blue border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-toss-bg">
      <div className="bg-white px-5 pt-14 pb-5 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between">
          <button onClick={() => setCurrentMonth(p => addMonths(p, -1))} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-toss-bg transition-colors">
            <ChevronLeft size={20} className="text-toss-text-3" />
          </button>
          <span className="text-[17px] font-semibold text-toss-text">{getMonthLabel(monthKey)}</span>
          <button onClick={() => setCurrentMonth(p => addMonths(p, 1))} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-toss-bg transition-colors">
            <ChevronRight size={20} className="text-toss-text-3" />
          </button>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        <div className="bg-white rounded-2xl p-5 shadow-card">
          <p className="text-[13px] text-toss-text-4 mb-4 font-medium">이번 달 요약</p>
          <div className="flex justify-between">
            <div>
              <p className="text-[12px] text-toss-text-4">수입</p>
              <p className="text-[22px] font-bold text-toss-green mt-1">+{formatKRW(income)}</p>
            </div>
            <div className="text-right">
              <p className="text-[12px] text-toss-text-4">지출</p>
              <p className="text-[22px] font-bold text-toss-red mt-1">-{formatKRW(expense)}</p>
            </div>
          </div>
          {income > 0 && (
            <div className="mt-4">
              <div className="h-2 bg-toss-bg rounded-full overflow-hidden">
                <div className="h-full bg-toss-red rounded-full transition-all duration-500" style={{ width: `${Math.min(100, Math.round((expense / income) * 100))}%` }} />
              </div>
              <p className="text-[11px] text-toss-text-4 mt-1.5">수입 대비 지출 {Math.min(100, Math.round((expense / income) * 100))}%</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-card">
          <p className="text-[13px] text-toss-text-4 mb-4 font-medium">6개월 추이</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={barData} barSize={12} barGap={4}>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#8B95A1" }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "#F2F4F6" }} />
              <Bar dataKey="income" fill="#00B493" radius={[4,4,0,0]} />
              <Bar dataKey="expense" fill="#F04452" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-toss-green" /><span className="text-[11px] text-toss-text-4">수입</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-toss-red" /><span className="text-[11px] text-toss-text-4">지출</span></div>
          </div>
        </div>

        {catData.length > 0 ? (
          <div className="bg-white rounded-2xl p-5 shadow-card">
            <p className="text-[13px] text-toss-text-4 mb-4 font-medium">카테고리별 지출</p>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={catData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={2}>
                  {catData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => formatKRW(v)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2.5 mt-2">
              {catData.map((cat, i) => (
                <div key={cat.name} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-toss-bg flex items-center justify-center text-[14px] flex-shrink-0">{getCategoryEmoji(cat.name)}</div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-[13px] font-medium text-toss-text">{cat.name}</span>
                      <span className="text-[13px] font-semibold text-toss-text">{formatKRW(cat.value)}</span>
                    </div>
                    <div className="h-1.5 bg-toss-bg rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${Math.round((cat.value / expense) * 100)}%`, backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-10 shadow-card text-center">
            <p className="text-[15px] text-toss-text-4">이번 달 지출 내역이 없어요</p>
          </div>
        )}
      </div>

      <BottomNav active="stats" />
    </div>
  );
}

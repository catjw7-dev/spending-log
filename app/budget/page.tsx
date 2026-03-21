"use client";

import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, Pencil, Check, X } from "lucide-react";
import { Transaction, EXPENSE_CATEGORIES, Budget } from "@/types";
import { getTransactions, getBudgets, upsertBudget, deleteBudget, formatKRW, getMonthKey, getMonthLabel } from "@/lib/storage";
import BottomNav from "@/components/BottomNav";

function addMonths(date: Date, n: number) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
}

function GaugeChart({ spent, budget }: { spent: number; budget: number }) {
  const pct = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0;
  // 240도 호 (시작: 150도, 끝: 390도)
  const radius = 80;
  const cx = 110;
  const cy = 110;
  const startAngle = 150;
  const totalAngle = 240;
  const angle = startAngle + (totalAngle * pct) / 100;

  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const arcPath = (start: number, end: number, r: number) => {
    const s = { x: cx + r * Math.cos(toRad(start)), y: cy + r * Math.sin(toRad(start)) };
    const e = { x: cx + r * Math.cos(toRad(end)), y: cy + r * Math.sin(toRad(end)) };
    const large = end - start > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
  };

  const color = pct >= 100 ? "#F04452" : pct >= 80 ? "#F7C244" : "#00B493";

  return (
    <svg viewBox="0 0 220 160" className="w-full max-w-[260px] mx-auto">
      {/* 배경 트랙 */}
      <path d={arcPath(150, 390, radius)} fill="none" stroke="#E5E8EB" strokeWidth="14" strokeLinecap="round" className="dark:stroke-[#30363d]" />
      {/* 게이지 */}
      {pct > 0 && (
        <path d={arcPath(150, angle, radius)} fill="none" stroke={color} strokeWidth="14" strokeLinecap="round" />
      )}
      {/* 중앙 % */}
      <text x={cx} y={cy + 8} textAnchor="middle" fontSize="32" fontWeight="700" fill={color} fontFamily="Pretendard, sans-serif">
        {Math.round(pct)}%
      </text>
      {/* 하단 빈 공간 - 사용금액 / 예산 */}
      <text x={cx} y={cy + 48} textAnchor="middle" fontSize="13" fontWeight="600" fill={color} fontFamily="Pretendard, sans-serif">
        {formatKRW(spent)}
      </text>
      <line x1={cx - 20} y1={cy + 54} x2={cx + 20} y2={cy + 54} stroke="#8B95A1" strokeWidth="1" />
      <text x={cx} y={cy + 66} textAnchor="middle" fontSize="13" fill="#8B95A1" fontFamily="Pretendard, sans-serif">
        {budget > 0 ? formatKRW(budget) : "미설정"}
      </text>
    </svg>
  );
}

export default function BudgetPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [totalBudgetEdit, setTotalBudgetEdit] = useState(false);
  const [totalBudgetValue, setTotalBudgetValue] = useState("");

  useEffect(() => {
    Promise.all([getTransactions(), getBudgets()]).then(([txs, buds]) => {
      setTransactions(txs); setBudgets(buds); setLoading(false);
    });
  }, []);

  const monthKey = getMonthKey(currentMonth);

  const monthlyExpenses = useMemo(() => {
    const map: Record<string, number> = {};
    transactions.filter(t => t.type === "expense" && t.date.startsWith(monthKey))
      .forEach(t => { map[t.category] = (map[t.category] || 0) + t.amount; });
    return map;
  }, [transactions, monthKey]);

  const totalExpense = useMemo(() => Object.values(monthlyExpenses).reduce((s, v) => s + v, 0), [monthlyExpenses]);

  const getBudgetAmt = (cat: string) =>
    budgets.find(b => b.category === cat && b.month === monthKey)?.amount ?? 0;

  const handleUpsert = async (cat: string, amount: number) => {
    if (amount > 0) {
      const b: Budget = { category: cat, amount, month: monthKey };
      await upsertBudget(b);
      setBudgets(prev => [...prev.filter(x => !(x.category === cat && x.month === monthKey)), b]);
    } else {
      await deleteBudget(cat, monthKey);
      setBudgets(prev => prev.filter(x => !(x.category === cat && x.month === monthKey)));
    }
  };

  const saveEdit = async (cat: string) => {
    const amt = parseInt(editValue) || 0;
    await handleUpsert(cat, amt);
    setEditingCat(null);
    setEditValue("");
  };

  const totalBudget = getBudgetAmt("__total__");
  const totalPct = totalBudget > 0 ? Math.min(100, Math.round((totalExpense / totalBudget) * 100)) : 0;

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-toss-bg dark:bg-[#0d1117]">
      <div className="w-6 h-6 border-2 border-toss-blue border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-toss-bg dark:bg-[#0d1117]">
      <div className="bg-white dark:bg-toss-card-dark px-5 pt-14 pb-5 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between">
          <button onClick={() => setCurrentMonth(p => addMonths(p, -1))} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-toss-bg dark:hover:bg-toss-bg-dark transition-colors">
            <ChevronLeft size={20} className="text-toss-text-3" />
          </button>
          <span className="text-[17px] font-semibold text-toss-text dark:text-white">{getMonthLabel(monthKey)}</span>
          <button onClick={() => setCurrentMonth(p => addMonths(p, 1))} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-toss-bg dark:hover:bg-toss-bg-dark transition-colors">
            <ChevronRight size={20} className="text-toss-text-3" />
          </button>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* 총 예산 게이지 카드 */}
        <div className="bg-white dark:bg-toss-card-dark rounded-2xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[13px] font-medium text-toss-text-4">이번 달 총 예산</p>
            <button onClick={() => { setTotalBudgetEdit(true); setTotalBudgetValue(totalBudget > 0 ? String(totalBudget) : ""); }}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-toss-bg dark:hover:bg-toss-bg-dark">
              <Pencil size={14} className="text-toss-text-4" />
            </button>
          </div>

          {totalBudgetEdit ? (
            <div className="flex items-center gap-2 py-3">
              <input autoFocus type="text" inputMode="numeric" placeholder="예산 입력"
                value={totalBudgetValue ? new Intl.NumberFormat("ko-KR").format(parseInt(totalBudgetValue) || 0) : ""}
                onChange={e => setTotalBudgetValue(e.target.value.replace(/[^0-9]/g, ""))}
                className="flex-1 text-[20px] font-bold text-toss-text dark:text-white bg-toss-bg dark:bg-toss-bg-dark rounded-xl px-3 py-2 outline-none" />
              <button onClick={async () => { await handleUpsert("__total__", parseInt(totalBudgetValue) || 0); setTotalBudgetEdit(false); }}
                className="w-8 h-8 bg-toss-blue rounded-full flex items-center justify-center flex-shrink-0">
                <Check size={14} className="text-white" />
              </button>
              <button onClick={() => setTotalBudgetEdit(false)}
                className="w-8 h-8 bg-toss-bg dark:bg-toss-bg-dark rounded-full flex items-center justify-center flex-shrink-0">
                <X size={14} className="text-toss-text-3" />
              </button>
            </div>
          ) : (
            <GaugeChart spent={totalExpense} budget={totalBudget} />
          )}

          {totalBudget > 0 && !totalBudgetEdit && (
            <p className={`text-center text-[12px] mt-1 font-medium ${totalPct >= 100 ? "text-toss-red" : totalPct >= 80 ? "text-toss-yellow" : "text-toss-text-4"}`}>
              {totalPct >= 100 ? "예산을 초과했어요 😅" : `남은 예산 ${formatKRW(totalBudget - totalExpense)}`}
            </p>
          )}

          {totalBudget === 0 && !totalBudgetEdit && (
            <p className="text-center text-[13px] text-toss-text-5 mt-1">연필 버튼을 눌러 예산을 설정해보세요</p>
          )}
        </div>

        {/* 카테고리별 예산 */}
        <div className="bg-white dark:bg-toss-card-dark rounded-2xl shadow-card overflow-hidden">
          <p className="text-[13px] font-medium text-toss-text-4 px-5 pt-5 pb-3">카테고리별 예산</p>
          {EXPENSE_CATEGORIES.map((cat, i) => {
            const spent = monthlyExpenses[cat.id] || 0;
            const budget = getBudgetAmt(cat.id);
            const pct = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;
            const isEditing = editingCat === cat.id;
            return (
              <div key={cat.id} className={`px-5 py-3.5 ${i < EXPENSE_CATEGORIES.length - 1 ? "border-b border-toss-border dark:border-toss-border-dark" : ""}`}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-toss-bg dark:bg-toss-bg-dark flex items-center justify-center text-[16px] flex-shrink-0">{cat.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[14px] font-medium text-toss-text dark:text-white">{cat.label}</span>
                      {isEditing ? (
                        <div className="flex items-center gap-1.5">
                          <input autoFocus type="text" inputMode="numeric" placeholder="금액"
                            value={editValue ? new Intl.NumberFormat("ko-KR").format(parseInt(editValue) || 0) : ""}
                            onChange={e => setEditValue(e.target.value.replace(/[^0-9]/g, ""))}
                            className="w-28 text-[13px] bg-toss-bg dark:bg-toss-bg-dark rounded-lg px-2 py-1 outline-none text-right text-toss-text dark:text-white" />
                          <button onClick={() => saveEdit(cat.id)} className="w-6 h-6 bg-toss-blue rounded-full flex items-center justify-center"><Check size={12} className="text-white" /></button>
                          <button onClick={() => setEditingCat(null)} className="w-6 h-6 bg-toss-bg dark:bg-toss-bg-dark rounded-full flex items-center justify-center"><X size={12} className="text-toss-text-3" /></button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] text-toss-text-4">
                            {spent > 0 && <span className={`font-medium ${pct >= 100 ? "text-toss-red" : "text-toss-text-3 dark:text-white"}`}>{formatKRW(spent)}</span>}
                            {budget > 0 && <span className="text-toss-text-5"> / {formatKRW(budget)}</span>}
                            {budget === 0 && spent === 0 && <span className="text-toss-text-5">미설정</span>}
                          </span>
                          <button onClick={() => { setEditingCat(cat.id); setEditValue(budget > 0 ? String(budget) : ""); }}
                            className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-toss-bg dark:hover:bg-toss-bg-dark">
                            <Pencil size={12} className="text-toss-text-5" />
                          </button>
                        </div>
                      )}
                    </div>
                    {budget > 0 && (
                      <div className="h-1.5 bg-toss-bg dark:bg-toss-bg-dark rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-500 ${pct >= 100 ? "bg-toss-red" : pct >= 80 ? "bg-toss-yellow" : "bg-toss-green"}`}
                          style={{ width: `${pct}%` }} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <BottomNav active="settings" />
    </div>
  );
}

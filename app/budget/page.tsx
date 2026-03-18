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
      setTransactions(txs);
      setBudgets(buds);
      setLoading(false);
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
        {/* Total Budget */}
        <div className="bg-white rounded-2xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[13px] font-medium text-toss-text-4">이번 달 총 예산</p>
            <button onClick={() => { setTotalBudgetEdit(true); setTotalBudgetValue(totalBudget > 0 ? String(totalBudget) : ""); }} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-toss-bg">
              <Pencil size={14} className="text-toss-text-4" />
            </button>
          </div>
          {totalBudgetEdit ? (
            <div className="flex items-center gap-2 mb-3">
              <input autoFocus type="text" inputMode="numeric" placeholder="예산 입력"
                value={totalBudgetValue ? new Intl.NumberFormat("ko-KR").format(parseInt(totalBudgetValue)||0) : ""}
                onChange={e => setTotalBudgetValue(e.target.value.replace(/[^0-9]/g,""))}
                className="flex-1 text-[20px] font-bold text-toss-text bg-toss-bg rounded-xl px-3 py-2 outline-none"
              />
              <span className="text-[16px] font-medium text-toss-text-3">원</span>
              <button onClick={async () => { await handleUpsert("__total__", parseInt(totalBudgetValue)||0); setTotalBudgetEdit(false); }} className="w-8 h-8 bg-toss-blue rounded-full flex items-center justify-center"><Check size={14} className="text-white" /></button>
              <button onClick={() => setTotalBudgetEdit(false)} className="w-8 h-8 bg-toss-bg rounded-full flex items-center justify-center"><X size={14} className="text-toss-text-3" /></button>
            </div>
          ) : (
            <p className="text-[28px] font-bold text-toss-text mb-3">
              {totalBudget > 0 ? formatKRW(totalBudget) : <span className="text-toss-text-5">설정 안 됨</span>}
            </p>
          )}
          {totalBudget > 0 && (
            <>
              <div className="flex justify-between text-[12px] mb-1.5">
                <span className="text-toss-text-4">사용 {formatKRW(totalExpense)}</span>
                <span className={totalPct >= 100 ? "text-toss-red font-semibold" : "text-toss-text-4"}>{totalPct}%</span>
              </div>
              <div className="h-2 bg-toss-bg rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${totalPct >= 100 ? "bg-toss-red" : totalPct >= 80 ? "bg-toss-yellow" : "bg-toss-blue"}`} style={{ width: `${totalPct}%` }} />
              </div>
              <p className={`text-[12px] mt-2 ${totalBudget <= totalExpense ? "text-toss-red font-medium" : "text-toss-text-4"}`}>
                {totalBudget > totalExpense ? `남은 예산 ${formatKRW(totalBudget - totalExpense)}` : "예산을 초과했어요 😅"}
              </p>
            </>
          )}
        </div>

        {/* Category Budgets */}
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <p className="text-[13px] font-medium text-toss-text-4 px-5 pt-5 pb-3">카테고리별 예산</p>
          {EXPENSE_CATEGORIES.map((cat, i) => {
            const spent = monthlyExpenses[cat.id] || 0;
            const budget = getBudgetAmt(cat.id);
            const pct = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;
            const isEditing = editingCat === cat.id;
            return (
              <div key={cat.id} className={`px-5 py-3.5 ${i < EXPENSE_CATEGORIES.length - 1 ? "border-b border-toss-border" : ""}`}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-toss-bg flex items-center justify-center text-[16px] flex-shrink-0">{cat.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[14px] font-medium text-toss-text">{cat.label}</span>
                      {isEditing ? (
                        <div className="flex items-center gap-1.5">
                          <input autoFocus type="text" inputMode="numeric" placeholder="금액"
                            value={editValue ? new Intl.NumberFormat("ko-KR").format(parseInt(editValue)||0) : ""}
                            onChange={e => setEditValue(e.target.value.replace(/[^0-9]/g,""))}
                            className="w-28 text-[13px] bg-toss-bg rounded-lg px-2 py-1 outline-none text-right"
                          />
                          <span className="text-[12px] text-toss-text-4">원</span>
                          <button onClick={() => saveEdit(cat.id)} className="w-6 h-6 bg-toss-blue rounded-full flex items-center justify-center"><Check size={12} className="text-white" /></button>
                          <button onClick={() => setEditingCat(null)} className="w-6 h-6 bg-toss-bg rounded-full flex items-center justify-center"><X size={12} className="text-toss-text-3" /></button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] text-toss-text-4">
                            {spent > 0 && <span className={`font-medium ${pct >= 100 ? "text-toss-red" : "text-toss-text-3"}`}>{formatKRW(spent)}</span>}
                            {budget > 0 && <span className="text-toss-text-5"> / {formatKRW(budget)}</span>}
                            {budget === 0 && spent === 0 && <span className="text-toss-text-5">미설정</span>}
                          </span>
                          <button onClick={() => { setEditingCat(cat.id); setEditValue(budget > 0 ? String(budget) : ""); }} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-toss-bg">
                            <Pencil size={12} className="text-toss-text-5" />
                          </button>
                        </div>
                      )}
                    </div>
                    {budget > 0 && (
                      <div className="h-1.5 bg-toss-bg rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-500 ${pct >= 100 ? "bg-toss-red" : pct >= 80 ? "bg-toss-yellow" : "bg-toss-blue"}`} style={{ width: `${pct}%` }} />
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

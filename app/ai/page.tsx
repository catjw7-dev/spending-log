"use client";

import { useState } from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import { getTransactions, getBudgets, formatKRW, getMonthKey, getMonthLabel } from "@/lib/storage";
import BottomNav from "@/components/BottomNav";

export default function AIPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const [monthKey] = useState(getMonthKey(new Date()));

  const analyze = async () => {
    setLoading(true);
    setResult("");
    try {
      const [txs, budgets] = await Promise.all([getTransactions(), getBudgets()]);
      const monthly = txs.filter(t => t.date.startsWith(monthKey));
      const income = monthly.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
      const expense = monthly.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);

      const catMap: Record<string, number> = {};
      monthly.filter(t => t.type === "expense").forEach(t => {
        catMap[t.category] = (catMap[t.category] || 0) + t.amount;
      });

      const catSummary = Object.entries(catMap).sort((a,b)=>b[1]-a[1]).map(([cat,amt])=>`${cat}: ${formatKRW(amt)}`).join(", ");
      const monthBudgets = budgets.filter(b => b.month === monthKey && b.category !== "__total__");
      const budgetSummary = monthBudgets.map(b => { const spent = catMap[b.category]||0; return `${b.category} 예산 ${formatKRW(b.amount)} 중 ${formatKRW(spent)} 사용`; }).join(", ");

      const prompt = `나는 개인 가계부 앱을 사용 중이야. ${getMonthLabel(monthKey)} 소비 내역을 분석해줘.

- 총 수입: ${formatKRW(income)}
- 총 지출: ${formatKRW(expense)}
- 잔액: ${formatKRW(income - expense)}
- 카테고리별 지출: ${catSummary || "없음"}
- 예산 대비 사용: ${budgetSummary || "예산 미설정"}

다음 형식으로 친근하게 한국어로 분석해줘:
1. 이번 달 소비 총평 (2-3줄)
2. 가장 많이 쓴 카테고리 코멘트
3. 절약 팁 1-2가지
4. 다음 달 목표 제안

이모지 적절히 사용해서 읽기 쉽게 써줘.`;

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      setResult(data.text);
    } catch {
      setResult("분석 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.");
    } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-page-bg dark:bg-dark-bg">
      <div className="bg-surface dark:bg-dark-card px-page pt-14 pb-card sticky top-0 z-10 shadow-card">
        <h1 className="text-title text-ink dark:text-white flex items-center gap-gap">
          <Sparkles size={18} className="text-primary" /> AI 소비 분석
        </h1>
        <p className="text-label text-text-muted mt-1">{getMonthLabel(monthKey)} 소비 패턴 분석</p>
      </div>

      <div className="px-page pt-gap-lg">
        {!result && !loading && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-pill bg-primary/10 flex items-center justify-center mb-gap-lg">
              <Sparkles size={28} className="text-primary" />
            </div>
            <p className="text-subtitle text-ink dark:text-white mb-gap-sm">이번 달 소비를 분석해드릴게요</p>
            <p className="text-caption text-text-muted mb-section">AI가 소비 패턴을 파악하고<br/>맞춤 절약 팁을 제안해드려요</p>
            <button onClick={analyze}
              className="flex items-center gap-gap px-section py-item bg-primary text-white rounded-card text-subtitle font-semibold active:scale-95 transition-transform shadow-primary">
              <Sparkles size={16} /> 분석 시작하기
            </button>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-gap-lg">
            <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-pill animate-spin" />
            <p className="text-body text-text-muted">AI가 분석 중이에요...</p>
          </div>
        )}

        {result && (
          <div className="space-y-gap">
            <div className="bg-surface dark:bg-dark-card rounded-card p-card shadow-card">
              <div className="flex items-center gap-gap mb-gap-lg">
                <Sparkles size={16} className="text-primary" />
                <p className="text-body font-semibold text-ink dark:text-white">분석 결과</p>
              </div>
              <p className="text-body text-ink dark:text-white leading-relaxed whitespace-pre-wrap">{result}</p>
            </div>
            <button onClick={analyze}
              className="w-full flex items-center justify-center gap-gap py-item bg-surface dark:bg-dark-card rounded-card border border-border dark:border-dark-border text-body font-medium text-text-secondary shadow-card hover:opacity-70 transition-opacity">
              <RefreshCw size={14} /> 다시 분석하기
            </button>
          </div>
        )}
      </div>

      <BottomNav active="settings" />
    </div>
  );
}

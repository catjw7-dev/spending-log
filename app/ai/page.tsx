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

      const catSummary = Object.entries(catMap)
        .sort((a, b) => b[1] - a[1])
        .map(([cat, amt]) => `${cat}: ${formatKRW(amt)}`)
        .join(", ");

      const monthBudgets = budgets.filter(b => b.month === monthKey && b.category !== "__total__");
      const budgetSummary = monthBudgets.map(b => {
        const spent = catMap[b.category] || 0;
        return `${b.category} 예산 ${formatKRW(b.amount)} 중 ${formatKRW(spent)} 사용`;
      }).join(", ");

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
    } catch (e) {
      setResult("분석 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-toss-bg dark:bg-[#0d1117]">
      <div className="bg-white dark:bg-toss-card-dark px-5 pt-14 pb-5 sticky top-0 z-10 shadow-sm">
        <h1 className="text-[17px] font-semibold text-toss-text dark:text-white flex items-center gap-2">
          <Sparkles size={18} className="text-toss-blue" />
          AI 소비 분석
        </h1>
        <p className="text-[12px] text-toss-text-4 mt-1">{getMonthLabel(monthKey)} 소비 패턴 분석</p>
      </div>

      <div className="px-4 pt-4">
        {!result && !loading && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-toss-blue-light dark:bg-blue-900/30 flex items-center justify-center mb-4">
              <Sparkles size={28} className="text-toss-blue" />
            </div>
            <p className="text-[16px] font-semibold text-toss-text dark:text-white mb-2">이번 달 소비를 분석해드릴게요</p>
            <p className="text-[13px] text-toss-text-4 mb-8">AI가 소비 패턴을 파악하고<br/>맞춤 절약 팁을 제안해드려요</p>
            <button onClick={analyze}
              className="flex items-center gap-2 px-6 py-3.5 bg-toss-blue text-white rounded-2xl text-[15px] font-semibold active:scale-95 transition-transform"
              style={{ boxShadow: "0 4px 20px rgba(49,130,246,0.35)" }}>
              <Sparkles size={16} />
              분석 시작하기
            </button>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-2 border-toss-blue border-t-transparent rounded-full animate-spin" />
            <p className="text-[14px] text-toss-text-4">AI가 분석 중이에요...</p>
          </div>
        )}

        {result && (
          <div className="space-y-3">
            <div className="bg-white dark:bg-toss-card-dark rounded-2xl p-5 shadow-card">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={16} className="text-toss-blue" />
                <p className="text-[14px] font-semibold text-toss-text dark:text-white">분석 결과</p>
              </div>
              <p className="text-[14px] text-toss-text dark:text-white leading-relaxed whitespace-pre-wrap">{result}</p>
            </div>
            <button onClick={analyze}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-white dark:bg-toss-card-dark rounded-2xl border border-toss-border dark:border-toss-border-dark text-[14px] font-medium text-toss-text-3 shadow-card hover:bg-toss-bg transition-colors">
              <RefreshCw size={14} />
              다시 분석하기
            </button>
          </div>
        )}
      </div>

      <BottomNav active="ai" />
    </div>
  );
}

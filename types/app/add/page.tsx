"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Check } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { TransactionType, EXPENSE_CATEGORIES, INCOME_CATEGORIES, Transaction } from "@/types";
import { addTransaction } from "@/lib/storage";

export default function AddPage() {
  const router = useRouter();
  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("식비");
  const [saving, setSaving] = useState(false);
  const [date, setDate] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  });

  const categories = type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const handleTypeChange = (t: TransactionType) => {
    setType(t);
    setCategory(t === "expense" ? "식비" : "용돈");
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value.replace(/[^0-9]/g, ""));
  };

  const displayAmount = amount
    ? new Intl.NumberFormat("ko-KR").format(parseInt(amount))
    : "";

  const handleSubmit = async () => {
    if (!amount || parseInt(amount) <= 0 || !description || !date) return;
    setSaving(true);
    try {
      const tx: Transaction = {
        id: uuidv4(),
        type,
        amount: parseInt(amount),
        category,
        description,
        date,
        createdAt: Date.now(),
      };
      await addTransaction(tx);
      router.push("/");
    } catch (e) {
      console.error(e);
      alert("저장 중 오류가 발생했어요.");
    } finally {
      setSaving(false);
    }
  };

  const isValid = amount && parseInt(amount) > 0 && description.trim() && date;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex items-center px-4 pt-14 pb-4">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-toss-bg transition-colors mr-2"
        >
          <ChevronLeft size={22} className="text-toss-text" />
        </button>
        <h1 className="text-[17px] font-semibold text-toss-text">내역 추가</h1>
      </div>

      <div className="px-5 mb-6">
        <div className="flex bg-toss-bg rounded-2xl p-1">
          {(["expense", "income"] as TransactionType[]).map((t) => (
            <button
              key={t}
              onClick={() => handleTypeChange(t)}
              className={`flex-1 py-2.5 rounded-xl text-[14px] font-semibold transition-all ${
                type === t
                  ? t === "expense"
                    ? "bg-white text-toss-red shadow-card"
                    : "bg-white text-toss-green shadow-card"
                  : "text-toss-text-4"
              }`}
            >
              {t === "expense" ? "지출" : "수입"}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 mb-6">
        <p className="text-[12px] text-toss-text-4 mb-2 font-medium">금액</p>
        <div className="flex items-baseline gap-1">
          <input
            type="text"
            inputMode="numeric"
            placeholder="0"
            value={displayAmount}
            onChange={handleAmountChange}
            className="flex-1 text-[36px] font-bold text-toss-text bg-transparent border-none outline-none placeholder:text-toss-text-5"
          />
          <span className="text-[24px] font-semibold text-toss-text-3">원</span>
        </div>
        <div className={`h-0.5 mt-2 rounded-full transition-colors ${amount ? (type === "expense" ? "bg-toss-red" : "bg-toss-green") : "bg-toss-border"}`} />
      </div>

      <div className="px-5 mb-6">
        <p className="text-[12px] text-toss-text-4 mb-2 font-medium">내용</p>
        <input
          type="text"
          placeholder="어디에 썼나요?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full text-[17px] font-medium text-toss-text bg-transparent border-none outline-none placeholder:text-toss-text-5"
        />
        <div className={`h-0.5 mt-2 rounded-full transition-colors ${description ? (type === "expense" ? "bg-toss-red" : "bg-toss-green") : "bg-toss-border"}`} />
      </div>

      <div className="px-5 mb-6">
        <p className="text-[12px] text-toss-text-4 mb-2 font-medium">날짜</p>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full text-[17px] font-medium text-toss-text bg-transparent border-none outline-none"
        />
        <div className="h-0.5 mt-2 rounded-full bg-toss-border" />
      </div>

      <div className="px-5 mb-8">
        <p className="text-[12px] text-toss-text-4 mb-3 font-medium">카테고리</p>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13px] font-medium transition-all border ${
                category === cat.id
                  ? type === "expense"
                    ? "bg-toss-red text-white border-toss-red"
                    : "bg-toss-green text-white border-toss-green"
                  : "bg-white text-toss-text-3 border-toss-border"
              }`}
            >
              <span className="text-[14px]">{cat.emoji}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 mt-auto pb-10">
        <button
          onClick={handleSubmit}
          disabled={!isValid || saving}
          className={`w-full py-4 rounded-2xl text-[16px] font-semibold transition-all flex items-center justify-center gap-2 ${
            isValid && !saving
              ? "bg-toss-blue text-white active:scale-[0.98]"
              : "bg-toss-bg text-toss-text-5 cursor-not-allowed"
          }`}
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <><Check size={18} strokeWidth={2.5} />저장하기</>
          )}
        </button>
      </div>
    </div>
  );
}

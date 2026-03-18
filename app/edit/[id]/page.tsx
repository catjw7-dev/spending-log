"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, Check } from "lucide-react";
import { TransactionType, EXPENSE_CATEGORIES, INCOME_CATEGORIES, Transaction } from "@/types";
import { getTransactionById, updateTransaction } from "@/lib/storage";

export default function EditPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("식비");
  const [date, setDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 전체 목록 대신 id 하나만 조회
    getTransactionById(id).then(tx => {
      if (tx) {
        setType(tx.type);
        setAmount(String(tx.amount));
        setDescription(tx.description);
        setCategory(tx.category);
        setDate(tx.date);
      }
      setLoading(false);
    });
  }, [id]);

  const categories = type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const handleTypeChange = (t: TransactionType) => {
    setType(t);
    setCategory(t === "expense" ? "식비" : "용돈");
  };

  const displayAmount = amount ? new Intl.NumberFormat("ko-KR").format(parseInt(amount.replace(/[^0-9]/g, ""))) : "";

  const handleSubmit = async () => {
    if (!amount || parseInt(amount) <= 0 || !description || !date) return;
    setSaving(true);
    try {
      const tx: Transaction = { id, type, amount: parseInt(amount), category, description, date, createdAt: Date.now() };
      await updateTransaction(tx);
      router.push("/");
    } catch (e) {
      alert("저장 중 오류가 발생했어요.");
    } finally { setSaving(false); }
  };

  const isValid = amount && parseInt(amount) > 0 && description.trim() && date;

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-toss-card-dark">
      <div className="w-6 h-6 border-2 border-toss-blue border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-toss-card-dark flex flex-col">
      <div className="flex items-center px-4 pt-14 pb-4">
        <button onClick={() => router.back()} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-toss-bg dark:hover:bg-toss-bg-dark transition-colors mr-2">
          <ChevronLeft size={22} className="text-toss-text dark:text-white" />
        </button>
        <h1 className="text-[17px] font-semibold text-toss-text dark:text-white">내역 수정</h1>
      </div>

      <div className="px-5 mb-6">
        <div className="flex bg-toss-bg dark:bg-toss-bg-dark rounded-2xl p-1">
          {(["expense", "income"] as TransactionType[]).map(t => (
            <button key={t} onClick={() => handleTypeChange(t)}
              className={`flex-1 py-2.5 rounded-xl text-[14px] font-semibold transition-all ${type === t ? (t === "expense" ? "bg-white dark:bg-[#1c2128] text-toss-red shadow-card" : "bg-white dark:bg-[#1c2128] text-toss-green shadow-card") : "text-toss-text-4"}`}>
              {t === "expense" ? "지출" : "수입"}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 mb-6">
        <p className="text-[12px] text-toss-text-4 mb-2 font-medium">금액</p>
        <div className="flex items-baseline gap-1">
          <input type="text" inputMode="numeric" placeholder="0" value={displayAmount}
            onChange={e => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
            className="flex-1 text-[36px] font-bold text-toss-text dark:text-white bg-transparent border-none outline-none placeholder:text-toss-text-5" />
        </div>
        <div className={`h-0.5 mt-2 rounded-full transition-colors ${amount ? (type === "expense" ? "bg-toss-red" : "bg-toss-green") : "bg-toss-border dark:bg-toss-border-dark"}`} />
      </div>

      <div className="px-5 mb-6">
        <p className="text-[12px] text-toss-text-4 mb-2 font-medium">내용</p>
        <input type="text" placeholder="어디에 썼나요?" value={description} onChange={e => setDescription(e.target.value)}
          className="w-full text-[17px] font-medium text-toss-text dark:text-white bg-transparent border-none outline-none placeholder:text-toss-text-5" />
        <div className={`h-0.5 mt-2 rounded-full transition-colors ${description ? (type === "expense" ? "bg-toss-red" : "bg-toss-green") : "bg-toss-border dark:bg-toss-border-dark"}`} />
      </div>

      <div className="px-5 mb-6">
        <p className="text-[12px] text-toss-text-4 mb-2 font-medium">날짜</p>
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          className="w-full text-[17px] font-medium text-toss-text dark:text-white bg-transparent border-none outline-none" />
        <div className="h-0.5 mt-2 rounded-full bg-toss-border dark:bg-toss-border-dark" />
      </div>

      <div className="px-5 mb-8">
        <p className="text-[12px] text-toss-text-4 mb-3 font-medium">카테고리</p>
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button key={cat.id} onClick={() => setCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13px] font-medium transition-all border ${category === cat.id ? (type === "expense" ? "bg-toss-red text-white border-toss-red" : "bg-toss-green text-white border-toss-green") : "bg-white dark:bg-toss-card-dark text-toss-text-3 border-toss-border dark:border-toss-border-dark"}`}>
              <span className="text-[14px]">{cat.emoji}</span>{cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 mt-auto pb-10">
        <button onClick={handleSubmit} disabled={!isValid || saving}
          className={`w-full py-4 rounded-2xl text-[16px] font-semibold transition-all flex items-center justify-center gap-2 ${isValid && !saving ? "bg-toss-blue text-white active:scale-[0.98]" : "bg-toss-bg dark:bg-toss-bg-dark text-toss-text-5 cursor-not-allowed"}`}>
          {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Check size={18} strokeWidth={2.5} />수정 완료</>}
        </button>
      </div>
    </div>
  );
}

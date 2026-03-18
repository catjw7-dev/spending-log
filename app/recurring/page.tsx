"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Bell, BellOff } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { RecurringItem, TransactionType, EXPENSE_CATEGORIES, INCOME_CATEGORIES, getCategoryEmoji } from "@/types";
import { getRecurring, addRecurring, deleteRecurring, updateRecurring, formatKRW } from "@/lib/storage";
import BottomNav from "@/components/BottomNav";

export default function RecurringPage() {
  const [items, setItems] = useState<RecurringItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("식비");
  const [dayOfMonth, setDayOfMonth] = useState("1");
  const [saving, setSaving] = useState(false);
  const [notifGranted, setNotifGranted] = useState(false);

  useEffect(() => {
    getRecurring().then(r => { setItems(r); setLoading(false); });
    if ("Notification" in window) setNotifGranted(Notification.permission === "granted");
  }, []);

  const requestNotification = async () => {
    if (!("Notification" in window)) return alert("이 브라우저는 알림을 지원하지 않아요.");
    const result = await Notification.requestPermission();
    setNotifGranted(result === "granted");
  };

  const categories = type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const handleTypeChange = (t: TransactionType) => {
    setType(t);
    setCategory(t === "expense" ? "식비" : "용돈");
  };

  const handleAdd = async () => {
    if (!amount || !description || !dayOfMonth) return;
    setSaving(true);
    try {
      const item: RecurringItem = { id: uuidv4(), type, amount: parseInt(amount), category, description, dayOfMonth: parseInt(dayOfMonth), active: true };
      await addRecurring(item);
      setItems(prev => [...prev, item].sort((a,b) => a.dayOfMonth - b.dayOfMonth));
      setShowForm(false);
      setAmount(""); setDescription(""); setDayOfMonth("1");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("삭제할까요?")) return;
    await deleteRecurring(id);
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const handleToggle = async (item: RecurringItem) => {
    const updated = { ...item, active: !item.active };
    await updateRecurring(updated);
    setItems(prev => prev.map(i => i.id === item.id ? updated : i));
  };

  const daysUntil = (day: number) => {
    const today = new Date();
    const next = new Date(today.getFullYear(), today.getMonth(), day);
    if (next <= today) next.setMonth(next.getMonth() + 1);
    return Math.ceil((next.getTime() - today.getTime()) / (1000*60*60*24));
  };

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-toss-bg dark:bg-[#0d1117]">
      <div className="bg-white dark:bg-toss-card-dark px-5 pt-14 pb-5 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-[17px] font-semibold text-toss-text dark:text-white">반복 내역</h1>
          <button onClick={requestNotification}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium border transition-colors ${notifGranted ? "bg-toss-blue text-white border-toss-blue" : "bg-white dark:bg-toss-card-dark text-toss-text-4 border-toss-border dark:border-toss-border-dark"}`}>
            {notifGranted ? <Bell size={13}/> : <BellOff size={13}/>}
            {notifGranted ? "알림 켜짐" : "알림 켜기"}
          </button>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-toss-blue border-t-transparent rounded-full animate-spin" /></div>
        ) : items.length === 0 && !showForm ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl mb-4">🔄</div>
            <p className="text-[15px] font-medium text-toss-text-3">반복 내역이 없어요</p>
            <p className="text-[13px] text-toss-text-5 mt-1">매달 고정 지출/수입을 등록해보세요</p>
          </div>
        ) : (
          items.map(item => {
            const days = daysUntil(item.dayOfMonth);
            return (
              <div key={item.id} className={`bg-white dark:bg-toss-card-dark rounded-2xl p-4 shadow-card ${!item.active ? "opacity-50" : ""}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-toss-bg dark:bg-toss-bg-dark flex items-center justify-center text-xl flex-shrink-0">{getCategoryEmoji(item.category)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-medium text-toss-text dark:text-white truncate">{item.description}</p>
                    <p className="text-[12px] text-toss-text-4 mt-0.5">{item.category} · 매월 {item.dayOfMonth}일</p>
                  </div>
                  <div className="text-right mr-2">
                    <p className={`text-[15px] font-semibold ${item.type === "income" ? "text-toss-green" : "text-toss-red"}`}>
                      {item.type === "income" ? "+" : "-"}{formatKRW(item.amount)}
                    </p>
                    <p className={`text-[11px] mt-0.5 ${days <= 3 ? "text-toss-red font-medium" : "text-toss-text-5"}`}>{days}일 후</p>
                  </div>
                  <button onClick={() => handleToggle(item)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-toss-bg dark:hover:bg-toss-bg-dark">
                    {item.active ? <Bell size={14} className="text-toss-blue"/> : <BellOff size={14} className="text-toss-text-5"/>}
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-toss-bg dark:hover:bg-toss-bg-dark">
                    <Trash2 size={14} className="text-toss-text-5"/>
                  </button>
                </div>
              </div>
            );
          })
        )}

        {showForm && (
          <div className="bg-white dark:bg-toss-card-dark rounded-2xl p-5 shadow-card">
            <div className="flex bg-toss-bg dark:bg-toss-bg-dark rounded-xl p-1 mb-4">
              {(["expense","income"] as TransactionType[]).map(t => (
                <button key={t} onClick={() => handleTypeChange(t)}
                  className={`flex-1 py-2 rounded-lg text-[13px] font-semibold transition-all ${type===t ? (t==="expense" ? "bg-white dark:bg-toss-card-dark text-toss-red shadow-card" : "bg-white dark:bg-toss-card-dark text-toss-green shadow-card") : "text-toss-text-4"}`}>
                  {t === "expense" ? "지출" : "수입"}
                </button>
              ))}
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-[12px] text-toss-text-4 mb-1 font-medium">내용</p>
                <input type="text" placeholder="예: 넷플릭스" value={description} onChange={e=>setDescription(e.target.value)}
                  className="w-full text-[15px] text-toss-text dark:text-white bg-toss-bg dark:bg-toss-bg-dark rounded-xl px-3 py-2.5 outline-none" />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <p className="text-[12px] text-toss-text-4 mb-1 font-medium">금액</p>
                  <input type="text" inputMode="numeric" placeholder="0" value={amount ? new Intl.NumberFormat("ko-KR").format(parseInt(amount)||0) : ""} onChange={e=>setAmount(e.target.value.replace(/[^0-9]/g,""))}
                    className="w-full text-[15px] text-toss-text dark:text-white bg-toss-bg dark:bg-toss-bg-dark rounded-xl px-3 py-2.5 outline-none" />
                </div>
                <div className="w-24">
                  <p className="text-[12px] text-toss-text-4 mb-1 font-medium">매월 몇일</p>
                  <input type="number" min="1" max="31" value={dayOfMonth} onChange={e=>setDayOfMonth(e.target.value)}
                    className="w-full text-[15px] text-toss-text dark:text-white bg-toss-bg dark:bg-toss-bg-dark rounded-xl px-3 py-2.5 outline-none" />
                </div>
              </div>
              <div>
                <p className="text-[12px] text-toss-text-4 mb-2 font-medium">카테고리</p>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <button key={cat.id} onClick={() => setCategory(cat.id)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all ${category===cat.id ? (type==="expense" ? "bg-toss-red text-white border-toss-red" : "bg-toss-green text-white border-toss-green") : "bg-white dark:bg-toss-card-dark text-toss-text-3 border-toss-border dark:border-toss-border-dark"}`}>
                      {cat.emoji} {cat.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl bg-toss-bg dark:bg-toss-bg-dark text-toss-text-4 text-[14px] font-medium">취소</button>
                <button onClick={handleAdd} disabled={saving || !amount || !description}
                  className={`flex-1 py-3 rounded-xl text-[14px] font-semibold ${!saving && amount && description ? "bg-toss-blue text-white" : "bg-toss-bg dark:bg-toss-bg-dark text-toss-text-5 cursor-not-allowed"}`}>
                  {saving ? "저장 중..." : "추가"}
                </button>
              </div>
            </div>
          </div>
        )}

        {!showForm && (
          <button onClick={() => setShowForm(true)}
            className="w-full py-4 bg-white dark:bg-toss-card-dark rounded-2xl border border-dashed border-toss-border dark:border-toss-border-dark text-[14px] text-toss-text-4 font-medium flex items-center justify-center gap-2 hover:bg-toss-bg dark:hover:bg-toss-bg-dark transition-colors shadow-card">
            <Plus size={16}/> 반복 내역 추가
          </button>
        )}
      </div>
      <BottomNav active="settings" />
    </div>
  );
}

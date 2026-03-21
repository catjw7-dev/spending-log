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

  const activeColor = type === "expense" ? "text-expense" : "text-income";
  const activeBg    = type === "expense" ? "bg-expense"   : "bg-income";
  const activeBorder= type === "expense" ? "border-expense": "border-income";

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-page-bg dark:bg-dark-bg">
      <div className="bg-surface dark:bg-dark-card px-page pt-14 pb-card sticky top-0 z-10 shadow-card">
        <div className="flex items-center justify-between">
          <h1 className="text-title text-ink dark:text-white">반복 내역</h1>
          <button onClick={requestNotification}
            className={`flex items-center gap-gap-sm px-gap py-1.5 rounded-pill text-caption font-medium border transition-colors ${
              notifGranted ? "bg-primary text-white border-primary" : "bg-surface dark:bg-dark-card text-text-muted border-border dark:border-dark-border"
            }`}>
            {notifGranted ? <Bell size={13}/> : <BellOff size={13}/>}
            {notifGranted ? "알림 켜짐" : "알림 켜기"}
          </button>
        </div>
      </div>

      <div className="px-page pt-gap-lg space-y-gap">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-pill animate-spin" />
          </div>
        ) : items.length === 0 && !showForm ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl mb-gap-lg">🔄</div>
            <p className="text-subtitle text-text-secondary">반복 내역이 없어요</p>
            <p className="text-caption text-text-muted mt-1">매달 고정 지출/수입을 등록해보세요</p>
          </div>
        ) : (
          items.map(item => {
            const days = daysUntil(item.dayOfMonth);
            return (
              <div key={item.id} className={`bg-surface dark:bg-dark-card rounded-card p-card shadow-card ${!item.active ? "opacity-50" : ""}`}>
                <div className="flex items-center gap-gap">
                  <div className="w-icon-lg h-icon-lg rounded-pill bg-page-bg dark:bg-dark-bg flex items-center justify-center text-xl flex-shrink-0">
                    {getCategoryEmoji(item.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-subtitle text-ink dark:text-white truncate">{item.description}</p>
                    <p className="text-label text-text-muted mt-0.5">{item.category} · 매월 {item.dayOfMonth}일</p>
                  </div>
                  <div className="text-right mr-gap-sm">
                    <p className={`text-amount-sm font-bold ${item.type==="income"?"text-income":"text-expense"}`}>
                      {item.type==="income"?"+":"-"}{formatKRW(item.amount)}
                    </p>
                    <p className={`text-label mt-0.5 ${days<=3?"text-expense font-medium":"text-text-disabled"}`}>{days}일 후</p>
                  </div>
                  <button onClick={() => handleToggle(item)} className="w-icon-sm h-icon-sm flex items-center justify-center rounded-pill hover:bg-page-bg dark:hover:bg-dark-bg">
                    {item.active ? <Bell size={14} className="text-primary"/> : <BellOff size={14} className="text-text-disabled"/>}
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="w-icon-sm h-icon-sm flex items-center justify-center rounded-pill hover:bg-page-bg dark:hover:bg-dark-bg">
                    <Trash2 size={14} className="text-text-disabled"/>
                  </button>
                </div>
              </div>
            );
          })
        )}

        {showForm && (
          <div className="bg-surface dark:bg-dark-card rounded-card p-card shadow-card">
            <div className="flex bg-page-bg dark:bg-dark-bg rounded-item p-1 mb-gap-lg">
              {(["expense","income"] as TransactionType[]).map(t => (
                <button key={t} onClick={() => handleTypeChange(t)}
                  className={`flex-1 py-2 rounded-item text-caption font-semibold transition-all ${
                    type===t ? `bg-surface dark:bg-dark-card ${activeColor} shadow-card` : "text-text-muted"
                  }`}>
                  {t==="expense"?"지출":"수입"}
                </button>
              ))}
            </div>
            <div className="space-y-gap-lg">
              <div>
                <p className="text-label text-text-muted mb-gap-sm font-medium">내용</p>
                <input type="text" placeholder="예: 넷플릭스" value={description} onChange={e=>setDescription(e.target.value)}
                  className="w-full text-body text-ink dark:text-white bg-page-bg dark:bg-dark-bg rounded-item px-gap py-gap-sm outline-none" />
              </div>
              <div className="flex gap-gap">
                <div className="flex-1">
                  <p className="text-label text-text-muted mb-gap-sm font-medium">금액</p>
                  <input type="text" inputMode="numeric" placeholder="0"
                    value={amount ? new Intl.NumberFormat("ko-KR").format(parseInt(amount)||0) : ""}
                    onChange={e=>setAmount(e.target.value.replace(/[^0-9]/g,""))}
                    className="w-full text-body text-ink dark:text-white bg-page-bg dark:bg-dark-bg rounded-item px-gap py-gap-sm outline-none" />
                </div>
                <div className="w-24">
                  <p className="text-label text-text-muted mb-gap-sm font-medium">매월 몇일</p>
                  <input type="number" min="1" max="31" value={dayOfMonth} onChange={e=>setDayOfMonth(e.target.value)}
                    className="w-full text-body text-ink dark:text-white bg-page-bg dark:bg-dark-bg rounded-item px-gap py-gap-sm outline-none" />
                </div>
              </div>
              <div>
                <p className="text-label text-text-muted mb-gap font-medium">카테고리</p>
                <div className="grid grid-cols-3 gap-gap">
                  {categories.map(cat => (
                    <button key={cat.id} onClick={() => setCategory(cat.id)}
                      className={`flex items-center justify-center gap-gap-sm px-gap py-gap-sm rounded-card text-caption font-medium border transition-all ${
                        category===cat.id ? `${activeBg} text-white ${activeBorder}` : "bg-surface dark:bg-dark-card text-text-secondary border-border dark:border-dark-border"
                      }`}>
                      <span>{cat.emoji}</span><span className="truncate">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-gap">
                <button onClick={() => setShowForm(false)} className="flex-1 py-item rounded-card bg-page-bg dark:bg-dark-bg text-text-muted text-body font-medium">취소</button>
                <button onClick={handleAdd} disabled={saving || !amount || !description}
                  className={`flex-1 py-item rounded-card text-body font-semibold ${!saving&&amount&&description?"bg-primary text-white":"bg-page-bg dark:bg-dark-bg text-text-disabled cursor-not-allowed"}`}>
                  {saving?"저장 중...":"추가"}
                </button>
              </div>
            </div>
          </div>
        )}

        {!showForm && (
          <button onClick={() => setShowForm(true)}
            className="w-full py-gap-lg bg-surface dark:bg-dark-card rounded-card border border-dashed border-border dark:border-dark-border text-body text-text-muted font-medium flex items-center justify-center gap-gap hover:opacity-70 transition-opacity shadow-card">
            <Plus size={16}/> 반복 내역 추가
          </button>
        )}
      </div>
      <BottomNav active="settings" />
    </div>
  );
}

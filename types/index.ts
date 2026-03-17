export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string; // YYYY-MM-DD
  createdAt: number;
}

export interface Budget {
  category: string;
  amount: number;
  month: string; // YYYY-MM
}

export interface MonthlyStats {
  month: string;
  income: number;
  expense: number;
  balance: number;
}

export const EXPENSE_CATEGORIES = [
  { id: "식비", label: "식비", emoji: "🍱" },
  { id: "교통", label: "교통", emoji: "🚌" },
  { id: "쇼핑", label: "쇼핑", emoji: "🛍️" },
  { id: "문화/취미", label: "문화/취미", emoji: "🎮" },
  { id: "의료", label: "의료", emoji: "💊" },
  { id: "교육", label: "교육", emoji: "📚" },
  { id: "저축", label: "저축", emoji: "🏦" },
  { id: "통신", label: "통신", emoji: "📱" },
  { id: "기타", label: "기타", emoji: "📝" },
] as const;

export const INCOME_CATEGORIES = [
  { id: "용돈", label: "용돈", emoji: "💰" },
  { id: "알바", label: "알바", emoji: "💼" },
  { id: "이자", label: "이자", emoji: "🏦" },
  { id: "선물", label: "선물", emoji: "🎁" },
  { id: "기타", label: "기타", emoji: "📝" },
] as const;

export const getCategoryEmoji = (category: string): string => {
  const all = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];
  return all.find((c) => c.id === category)?.emoji ?? "📝";
};

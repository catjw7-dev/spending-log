import { supabase } from "@/lib/supabase";
import { Transaction, Budget, RecurringItem } from "@/types";

// ── Transactions ──────────────────────────────────────────

export async function getTransactions(): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .order("date", { ascending: false });
  if (error) { console.error(error); return []; }
  return (data ?? []).map(rowToTx);
}

export async function addTransaction(tx: Transaction): Promise<void> {
  const { error } = await supabase.from("transactions").insert(txToRow(tx));
  if (error) throw error;
}

export async function updateTransaction(tx: Transaction): Promise<void> {
  const { error } = await supabase
    .from("transactions")
    .update(txToRow(tx))
    .eq("id", tx.id);
  if (error) throw error;
}

export async function deleteTransaction(id: string): Promise<void> {
  const { error } = await supabase.from("transactions").delete().eq("id", id);
  if (error) throw error;
}

// ── Budgets ───────────────────────────────────────────────

export async function getBudgets(): Promise<Budget[]> {
  const { data, error } = await supabase.from("budgets").select("*");
  if (error) { console.error(error); return []; }
  return (data ?? []).map(rowToBudget);
}

export async function upsertBudget(budget: Budget): Promise<void> {
  const { error } = await supabase
    .from("budgets")
    .upsert(budgetToRow(budget), { onConflict: "category,month" });
  if (error) throw error;
}

export async function deleteBudget(category: string, month: string): Promise<void> {
  const { error } = await supabase
    .from("budgets")
    .delete()
    .eq("category", category)
    .eq("month", month);
  if (error) throw error;
}

// ── Recurring ─────────────────────────────────────────────

export async function getRecurring(): Promise<RecurringItem[]> {
  const { data, error } = await supabase
    .from("recurring")
    .select("*")
    .order("day_of_month", { ascending: true });
  if (error) { console.error(error); return []; }
  return (data ?? []).map(rowToRecurring);
}

export async function addRecurring(item: RecurringItem): Promise<void> {
  const { error } = await supabase.from("recurring").insert(recurringToRow(item));
  if (error) throw error;
}

export async function updateRecurring(item: RecurringItem): Promise<void> {
  const { error } = await supabase
    .from("recurring")
    .update(recurringToRow(item))
    .eq("id", item.id);
  if (error) throw error;
}

export async function deleteRecurring(id: string): Promise<void> {
  const { error } = await supabase.from("recurring").delete().eq("id", id);
  if (error) throw error;
}

// ── Row mappers ───────────────────────────────────────────

function rowToTx(row: any): Transaction {
  return {
    id: row.id,
    type: row.type,
    amount: row.amount,
    category: row.category,
    description: row.description,
    date: row.date,
    createdAt: new Date(row.created_at).getTime(),
  };
}

function txToRow(tx: Transaction) {
  return {
    id: tx.id,
    type: tx.type,
    amount: tx.amount,
    category: tx.category,
    description: tx.description,
    date: tx.date,
  };
}

function rowToBudget(row: any): Budget {
  return { category: row.category, amount: row.amount, month: row.month };
}

function budgetToRow(b: Budget) {
  return { category: b.category, amount: b.amount, month: b.month };
}

function rowToRecurring(row: any): RecurringItem {
  return {
    id: row.id,
    type: row.type,
    amount: row.amount,
    category: row.category,
    description: row.description,
    dayOfMonth: row.day_of_month,
    active: row.active,
  };
}

function recurringToRow(r: RecurringItem) {
  return {
    id: r.id,
    type: r.type,
    amount: r.amount,
    category: r.category,
    description: r.description,
    day_of_month: r.dayOfMonth,
    active: r.active,
  };
}

// ── Helpers ───────────────────────────────────────────────

export function formatKRW(amount: number): string {
  return new Intl.NumberFormat("ko-KR").format(Math.abs(amount)) + "원";
}

export function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function getMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split("-");
  return `${year}년 ${parseInt(month)}월`;
}

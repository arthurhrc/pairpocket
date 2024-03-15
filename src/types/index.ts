export type TransactionType = "income" | "expense";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  coupleId?: string | null;
}

export interface TransactionWithRelations {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  date: Date;
  isRecurring: boolean;
  splitRatio: number | null;
  userId: string;
  categoryId: string;
  coupleId: string;
  createdAt: Date;
  user: { id: string; name: string };
  category: { id: string; name: string; icon: string; color: string };
}

export interface DashboardStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  savingsGoal: number | null;
  savingsProgress: number;
}

export interface CategorySummary {
  categoryId: string;
  categoryName: string;
  color: string;
  icon: string;
  total: number;
  percentage: number;
}

export interface MonthlyData {
  month: string;
  label: string;
  income: number;
  expense: number;
}

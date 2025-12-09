import { Timestamp } from "firebase/firestore";

// User types
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface UserData {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  isApproved: boolean;
  createdAt: Timestamp;
}

// Group types
export interface Group {
  id: string;
  name: string;
  createdByName: string;
  createdByUid: string;
  members: string[];
  status: 'active' | 'settled';
  createdAt: Timestamp;
  settledAt?: Timestamp;
}

// Expense types
export interface Expense {
  id: string;
  description: string;
  amount: number;
  payerUid: string;
  involvedUids: string[];
  category: ExpenseCategory;
  timestamp: Timestamp;
}

export type ExpenseCategory = 'food' | 'transport' | 'entertainment' | 'shopping' | 'utilities' | 'other';

// Settlement types
export interface SettlementPlan {
  from: string;
  to: string;
  amount: number;
}

export interface Settlement {
  totalSpend: number;
  plan: SettlementPlan[];
}

// Member types (enriched user data for group context)
export interface Member {
  uid: string;
  displayName: string;
  photoURL: string;
  email: string;
}

// Auth Context types
export interface AuthContextType {
  currentUser: User | null;
  userData: UserData | null;
  isApproved: boolean;
  login: () => Promise<any>;
  logout: () => Promise<void>;
  loading: boolean;
}

// Language Context types
export interface Language {
  code: string;
  name: string;
  flag: string;
}

export interface LanguageContextType {
  currentLanguage: string;
  changeLanguage: (lang: string) => void;
  languages: Language[];
}

// Hook return types
export interface UseGroupsReturn {
  activeGroups: Group[];
  settledGroups: Group[];
  loading: boolean;
  createGroup: (name: string) => Promise<void>;
}

export interface UseGroupReturn {
  group: Group | null;
  members: Member[];
  loading: boolean;
}

export interface UseExpensesReturn {
  expenses: Expense[];
  loading: boolean;
  addExpense: (expenseData: Omit<Expense, 'id'>) => Promise<void>;
}

export interface UseSettlementReturn {
  totalSpend: number;
  plan: SettlementPlan[];
}

// Component Props types
export interface ModalProps {
  onClose: () => void;
}

export interface CreateGroupModalProps extends ModalProps {
  onCreate: (name: string) => Promise<void>;
}

export interface AddMemberModalProps extends ModalProps {
  groupId: string;
  currentMembers: string[];
}

export interface AddExpenseModalProps extends ModalProps {
  groupId: string;
  members: Member[];
}

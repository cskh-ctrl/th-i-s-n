export interface Semester {
  id: string;
  name: string;
  months: number;
}

export interface Holiday {
  name: string;
  date: string;
}

export interface AcademicYear {
  id: string;
  name: string; // e.g., "2026-2027"
  startDate: string;
  endDate: string;
  totalStudyDays: number;
  totalBoardingDays: number;
  holidays: Holiday[];
  semesters: Semester[];
  status: 'active' | 'inactive';
}

export interface EducationLevel {
  id: string;
  name: string; // e.g., "Mầm non", "Tiểu học", "THCS", "THPT"
  code: string;
}

export interface ClassItem {
  id: string;
  name: string; // e.g., "Nhà trẻ", "Mầm", "Chồi", "Lá", "Lớp 1", "Lớp 2"
  levelId: string; // references EducationLevel
}

export interface FeeCategory {
  id: string;
  name: string; // e.g., "Học phí", "Phí bán trú", "Phí dịch vụ", "Đồng phục"
  code: string;
}

export interface FeeItem {
  id: string;
  name: string;
  code: string;
  categoryId: string; // references FeeCategory
  price: number;
  unit: string; // "Tháng" | "Ngày" | "Lần" | "Học kỳ" | "Năm"
  type: 'mandatory' | 'optional';
  levelId: string | 'all'; // references EducationLevel
  classId: string | 'all'; // references ClassItem
  yearId: string; // references AcademicYear
  startDate: string;
  endDate: string;
  visible: boolean;
}

export type PaymentTerm = 'month' | 'quarter' | 'semester' | 'year';

export interface DiscountPolicy {
  id: string;
  name: string;
  discountType: 'percent' | 'amount';
  value: number; // percentage (e.g. 6 for 6%) or fixed money amount
  conditionType: 'payment_term' | 'sibling' | 'early_bird' | 'custom';
  conditionValue: string; // e.g. "year", "semester", "second_child", "early_registration"
  applicableLevelId: string | 'all';
  isActive: boolean;
  startDate: string;
  endDate: string;
}

export interface SelectedFeeItem {
  itemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
  unit: string;
  type: 'mandatory' | 'optional';
  notes?: string;
}

export interface AppliedDiscount {
  policyId: string;
  name: string;
  discountValue: number; // actual amount subtracted
}

export interface FeeQuote {
  id: string; // TS-YYYY-000001
  studentName: string;
  studentDob: string;
  yearId: string;
  levelId: string;
  classId: string;
  paymentTerm: PaymentTerm;
  siblingOrder: number; // 1 = first child, 2 = second child, etc.
  isEarlyBird: boolean;
  selectedFeeItems: SelectedFeeItem[];
  appliedDiscounts: AppliedDiscount[];
  subtotal: number;
  discountTotal: number;
  grandTotal: number;
  createdAt: string;
  createdById: string;
  createdByName: string;
  validUntil: string;
  notes: string;
}

export type UserRole = 'admin' | 'accountant' | 'admissions' | 'marketing';

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  email: string;
  password?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  timestamp: string;
  action: string;
  details: string;
  oldValue?: string;
  newValue?: string;
}

export interface SystemSettings {
  schoolName: string;
  schoolLogo: string;
  schoolAddress: string;
  schoolPhone: string;
  bankName: string;
  bankAccount: string;
  bankAccountName: string;
  quoteCounter: number;
}

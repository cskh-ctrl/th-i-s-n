import { 
  AcademicYear, 
  EducationLevel, 
  ClassItem, 
  FeeCategory, 
  FeeItem, 
  DiscountPolicy, 
  FeeQuote, 
  User, 
  AuditLog, 
  SystemSettings 
} from '../types';

// Default initial data for the database
const defaultAcademicYears: AcademicYear[] = [
  {
    id: 'year-2026-2027',
    name: '2026-2027',
    startDate: '2026-08-15',
    endDate: '2027-05-31',
    totalStudyDays: 180,
    totalBoardingDays: 175,
    holidays: [
      { name: 'Quốc khánh', date: '2026-09-02' },
      { name: 'Tết Dương Lịch', date: '2027-01-01' },
      { name: 'Tết Nguyên Đán', date: '2027-02-05' },
      { name: 'Giỗ tổ Hùng Vương', date: '2027-04-16' },
      { name: 'Giải phóng miền Nam', date: '2027-04-30' },
      { name: 'Quốc tế Lao động', date: '2027-05-01' }
    ],
    semesters: [
      { id: 'sem-hk1', name: 'Học kỳ 1', months: 5 },
      { id: 'sem-hk2', name: 'Học kỳ 2', months: 4 }
    ],
    status: 'active'
  },
  {
    id: 'year-2027-2028',
    name: '2027-2028',
    startDate: '2027-08-15',
    endDate: '2028-05-31',
    totalStudyDays: 180,
    totalBoardingDays: 175,
    holidays: [
      { name: 'Quốc khánh', date: '2027-09-02' },
      { name: 'Tết Dương Lịch', date: '2028-01-01' }
    ],
    semesters: [
      { id: 'sem-2728-hk1', name: 'Học kỳ 1', months: 5 },
      { id: 'sem-2728-hk2', name: 'Học kỳ 2', months: 4 }
    ],
    status: 'inactive'
  }
];

const defaultEducationLevels: EducationLevel[] = [
  { id: 'level-mamnon', name: 'Mầm non', code: 'MN' },
  { id: 'level-tieuhoc', name: 'Tiểu học', code: 'TH' },
  { id: 'level-thcs', name: 'Trung học Cơ sở', code: 'THCS' },
  { id: 'level-thpt', name: 'Trung học Phổ thông', code: 'THPT' }
];

const defaultClasses: ClassItem[] = [
  { id: 'class-nhatre', name: 'Nhà trẻ', levelId: 'level-mamnon' },
  { id: 'class-mam', name: 'Mầm', levelId: 'level-mamnon' },
  { id: 'class-choi', name: 'Chồi', levelId: 'level-mamnon' },
  { id: 'class-la', name: 'Lá', levelId: 'level-mamnon' },
  { id: 'class-lop1', name: 'Lớp 1', levelId: 'level-tieuhoc' },
  { id: 'class-lop2', name: 'Lớp 2', levelId: 'level-tieuhoc' },
  { id: 'class-lop3', name: 'Lớp 3', levelId: 'level-tieuhoc' },
  { id: 'class-lop4', name: 'Lớp 4', levelId: 'level-tieuhoc' },
  { id: 'class-lop5', name: 'Lớp 5', levelId: 'level-tieuhoc' },
  { id: 'class-lop6', name: 'Lớp 6', levelId: 'level-thcs' },
  { id: 'class-lop10', name: 'Lớp 10', levelId: 'level-thpt' }
];

const defaultFeeCategories: FeeCategory[] = [
  { id: 'cat-hocphi', name: 'Học phí chính khóa', code: 'HP' },
  { id: 'cat-bandau', name: 'Phí nhập học & Giữ chỗ', code: 'BD' },
  { id: 'cat-bantru', name: 'Phí bán trú & Ăn uống', code: 'BT' },
  { id: 'cat-xe', name: 'Dịch vụ đưa đón xe bus', code: 'XE' },
  { id: 'cat-dongphuc', name: 'Đồng phục & Học phẩm', code: 'DP' },
  { id: 'cat-clb', name: 'Câu lạc bộ & Kỹ năng tự chọn', code: 'CLB' }
];

const defaultFeeItems: FeeItem[] = [
  // 2026-2027
  {
    id: 'fee-hp-mamnon',
    name: 'Học phí Mầm non',
    code: 'HP_MN_2627',
    categoryId: 'cat-hocphi',
    price: 6500000,
    unit: 'Tháng',
    type: 'mandatory',
    levelId: 'level-mamnon',
    classId: 'all',
    yearId: 'year-2026-2027',
    startDate: '2026-08-15',
    endDate: '2027-05-31',
    visible: true
  },
  {
    id: 'fee-hp-tieuhoc',
    name: 'Học phí Tiểu học',
    code: 'HP_TH_2627',
    categoryId: 'cat-hocphi',
    price: 7800000,
    unit: 'Tháng',
    type: 'mandatory',
    levelId: 'level-tieuhoc',
    classId: 'all',
    yearId: 'year-2026-2027',
    startDate: '2026-08-15',
    endDate: '2027-05-31',
    visible: true
  },
  {
    id: 'fee-hp-thcs',
    name: 'Học phí THCS',
    code: 'HP_THCS_2627',
    categoryId: 'cat-hocphi',
    price: 9200000,
    unit: 'Tháng',
    type: 'mandatory',
    levelId: 'level-thcs',
    classId: 'all',
    yearId: 'year-2026-2027',
    startDate: '2026-08-15',
    endDate: '2027-05-31',
    visible: true
  },
  {
    id: 'fee-hp-thpt',
    name: 'Học phí THPT',
    code: 'HP_THPT_2627',
    categoryId: 'cat-hocphi',
    price: 11500000,
    unit: 'Tháng',
    type: 'mandatory',
    levelId: 'level-thpt',
    classId: 'all',
    yearId: 'year-2026-2027',
    startDate: '2026-08-15',
    endDate: '2027-05-31',
    visible: true
  },
  {
    id: 'fee-giucho',
    name: 'Phí đăng ký & Giữ chỗ',
    code: 'PHI_DK_GC',
    categoryId: 'cat-bandau',
    price: 5000000,
    unit: 'Lần',
    type: 'mandatory',
    levelId: 'all',
    classId: 'all',
    yearId: 'year-2026-2027',
    startDate: '2026-08-15',
    endDate: '2027-05-31',
    visible: true
  },
  {
    id: 'fee-ansang',
    name: 'Phí ăn sáng học sinh',
    code: 'DV_AN_SANG',
    categoryId: 'cat-bantru',
    price: 40000,
    unit: 'Ngày',
    type: 'optional',
    levelId: 'all',
    classId: 'all',
    yearId: 'year-2026-2027',
    startDate: '2026-08-15',
    endDate: '2027-05-31',
    visible: true
  },
  {
    id: 'fee-anbantru',
    name: 'Phí ăn bán trú (Trưa, Xế)',
    code: 'DV_AN_BAN_TRU',
    categoryId: 'cat-bantru',
    price: 80000,
    unit: 'Ngày',
    type: 'mandatory',
    levelId: 'all',
    classId: 'all',
    yearId: 'year-2026-2027',
    startDate: '2026-08-15',
    endDate: '2027-05-31',
    visible: true
  },
  {
    id: 'fee-bus-gan',
    name: 'Xe đưa đón (Dưới 5km)',
    code: 'XE_DUA_DON_5KM',
    categoryId: 'cat-xe',
    price: 1600000,
    unit: 'Tháng',
    type: 'optional',
    levelId: 'all',
    classId: 'all',
    yearId: 'year-2026-2027',
    startDate: '2026-08-15',
    endDate: '2027-05-31',
    visible: true
  },
  {
    id: 'fee-bus-xa',
    name: 'Xe đưa đón (Trên 5km)',
    code: 'XE_DUA_DON_5KM_UP',
    categoryId: 'cat-xe',
    price: 2400000,
    unit: 'Tháng',
    type: 'optional',
    levelId: 'all',
    classId: 'all',
    yearId: 'year-2026-2027',
    startDate: '2026-08-15',
    endDate: '2027-05-31',
    visible: true
  },
  {
    id: 'fee-dongphuc-mn',
    name: 'Đồng phục & Ba lô Mầm non',
    code: 'DP_BALO_MN',
    categoryId: 'cat-dongphuc',
    price: 1800000,
    unit: 'Lần',
    type: 'mandatory',
    levelId: 'level-mamnon',
    classId: 'all',
    yearId: 'year-2026-2027',
    startDate: '2026-08-15',
    endDate: '2027-05-31',
    visible: true
  },
  {
    id: 'fee-dongphuc-th',
    name: 'Đồng phục & Ba lô Tiểu học',
    code: 'DP_BALO_TH',
    categoryId: 'cat-dongphuc',
    price: 2200000,
    unit: 'Lần',
    type: 'mandatory',
    levelId: 'level-tieuhoc',
    classId: 'all',
    yearId: 'year-2026-2027',
    startDate: '2026-08-15',
    endDate: '2027-05-31',
    visible: true
  },
  {
    id: 'fee-hocpham-th',
    name: 'Học phẩm & Sách giáo khoa Tiểu học',
    code: 'HP_SACH_TH',
    categoryId: 'cat-dongphuc',
    price: 1500000,
    unit: 'Năm',
    type: 'mandatory',
    levelId: 'level-tieuhoc',
    classId: 'all',
    yearId: 'year-2026-2027',
    startDate: '2026-08-15',
    endDate: '2027-05-31',
    visible: true
  },
  {
    id: 'fee-clb-stem',
    name: 'CLB Robotics & STEM tăng cường',
    code: 'CLB_STEM_ROBOT',
    categoryId: 'cat-clb',
    price: 1200000,
    unit: 'Tháng',
    type: 'optional',
    levelId: 'level-tieuhoc',
    classId: 'all',
    yearId: 'year-2026-2027',
    startDate: '2026-08-15',
    endDate: '2027-05-31',
    visible: true
  },
  {
    id: 'fee-clb-tienganh',
    name: 'Học Tiếng Anh tăng cường với GV Bản ngữ',
    code: 'CLB_ENGLISH_NATIVE',
    categoryId: 'cat-clb',
    price: 1800000,
    unit: 'Tháng',
    type: 'optional',
    levelId: 'all',
    classId: 'all',
    yearId: 'year-2026-2027',
    startDate: '2026-08-15',
    endDate: '2027-05-31',
    visible: true
  }
];

const defaultDiscountPolicies: DiscountPolicy[] = [
  {
    id: 'disc-year',
    name: 'Ưu đãi đóng phí Cả năm học (10 tháng)',
    discountType: 'percent',
    value: 6,
    conditionType: 'payment_term',
    conditionValue: 'year',
    applicableLevelId: 'all',
    isActive: true,
    startDate: '2026-08-15',
    endDate: '2027-05-31'
  },
  {
    id: 'disc-semester',
    name: 'Ưu đãi đóng phí theo Học kỳ (5 tháng)',
    discountType: 'percent',
    value: 2,
    conditionType: 'payment_term',
    conditionValue: 'semester',
    applicableLevelId: 'all',
    isActive: true,
    startDate: '2026-08-15',
    endDate: '2027-05-31'
  },
  {
    id: 'disc-sibling-2',
    name: 'Chính sách giảm trừ Con thứ hai (Đồng học)',
    discountType: 'percent',
    value: 10,
    conditionType: 'sibling',
    conditionValue: 'second_child',
    applicableLevelId: 'all',
    isActive: true,
    startDate: '2026-08-15',
    endDate: '2027-05-31'
  },
  {
    id: 'disc-early-bird',
    name: 'Chính sách Nhập học sớm (Trước 31/07)',
    discountType: 'percent',
    value: 5,
    conditionType: 'early_bird',
    conditionValue: 'early_registration',
    applicableLevelId: 'all',
    isActive: true,
    startDate: '2026-08-15',
    endDate: '2027-05-31'
  },
  {
    id: 'disc-june-promo',
    name: 'Khuyến mãi hè nhập học tháng 6 (Trừ tiền mặt)',
    discountType: 'amount',
    value: 1000000,
    conditionType: 'custom',
    conditionValue: 'june_promo',
    applicableLevelId: 'all',
    isActive: true,
    startDate: '2026-06-01',
    endDate: '2026-06-30'
  }
];

const defaultUsers: User[] = [
  { id: 'usr-admin', username: 'admin', fullName: 'Nguyễn Văn Trỗi', role: 'admin', isActive: true, email: 'admin@truongvietanh.com' },
  { id: 'usr-ketoan', username: 'ketoan', fullName: 'Phan Thị Thanh', role: 'accountant', isActive: true, email: 'ketoan@truongvietanh.com' },
  { id: 'usr-tuyensinh', username: 'tuyensinh', fullName: 'Trần Minh Hòa', role: 'admissions', isActive: true, email: 'tuyensinh@truongvietanh.com' },
  { id: 'usr-marketing', username: 'marketing', fullName: 'Lê Hoàng Nam', role: 'marketing', isActive: true, email: 'marketing@truongvietanh.com' }
];

const defaultSettings: SystemSettings = {
  schoolName: 'Hệ thống Trường Việt Anh',
  schoolLogo: 'https://truongvietanh.com/logo-vietanh.webp',
  schoolAddress: '160/72 Phan Huy Ích, Phường An Hội Tây, TP.HCM',
  schoolPhone: '0916 961 409',
  bankName: 'Ngân hàng TMCP Ngoại Thương Việt Nam (Vietcombank)',
  bankAccount: '1026543219',
  bankAccountName: 'CONG TY CP GIAO DUC VIET ANH',
  quoteCounter: 124
};

const defaultQuotes: FeeQuote[] = [
  {
    id: 'TS-2026-000121',
    studentName: 'Phạm Minh Khôi',
    studentDob: '2021-04-12',
    yearId: 'year-2026-2027',
    levelId: 'level-mamnon',
    classId: 'class-choi',
    paymentTerm: 'year',
    siblingOrder: 1,
    isEarlyBird: true,
    selectedFeeItems: [
      { itemId: 'fee-hp-mamnon', name: 'Học phí Mầm non', quantity: 10, unitPrice: 6500000, total: 65000000, unit: 'Tháng', type: 'mandatory' },
      { itemId: 'fee-giucho', name: 'Phí đăng ký & Giữ chỗ', quantity: 1, unitPrice: 5000000, total: 5000000, unit: 'Lần', type: 'mandatory' },
      { itemId: 'fee-anbantru', name: 'Phí ăn bán trú (Trưa, Xế)', quantity: 175, unitPrice: 80000, total: 14000000, unit: 'Ngày', type: 'mandatory' },
      { itemId: 'fee-dongphuc-mn', name: 'Đồng phục & Ba lô Mầm non', quantity: 1, unitPrice: 1800000, total: 1800000, unit: 'Lần', type: 'mandatory' }
    ],
    appliedDiscounts: [
      { policyId: 'disc-year', name: 'Ưu đãi đóng phí Cả năm học (10 tháng)', discountValue: 3900000 },
      { policyId: 'disc-early-bird', name: 'Chính sách Nhập học sớm (Trước 31/07)', discountValue: 3250000 }
    ],
    subtotal: 85800000,
    discountTotal: 7150000,
    grandTotal: 78650000,
    createdAt: '2026-06-15T09:30:00Z',
    createdById: 'usr-tuyensinh',
    createdByName: 'Trần Minh Hòa',
    validUntil: '2026-07-15',
    notes: 'Khách hàng đóng trước phí giữ chỗ để nhận thêm ưu đãi.'
  },
  {
    id: 'TS-2026-000122',
    studentName: 'Trần Thu Thảo',
    studentDob: '2019-11-20',
    yearId: 'year-2026-2027',
    levelId: 'level-tieuhoc',
    classId: 'class-lop2',
    paymentTerm: 'semester',
    siblingOrder: 2,
    isEarlyBird: false,
    selectedFeeItems: [
      { itemId: 'fee-hp-tieuhoc', name: 'Học phí Tiểu học', quantity: 5, unitPrice: 7800000, total: 39000000, unit: 'Tháng', type: 'mandatory' },
      { itemId: 'fee-anbantru', name: 'Phí ăn bán trú (Trưa, Xế)', quantity: 90, unitPrice: 80000, total: 7200000, unit: 'Ngày', type: 'mandatory' },
      { itemId: 'fee-dongphuc-th', name: 'Đồng phục & Ba lô Tiểu học', quantity: 1, unitPrice: 2200000, total: 2200000, unit: 'Lần', type: 'mandatory' },
      { itemId: 'fee-clb-stem', name: 'CLB Robotics & STEM tăng cường', quantity: 5, unitPrice: 1200000, total: 6000000, unit: 'Tháng', type: 'optional' }
    ],
    appliedDiscounts: [
      { policyId: 'disc-semester', name: 'Ưu đãi đóng phí theo Học kỳ (5 tháng)', discountValue: 780000 },
      { policyId: 'disc-sibling-2', name: 'Chính sách giảm trừ Con thứ hai (Đồng học)', discountValue: 3900000 }
    ],
    subtotal: 54400000,
    discountTotal: 4680000,
    grandTotal: 49720000,
    createdAt: '2026-06-20T14:15:00Z',
    createdById: 'usr-ketoan',
    createdByName: 'Phan Thị Thanh',
    validUntil: '2026-07-20',
    notes: 'Con thứ 2 đang học khối Mầm non tại trường, áp dụng giảm 10% học phí.'
  }
];

const defaultAuditLogs: AuditLog[] = [
  {
    id: 'log-1',
    userId: 'usr-admin',
    userName: 'Nguyễn Văn Trỗi',
    userRole: 'admin',
    timestamp: '2026-06-10T08:00:00Z',
    action: 'CẬP NHẬT BIỂU PHÍ',
    details: 'Cập nhật Học phí Mầm non từ 6,000,000đ lên 6,500,000đ',
    oldValue: '6000000',
    newValue: '6500000'
  },
  {
    id: 'log-2',
    userId: 'usr-admin',
    userName: 'Nguyễn Văn Trỗi',
    userRole: 'admin',
    timestamp: '2026-06-11T10:30:00Z',
    action: 'THÊM CHÍNH SÁCH GIẢM GIÁ',
    details: 'Tạo chính sách Khuyến mãi hè nhập học tháng 6 (Trừ tiền mặt)'
  }
];

// Helper to interact with LocalStorage database
export class Database {
  private static get<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(`thaison_school_${key}`);
      return data ? JSON.parse(data) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private static set<T>(key: string, value: T): void {
    localStorage.setItem(`thaison_school_${key}`, JSON.stringify(value));
  }

  // --- Core Table Accessors ---

  public static getAcademicYears(): AcademicYear[] {
    return this.get<AcademicYear[]>('academic_years', defaultAcademicYears);
  }

  public static setAcademicYears(years: AcademicYear[], actor?: User, details?: { action: string, oldValue?: string, newValue?: string }): void {
    const oldVal = JSON.stringify(this.getAcademicYears());
    this.set('academic_years', years);
    if (actor && details) {
      this.addAuditLog(actor, details.action, `${details.action}: Thay đổi danh sách năm học`, oldVal, JSON.stringify(years));
    }
  }

  public static getEducationLevels(): EducationLevel[] {
    return this.get<EducationLevel[]>('education_levels', defaultEducationLevels);
  }

  public static setEducationLevels(levels: EducationLevel[], actor?: User, details?: { action: string, oldValue?: string, newValue?: string }): void {
    const oldVal = JSON.stringify(this.getEducationLevels());
    this.set('education_levels', levels);
    if (actor && details) {
      this.addAuditLog(actor, details.action, `${details.action}: Thay đổi khối học`, oldVal, JSON.stringify(levels));
    }
  }

  public static getClasses(): ClassItem[] {
    return this.get<ClassItem[]>('classes', defaultClasses);
  }

  public static setClasses(classes: ClassItem[], actor?: User, details?: { action: string, oldValue?: string, newValue?: string }): void {
    const oldVal = JSON.stringify(this.getClasses());
    this.set('classes', classes);
    if (actor && details) {
      this.addAuditLog(actor, details.action, `${details.action}: Thay đổi danh sách lớp học`, oldVal, JSON.stringify(classes));
    }
  }

  public static getFeeCategories(): FeeCategory[] {
    return this.get<FeeCategory[]>('fee_categories', defaultFeeCategories);
  }

  public static setFeeCategories(categories: FeeCategory[], actor?: User, details?: { action: string, oldValue?: string, newValue?: string }): void {
    const oldVal = JSON.stringify(this.getFeeCategories());
    this.set('fee_categories', categories);
    if (actor && details) {
      this.addAuditLog(actor, details.action, `${details.action}: Thay đổi danh mục khoản phí`, oldVal, JSON.stringify(categories));
    }
  }

  public static getFeeItems(): FeeItem[] {
    return this.get<FeeItem[]>('fee_items', defaultFeeItems);
  }

  public static setFeeItems(items: FeeItem[], actor?: User, details?: { action: string, oldValue?: string, newValue?: string }): void {
    const oldVal = JSON.stringify(this.getFeeItems());
    this.set('fee_items', items);
    if (actor && details) {
      this.addAuditLog(actor, details.action, `${details.action}: Thay đổi danh sách biểu phí`, oldVal, JSON.stringify(items));
    }
  }

  public static getDiscountPolicies(): DiscountPolicy[] {
    return this.get<DiscountPolicy[]>('discount_policies', defaultDiscountPolicies);
  }

  public static setDiscountPolicies(policies: DiscountPolicy[], actor?: User, details?: { action: string, oldValue?: string, newValue?: string }): void {
    const oldVal = JSON.stringify(this.getDiscountPolicies());
    this.set('discount_policies', policies);
    if (actor && details) {
      this.addAuditLog(actor, details.action, `${details.action}: Thay đổi chính sách giảm giá`, oldVal, JSON.stringify(policies));
    }
  }

  public static getQuotes(): FeeQuote[] {
    return this.get<FeeQuote[]>('fee_quotes', defaultQuotes);
  }

  public static setQuotes(quotes: FeeQuote[], actor?: User, details?: { action: string }): void {
    this.set('fee_quotes', quotes);
    if (actor && details) {
      this.addAuditLog(actor, details.action, `${details.action}: Cập nhật danh sách báo phí`);
    }
  }

  public static getUsers(): User[] {
    return this.get<User[]>('users', defaultUsers);
  }

  public static setUsers(users: User[], actor?: User, details?: { action: string }): void {
    this.set('users', users);
    if (actor && details) {
      this.addAuditLog(actor, details.action, `${details.action}: Cập nhật thông tin người dùng`);
    }
  }

  public static getSettings(): SystemSettings {
    return this.get<SystemSettings>('settings', defaultSettings);
  }

  public static setSettings(settings: SystemSettings, actor?: User): void {
    const oldVal = JSON.stringify(this.getSettings());
    this.set('settings', settings);
    if (actor) {
      this.addAuditLog(actor, 'CÀI ĐẶT HỆ THỐNG', 'Cập nhật cấu hình thông tin trường học & ngân hàng', oldVal, JSON.stringify(settings));
    }
  }

  public static getAuditLogs(): AuditLog[] {
    return this.get<AuditLog[]>('audit_logs', defaultAuditLogs);
  }

  public static addAuditLog(user: User, action: string, details: string, oldValue?: string, newValue?: string): void {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: user.id,
      userName: user.fullName,
      userRole: user.role,
      timestamp: new Date().toISOString(),
      action,
      details,
      oldValue,
      newValue
    };
    logs.unshift(newLog); // Place newest logs at the top
    this.set('audit_logs', logs.slice(0, 1000)); // Keep last 1000 logs
  }

  // Generate clean quote reference TS-YYYY-000125 and increments setting counter
  public static generateNextQuoteId(yearName: string): string {
    const settings = this.getSettings();
    const nextCounter = settings.quoteCounter + 1;
    this.setSettings({ ...settings, quoteCounter: nextCounter });
    
    const yearShort = yearName.split('-')[0] || '2026';
    const formattedCounter = String(nextCounter).padStart(6, '0');
    return `TS-${yearShort}-${formattedCounter}`;
  }

  // --- Database Backup & Restore ---

  public static exportFullBackup(): string {
    const data = {
      academic_years: this.getAcademicYears(),
      education_levels: this.getEducationLevels(),
      classes: this.getClasses(),
      fee_categories: this.getFeeCategories(),
      fee_items: this.getFeeItems(),
      discount_policies: this.getDiscountPolicies(),
      fee_quotes: this.getQuotes(),
      users: this.getUsers(),
      settings: this.getSettings(),
      audit_logs: this.getAuditLogs()
    };
    return JSON.stringify(data, null, 2);
  }

  public static importFullBackup(jsonString: string, actor: User): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.academic_years) this.set('academic_years', data.academic_years);
      if (data.education_levels) this.set('education_levels', data.education_levels);
      if (data.classes) this.set('classes', data.classes);
      if (data.fee_categories) this.set('fee_categories', data.fee_categories);
      if (data.fee_items) this.set('fee_items', data.fee_items);
      if (data.discount_policies) this.set('discount_policies', data.discount_policies);
      if (data.fee_quotes) this.set('fee_quotes', data.fee_quotes);
      if (data.users) this.set('users', data.users);
      if (data.settings) this.set('settings', data.settings);
      if (data.audit_logs) this.set('audit_logs', data.audit_logs);
      
      this.addAuditLog(actor, 'SAO LƯU / PHỤC HỒI', 'Phục hồi toàn bộ dữ liệu hệ thống từ tệp tin JSON cấu hình');
      return true;
    } catch (e) {
      console.error('Failed to import backup', e);
      return false;
    }
  }

  public static resetToDefault(actor: User): void {
    localStorage.removeItem('thaison_school_academic_years');
    localStorage.removeItem('thaison_school_education_levels');
    localStorage.removeItem('thaison_school_classes');
    localStorage.removeItem('thaison_school_fee_categories');
    localStorage.removeItem('thaison_school_fee_items');
    localStorage.removeItem('thaison_school_discount_policies');
    localStorage.removeItem('thaison_school_fee_quotes');
    localStorage.removeItem('thaison_school_users');
    localStorage.removeItem('thaison_school_settings');
    localStorage.removeItem('thaison_school_audit_logs');
    
    this.addAuditLog(actor, 'CÀI ĐẶT HỆ THỐNG', 'Reset toàn bộ cơ sở dữ liệu về mặc định ban đầu');
  }
}

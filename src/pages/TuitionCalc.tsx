import React, { useState, useMemo, useEffect } from 'react';
import { Database } from '../store/db';
import { 
  FeeItem, 
  AcademicYear, 
  EducationLevel, 
  ClassItem, 
  PaymentTerm, 
  SelectedFeeItem, 
  AppliedDiscount, 
  FeeQuote 
} from '../types';
import { useApp } from '../contexts/AppContext';
import { Card, Input, Select, Button, Badge } from '../components/UI';
import { 
  Calculator, 
  Plus, 
  Minus, 
  CheckCircle, 
  FileText, 
  User, 
  Clock, 
  ArrowRight, 
  ArrowLeft,
  Check,
  Coins, 
  Sparkles,
  Info,
  HelpCircle,
  TrendingUp,
  Bookmark,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function TuitionCalc() {
  const { currentUser, addToast, setSelectedQuoteForSheet, setActiveTab, dbTrigger, triggerDbRefresh } = useApp();

  // 1. Fetch DB records dynamically
  const years = useMemo(() => Database.getAcademicYears().filter(y => y.status === 'active' || true), [dbTrigger]);
  const levels = useMemo(() => Database.getEducationLevels(), [dbTrigger]);
  const classes = useMemo(() => Database.getClasses(), [dbTrigger]);
  const feeItems = useMemo(() => Database.getFeeItems().filter(i => i.visible), [dbTrigger]);
  const discountPolicies = useMemo(() => Database.getDiscountPolicies().filter(p => p.isActive), [dbTrigger]);

  // 2. Calculator Form State (Core student profile)
  const [studentName, setStudentName] = useState('');
  const [studentDob, setStudentDob] = useState('2021-06-01');
  const [selectedYearId, setSelectedYearId] = useState(years[0]?.id || '');
  const [selectedLevelId, setSelectedLevelId] = useState(levels[0]?.id || '');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [paymentTerm, setPaymentTerm] = useState<PaymentTerm>('semester');
  const [siblingOrder, setSiblingOrder] = useState<number>(1);
  const [isEarlyBird, setIsEarlyBird] = useState<boolean>(false);
  const [notes, setNotes] = useState('');

  // 3. New States for Direct Controls: Selected Items, Custom Quantities, and Custom Notes
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [customQuantities, setCustomQuantities] = useState<Record<string, number>>({});
  const [customNotes, setCustomNotes] = useState<Record<string, string>>({});

  // 4. Show/Hide toggles for the hidden discount sections
  const [showTuitionDiscounts, setShowTuitionDiscounts] = useState<boolean>(false);
  const [showFoodDiscounts, setShowFoodDiscounts] = useState<boolean>(false);
  const [showServicesDiscounts, setShowServicesDiscounts] = useState<boolean>(false);

  // 5. Manual extra category-specific discount variables (in addition to automatic ones)
  const [tuitionManualDiscountType, setTuitionManualDiscountType] = useState<'percent' | 'amount'>('percent');
  const [tuitionManualDiscountValue, setTuitionManualDiscountValue] = useState<number>(0);

  const [foodManualDiscountType, setFoodManualDiscountType] = useState<'percent' | 'amount'>('percent');
  const [foodManualDiscountValue, setFoodManualDiscountValue] = useState<number>(0);

  const [servicesManualDiscountType, setServicesManualDiscountType] = useState<'percent' | 'amount'>('percent');
  const [servicesManualDiscountValue, setServicesManualDiscountValue] = useState<number>(0);

  // Synchronize class selection when education level shifts
  const filteredClasses = useMemo(() => {
    return classes.filter(c => c.levelId === selectedLevelId);
  }, [classes, selectedLevelId]);

  useEffect(() => {
    if (filteredClasses.length > 0) {
      setSelectedClassId(filteredClasses[0].id);
    } else {
      setSelectedClassId('');
    }
  }, [filteredClasses]);

  // Retrieve Active Academic Year Config
  const activeYearConfig = useMemo(() => {
    return years.find(y => y.id === selectedYearId) || years[0];
  }, [years, selectedYearId]);

  // Synchronize available fee items and reset states when profile changes
  useEffect(() => {
    if (!selectedYearId || !selectedLevelId) return;

    const compatibleMandatories = feeItems.filter(item => {
      const matchYear = item.yearId === selectedYearId;
      const matchLevel = item.levelId === 'all' || item.levelId === selectedLevelId;
      const matchClass = item.classId === 'all' || item.classId === selectedClassId;
      return matchYear && matchLevel && matchClass && item.type === 'mandatory';
    });

    setSelectedItemIds(compatibleMandatories.map(i => i.id));
    setCustomQuantities({});
    setCustomNotes({});
    setTuitionManualDiscountValue(0);
    setFoodManualDiscountValue(0);
    setServicesManualDiscountValue(0);
    setShowTuitionDiscounts(false);
    setShowFoodDiscounts(false);
    setShowServicesDiscounts(false);
  }, [selectedYearId, selectedLevelId, selectedClassId, feeItems]);

  // Fast auto-fill mock helper for onboarding & training new staff
  const handleLoadMockData = () => {
    setStudentName('Nguyễn Tuấn Kiệt (Học sinh mẫu)');
    setStudentDob('2021-08-15');
    setPaymentTerm('semester');
    setSiblingOrder(1);
    setIsEarlyBird(true);
    setNotes('Báo phí thực hành mẫu cho Phụ huynh - Học sinh Nguyễn Tuấn Kiệt.');

    // Auto select all compatible items
    const compatibles = feeItems.filter(item => {
      const matchYear = item.yearId === selectedYearId;
      const matchLevel = item.levelId === 'all' || item.levelId === selectedLevelId;
      const matchClass = item.classId === 'all' || item.classId === selectedClassId;
      return matchYear && matchLevel && matchClass;
    });

    setSelectedItemIds(compatibles.map(item => item.id));

    // Fill some demo custom quantities & notes
    const demoQ: Record<string, number> = {};
    const demoN: Record<string, string> = {};

    compatibles.forEach(item => {
      if (item.categoryId === 'cat-bantru') {
        demoQ[item.id] = 18; // Change meal days from standard default
        demoN[item.id] = 'Nghỉ có phép 2 ngày dưỡng bệnh';
      }
      if (item.categoryId === 'cat-hocphi') {
        demoN[item.id] = 'Ưu đãi đóng sớm của đợt tuyển sinh';
      }
    });

    setCustomQuantities(demoQ);
    setCustomNotes(demoN);

    // Apply some custom extra discounts
    setTuitionManualDiscountType('percent');
    setTuitionManualDiscountValue(5); // Extra 5% discount
    setShowTuitionDiscounts(true);

    addToast('success', 'Nhập dữ liệu thực hành thành công!', 'Hệ thống đã tự động điền hồ sơ học sinh mẫu, thay đổi số ngày ăn của dịch vụ bán trú và điền ghi chú minh họa.');
  };

  // Helper to compute automatic default quantity based on Year config & Payment term
  const getDefaultQuantity = (item: FeeItem) => {
    if (!activeYearConfig) return 1;

    if (item.unit === 'Tháng') {
      switch (paymentTerm) {
        case 'month': return 1;
        case 'quarter': return 3;
        case 'semester': return activeYearConfig.semesters[0]?.months || 5;
        case 'year': return activeYearConfig.semesters.reduce((acc, sem) => acc + sem.months, 0) || 10;
      }
    } else if (item.unit === 'Ngày') {
      switch (paymentTerm) {
        case 'month': return 20;
        case 'quarter': return 60;
        case 'semester': return Math.round(activeYearConfig.totalBoardingDays / 2) || 90;
        case 'year': return activeYearConfig.totalBoardingDays || 175;
      }
    } else if (item.unit === 'Học kỳ') {
      switch (paymentTerm) {
        case 'month': return 0.2;
        case 'quarter': return 0.6;
        case 'semester': return 1;
        case 'year': return activeYearConfig.semesters.length || 2;
      }
    }
    return 1;
  };

  // 6. Gather and structure all compatible items under active student profile
  const compatibleItems = useMemo(() => {
    if (!selectedYearId || !selectedLevelId) return [];

    return feeItems.filter(item => {
      const matchYear = item.yearId === selectedYearId;
      const matchLevel = item.levelId === 'all' || item.levelId === selectedLevelId;
      const matchClass = item.classId === 'all' || item.classId === selectedClassId;
      return matchYear && matchLevel && matchClass;
    });
  }, [feeItems, selectedYearId, selectedLevelId, selectedClassId]);

  // Split into three distinct UI categories (Tuition, Meals, Services)
  const tuitionCategoryItems = useMemo(() => {
    return compatibleItems.filter(item => item.categoryId === 'cat-hocphi' || item.categoryId === 'cat-bandau');
  }, [compatibleItems]);

  const foodCategoryItems = useMemo(() => {
    return compatibleItems.filter(item => item.categoryId === 'cat-bantru');
  }, [compatibleItems]);

  const servicesCategoryItems = useMemo(() => {
    return compatibleItems.filter(
      item => item.categoryId !== 'cat-hocphi' && item.categoryId !== 'cat-bandau' && item.categoryId !== 'cat-bantru'
    );
  }, [compatibleItems]);

  // Formulate the list of calculated items based on selections, custom quantities, and custom notes
  const finalCalculatedItems = useMemo<SelectedFeeItem[]>(() => {
    const selectedList = compatibleItems.filter(item => selectedItemIds.includes(item.id));
    return selectedList.map(item => {
      const defaultQty = getDefaultQuantity(item);
      const quantity = customQuantities[item.id] !== undefined ? customQuantities[item.id] : defaultQty;
      const noteText = customNotes[item.id] || '';

      return {
        itemId: item.id,
        name: item.name,
        quantity,
        unitPrice: item.price,
        total: Math.round(quantity * item.price),
        unit: item.unit,
        type: item.type,
        notes: noteText || undefined
      };
    });
  }, [compatibleItems, selectedItemIds, customQuantities, customNotes, paymentTerm, activeYearConfig]);

  // Calculations of Subtotals per category
  const tuitionSubtotal = useMemo(() => {
    return finalCalculatedItems
      .filter(item => {
        const fullItem = feeItems.find(f => f.id === item.itemId);
        return fullItem?.categoryId === 'cat-hocphi' || fullItem?.categoryId === 'cat-bandau';
      })
      .reduce((acc, item) => acc + item.total, 0);
  }, [finalCalculatedItems, feeItems]);

  const foodSubtotal = useMemo(() => {
    return finalCalculatedItems
      .filter(item => {
        const fullItem = feeItems.find(f => f.id === item.itemId);
        return fullItem?.categoryId === 'cat-bantru';
      })
      .reduce((acc, item) => acc + item.total, 0);
  }, [finalCalculatedItems, feeItems]);

  const servicesSubtotal = useMemo(() => {
    return finalCalculatedItems
      .filter(item => {
        const fullItem = feeItems.find(f => f.id === item.itemId);
        return fullItem && fullItem.categoryId !== 'cat-hocphi' && fullItem.categoryId !== 'cat-bandau' && fullItem.categoryId !== 'cat-bantru';
      })
      .reduce((acc, item) => acc + item.total, 0);
  }, [finalCalculatedItems, feeItems]);

  const subtotal = useMemo(() => {
    return tuitionSubtotal + foodSubtotal + servicesSubtotal;
  }, [tuitionSubtotal, foodSubtotal, servicesSubtotal]);

  // 7. COMPREHENSIVE DISCOUNTS ENGINE
  const appliedDiscounts = useMemo<AppliedDiscount[]>(() => {
    const list: AppliedDiscount[] = [];

    // Evaluate standard automatic policies on the tuition fee subtotal
    discountPolicies.forEach(policy => {
      if (policy.conditionType === 'payment_term') {
        if (paymentTerm === policy.conditionValue) {
          const discountAmount = policy.discountType === 'percent'
            ? Math.round(tuitionSubtotal * (policy.value / 100))
            : policy.value;

          if (discountAmount > 0) {
            list.push({
              policyId: policy.id,
              name: `${policy.name} (Chính sách đóng phí)`,
              discountValue: discountAmount
            });
          }
        }
      }

      if (policy.conditionType === 'sibling') {
        if (siblingOrder >= 2 && policy.conditionValue === 'second_child') {
          const discountAmount = policy.discountType === 'percent'
            ? Math.round(tuitionSubtotal * (policy.value / 100))
            : policy.value;

          if (discountAmount > 0) {
            list.push({
              policyId: policy.id,
              name: `${policy.name} (Con thứ ${siblingOrder})`,
              discountValue: discountAmount
            });
          }
        }
      }

      if (policy.conditionType === 'early_bird') {
        if (isEarlyBird && policy.conditionValue === 'early_registration') {
          const discountAmount = policy.discountType === 'percent'
            ? Math.round(tuitionSubtotal * (policy.value / 100))
            : policy.value;

          if (discountAmount > 0) {
            list.push({
              policyId: policy.id,
              name: `${policy.name} (Đăng ký giữ chỗ sớm)`,
              discountValue: discountAmount
            });
          }
        }
      }
    });

    // Custom Manual Tuition Discount
    if (tuitionManualDiscountValue > 0) {
      const discountAmount = tuitionManualDiscountType === 'percent'
        ? Math.round(tuitionSubtotal * (tuitionManualDiscountValue / 100))
        : tuitionManualDiscountValue;
      if (discountAmount > 0) {
        list.push({
          policyId: 'manual-tuition-discount',
          name: `Giảm học phí bổ sung (${tuitionManualDiscountType === 'percent' ? tuitionManualDiscountValue + '%' : formatCurrency(tuitionManualDiscountValue)})`,
          discountValue: discountAmount
        });
      }
    }

    // Custom Manual Food Discount
    if (foodManualDiscountValue > 0) {
      const discountAmount = foodManualDiscountType === 'percent'
        ? Math.round(foodSubtotal * (foodManualDiscountValue / 100))
        : foodManualDiscountValue;
      if (discountAmount > 0) {
        list.push({
          policyId: 'manual-food-discount',
          name: `Ưu đãi tiền ăn (${foodManualDiscountType === 'percent' ? foodManualDiscountValue + '%' : formatCurrency(foodManualDiscountValue)})`,
          discountValue: discountAmount
        });
      }
    }

    // Custom Manual Services Discount
    if (servicesManualDiscountValue > 0) {
      const discountAmount = servicesManualDiscountType === 'percent'
        ? Math.round(servicesSubtotal * (servicesManualDiscountValue / 100))
        : servicesManualDiscountValue;
      if (discountAmount > 0) {
        list.push({
          policyId: 'manual-services-discount',
          name: `Giảm giá dịch vụ thêm (${servicesManualDiscountType === 'percent' ? servicesManualDiscountValue + '%' : formatCurrency(servicesManualDiscountValue)})`,
          discountValue: discountAmount
        });
      }
    }

    return list;
  }, [
    discountPolicies,
    paymentTerm,
    siblingOrder,
    isEarlyBird,
    tuitionSubtotal,
    foodSubtotal,
    servicesSubtotal,
    tuitionManualDiscountType,
    tuitionManualDiscountValue,
    foodManualDiscountType,
    foodManualDiscountValue,
    servicesManualDiscountType,
    servicesManualDiscountValue
  ]);

  const discountTotal = useMemo(() => {
    return appliedDiscounts.reduce((acc, d) => acc + d.discountValue, 0);
  }, [appliedDiscounts]);

  const grandTotal = useMemo(() => {
    const total = subtotal - discountTotal;
    return total < 0 ? 0 : total;
  }, [subtotal, discountTotal]);

  // Submit and save Quote record to local memory store
  const handleGenerateQuote = () => {
    if (!studentName.trim()) {
      addToast('error', 'Lỗi nhập liệu', 'Vui lòng điền đầy đủ họ tên học sinh trước khi tạo báo phí.');
      return;
    }

    if (!selectedClassId) {
      addToast('error', 'Lỗi nhập liệu', 'Vui lòng chọn lớp học tương ứng.');
      return;
    }

    try {
      const uniqueQuoteId = Database.generateNextQuoteId(activeYearConfig.name);

      const newQuote: FeeQuote = {
        id: uniqueQuoteId,
        studentName: studentName.trim(),
        studentDob,
        yearId: selectedYearId,
        levelId: selectedLevelId,
        classId: selectedClassId,
        paymentTerm,
        siblingOrder,
        isEarlyBird,
        selectedFeeItems: finalCalculatedItems,
        appliedDiscounts,
        subtotal,
        discountTotal,
        grandTotal,
        createdAt: new Date().toISOString(),
        createdById: currentUser.id,
        createdByName: currentUser.fullName,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10), // valid for 30 days
        notes
      };

      // Append to DB Quotes list
      const currentQuotes = Database.getQuotes();
      Database.setQuotes([newQuote, ...currentQuotes], currentUser, { action: 'TẠO BÁO PHÍ' });

      // Update App State
      setSelectedQuoteForSheet(newQuote);
      triggerDbRefresh();

      addToast('success', 'Tạo báo phí thành công', `Phiếu báo phí ${uniqueQuoteId} đã được lưu thành công.`);

      // Open Quote Sheet directly
      setActiveTab('quote-sheet');
    } catch (e) {
      addToast('error', 'Lỗi xử lý', 'Có lỗi xảy ra khi tạo mã báo phí.');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto">
      
      {/* 1. Header with Fast onboarding training helpers */}
      <div className="bg-gradient-to-r from-brand-navy to-brand-navy-light text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="bg-brand-orange text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
            Dành cho Tuyển sinh & Kế toán mới
          </span>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight uppercase mt-2">
            HỆ THỐNG TÍNH HỌC PHÍ VIỆT ANH
          </h2>
          <p className="text-xs text-neutral-300 mt-1 max-w-xl leading-relaxed">
            Công cụ tính tự động học phí và các dịch vụ tự chọn (bán trú, xe đưa đón). Tự động áp dụng các chương trình ưu đãi và sinh bảng VietQR để gửi phụ huynh.
          </p>
        </div>
        <div className="flex flex-col gap-2 w-full md:w-auto shrink-0">
          <Button 
            variant="success" 
            onClick={handleLoadMockData} 
            className="w-full md:w-auto shadow-md border border-brand-orange/40 hover:scale-[1.02]"
            icon={<Sparkles className="w-4 h-4 animate-bounce" />}
          >
            Nhập thử Học sinh mẫu
          </Button>
          <p className="text-[10px] text-neutral-400 text-center md:text-left">
            💡 Bấm để tự động điền thông tin và chạy thử!
          </p>
        </div>
      </div>

      {/* 3. Main Form Area & Draft Receipt */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: All Calculators Unified */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* PROFILE: Student Information & Payment Term */}
          <Card className="border border-brand-navy/10 shadow-sm">
            <div className="flex items-center gap-2 mb-4 border-b border-neutral-100 dark:border-neutral-800 pb-2.5">
              <div className="w-7 h-7 rounded-lg bg-brand-navy text-white flex items-center justify-center font-bold">
                <User className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="font-bold text-neutral-800 dark:text-neutral-200 text-xs uppercase tracking-wider">
                  Thông tin học sinh & Kỳ đóng phí
                </h4>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Input
                label="Họ tên học sinh *"
                placeholder="Nhập họ tên..."
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="font-medium text-xs text-neutral-900"
                required
              />

              <Input
                label="Ngày sinh"
                type="date"
                value={studentDob}
                onChange={(e) => setStudentDob(e.target.value)}
              />

              <Select
                label="Năm học *"
                value={selectedYearId}
                onChange={(e) => setSelectedYearId(e.target.value)}
              >
                {years.map(y => (
                  <option key={y.id} value={y.id}>Năm {y.name} {y.status === 'active' ? '(Hiện tại)' : ''}</option>
                ))}
              </Select>

              <Select
                label="Khối học *"
                value={selectedLevelId}
                onChange={(e) => setSelectedLevelId(e.target.value)}
              >
                {levels.map(l => (
                  <option key={l.id} value={l.id}>{l.name} ({l.code})</option>
                ))}
              </Select>

              <Select
                label="Lớp học *"
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                disabled={filteredClasses.length === 0}
              >
                {filteredClasses.length === 0 ? (
                  <option value="">Không có lớp</option>
                ) : (
                  filteredClasses.map(c => (
                    <option key={c.id} value={c.id}>Lớp {c.name}</option>
                  ))
                )}
              </Select>

              <div className="flex flex-col gap-1">
                <Select
                  label="Kỳ đóng học phí *"
                  value={paymentTerm}
                  onChange={(e) => setPaymentTerm(e.target.value as PaymentTerm)}
                >
                  <option value="month">Theo Tháng (1 tháng)</option>
                  <option value="quarter">Theo Quý (3 tháng)</option>
                  <option value="semester">Theo Học kỳ (5 tháng)</option>
                  <option value="year">Cả năm (10 tháng)</option>
                </Select>
                <p className="text-[10px] text-brand-orange font-medium mt-1">
                  💡 Hệ thống tự động quy đổi học phí và số ngày ăn tương ứng.
                </p>
              </div>
            </div>
          </Card>

          {/* SECTION 1: TUITION & INITIAL ADMISSION FEES */}
          <Card className="border border-brand-navy/10 shadow-sm">
            <div className="flex justify-between items-center mb-4 border-b border-neutral-100 dark:border-neutral-800 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-brand-orange/10 text-brand-orange flex items-center justify-center text-xs font-bold">1</div>
                <div>
                  <h4 className="font-bold text-neutral-800 dark:text-neutral-200 text-xs uppercase tracking-wider">
                    Học phí & Nhập học
                  </h4>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowTuitionDiscounts(!showTuitionDiscounts)}
                  title="Thiết lập ưu đãi học phí"
                  className={`p-1.5 rounded-lg border transition-all ${
                    showTuitionDiscounts 
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-600' 
                      : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-500 dark:bg-neutral-900 dark:border-neutral-800'
                  }`}
                >
                  <Coins className="w-3.5 h-3.5" />
                </button>
                <Badge variant="warning">Bắt buộc</Badge>
              </div>
            </div>

            {tuitionCategoryItems.length === 0 ? (
              <p className="text-xs text-neutral-400 italic text-center py-4 bg-neutral-50 rounded-xl">Không có khoản phí học chính tương thích.</p>
            ) : (
              <div className="space-y-4">
                {tuitionCategoryItems.map(item => {
                  const isChecked = selectedItemIds.includes(item.id);
                  const defaultQty = getDefaultQuantity(item);
                  const qtyVal = customQuantities[item.id] !== undefined ? customQuantities[item.id] : defaultQty;
                  const itemNote = customNotes[item.id] || '';

                  return (
                    <div 
                      key={item.id} 
                      className={`p-3.5 border rounded-xl transition-all ${
                        isChecked 
                          ? 'border-brand-orange/30 bg-brand-orange/[0.02] shadow-2xs' 
                          : 'border-neutral-100 dark:border-neutral-800 hover:border-neutral-200'
                      }`}
                    >
                      {/* Top Header Row of the Item */}
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex items-start gap-2.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              setSelectedItemIds(prev => 
                                prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id]
                              );
                            }}
                            className="w-4.5 h-4.5 mt-0.5 text-brand-orange border-neutral-300 rounded-sm focus:ring-brand-orange cursor-pointer"
                          />
                          <div>
                            <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100 leading-snug">{item.name}</p>
                            <p className="text-[10px] text-neutral-400 mt-0.5">
                              Mã: <span className="font-mono font-semibold">{item.code}</span> | {formatCurrency(item.price)}/{item.unit}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold font-mono text-neutral-900 dark:text-neutral-100">
                            {formatCurrency(Math.round(qtyVal * item.price))}
                          </span>
                        </div>
                      </div>

                      {/* Editing panel (rendered only when checked) */}
                      {isChecked && (
                        <div className="mt-2.5 pt-2.5 border-t border-dashed border-neutral-150 dark:border-neutral-800 flex flex-wrap items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-neutral-500 uppercase shrink-0">Số lượng:</span>
                            <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 rounded-md p-0.5">
                              <button 
                                type="button"
                                onClick={() => {
                                  const newVal = Math.max(0, qtyVal - 1);
                                  setCustomQuantities(prev => ({ ...prev, [item.id]: newVal }));
                                }}
                                className="w-5.5 h-5.5 rounded bg-white dark:bg-neutral-700 flex items-center justify-center text-xs text-neutral-600 dark:text-neutral-300 font-bold hover:bg-neutral-50 shadow-2xs"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min="0"
                                step="any"
                                value={qtyVal}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value);
                                  setCustomQuantities(prev => ({ ...prev, [item.id]: isNaN(val) ? 0 : val }));
                                }}
                                className="w-10 text-center font-mono text-xs border-0 bg-transparent text-neutral-900 dark:text-white focus:ring-0 p-0"
                              />
                              <button 
                                type="button"
                                onClick={() => {
                                  const newVal = qtyVal + 1;
                                  setCustomQuantities(prev => ({ ...prev, [item.id]: newVal }));
                                }}
                                className="w-5.5 h-5.5 rounded bg-white dark:bg-neutral-700 flex items-center justify-center text-xs text-neutral-600 dark:text-neutral-300 font-bold hover:bg-neutral-50 shadow-2xs"
                              >
                                +
                              </button>
                            </div>
                            <span className="text-[10px] text-neutral-400 font-medium">({item.unit})</span>
                          </div>
                          <div className="flex-1 min-w-[180px]">
                            <input
                              type="text"
                              placeholder="Ghi chú khoản thu..."
                              value={itemNote}
                              onChange={(e) => {
                                const val = e.target.value;
                                setCustomNotes(prev => ({ ...prev, [item.id]: val }));
                              }}
                              className="w-full text-[11px] px-2.5 py-1 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-neutral-50/50 focus:bg-white text-neutral-800 outline-none focus:ring-1 focus:ring-brand-orange"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Hidden Discount Toggle Panel for Tuition */}
            {showTuitionDiscounts && (
              <div className="mt-4 p-4 bg-rose-50/10 dark:bg-rose-950/5 border border-rose-100 dark:border-rose-950/30 rounded-xl space-y-4 animate-fadeIn">
                <div className="flex items-center gap-2 mb-1 pb-1 border-b border-rose-100/50 dark:border-rose-950/30">
                  <Coins className="w-4 h-4 text-rose-600" />
                  <span className="text-xs font-bold text-rose-700 dark:text-rose-400">Ưu đãi & giảm học phí</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Sibling order discount */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-neutral-500 uppercase">Diện con thứ mấy</label>
                    <select
                      value={siblingOrder}
                      onChange={(e) => setSiblingOrder(Number(e.target.value))}
                      className="text-xs py-1.5 px-3 rounded-lg border border-neutral-200 bg-white text-neutral-800 outline-none focus:ring-1 focus:ring-brand-navy"
                    >
                      <option value={1}>Con thứ nhất (Không giảm)</option>
                      <option value={2}>Con thứ hai (Giảm 10%)</option>
                      <option value={3}>Con thứ ba trở lên (Giảm 10%)</option>
                    </select>
                  </div>

                  {/* Early Bird registration discount */}
                  <div className="flex flex-col gap-1 justify-center">
                    <label className="text-[11px] font-bold text-neutral-500 uppercase mb-1">Nộp hồ sơ sớm</label>
                    <label className="inline-flex items-center gap-2 cursor-pointer text-xs bg-white p-2 border border-neutral-200 rounded-lg">
                      <input
                        type="checkbox"
                        checked={isEarlyBird}
                        onChange={(e) => setIsEarlyBird(e.target.checked)}
                        className="w-4 h-4 text-brand-orange border-neutral-300 rounded focus:ring-brand-orange cursor-pointer"
                      />
                      <span className="font-semibold text-neutral-700">Giảm 5% nhập học sớm</span>
                    </label>
                  </div>
                </div>

                {/* Manual Extra Tuition Discount */}
                <div className="pt-3 border-t border-dashed border-neutral-200 flex flex-col gap-2">
                  <label className="text-[11px] font-bold text-neutral-500 uppercase">Miễn giảm bổ sung</label>
                  <div className="flex items-center gap-2">
                    <div className="flex rounded-lg border border-neutral-200 bg-white overflow-hidden shrink-0">
                      <button
                        type="button"
                        onClick={() => setTuitionManualDiscountType('percent')}
                        className={`px-2.5 py-1 text-xs font-bold transition-all ${tuitionManualDiscountType === 'percent' ? 'bg-brand-orange text-white' : 'text-neutral-500 hover:bg-neutral-50'}`}
                      >
                        %
                      </button>
                      <button
                        type="button"
                        onClick={() => setTuitionManualDiscountType('amount')}
                        className={`px-2.5 py-1 text-xs font-bold transition-all ${tuitionManualDiscountType === 'amount' ? 'bg-brand-orange text-white' : 'text-neutral-500 hover:bg-neutral-50'}`}
                      >
                        đ
                      </button>
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={tuitionManualDiscountValue}
                      onChange={(e) => setTuitionManualDiscountValue(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full text-xs p-1.5 rounded-lg border border-neutral-200 bg-white text-neutral-800 outline-none focus:ring-1 focus:ring-brand-orange"
                      placeholder={tuitionManualDiscountType === 'percent' ? 'Nhập % giảm...' : 'Nhập số tiền giảm...'}
                    />
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* SECTION 2: FOOD & MEALS BOARDING FEES */}
          <Card className="border border-brand-navy/10 shadow-sm">
            <div className="flex justify-between items-center mb-4 border-b border-neutral-100 dark:border-neutral-800 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-brand-orange/10 text-brand-orange flex items-center justify-center text-xs font-bold">2</div>
                <div>
                  <h4 className="font-bold text-neutral-800 dark:text-neutral-200 text-xs uppercase tracking-wider">
                    Ăn uống & Bán trú
                  </h4>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowFoodDiscounts(!showFoodDiscounts)}
                  title="Thiết lập ưu đãi ăn uống"
                  className={`p-1.5 rounded-lg border transition-all ${
                    showFoodDiscounts 
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-600' 
                      : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-500 dark:bg-neutral-900 dark:border-neutral-800'
                  }`}
                >
                  <Coins className="w-3.5 h-3.5" />
                </button>
                <Badge variant="success">Bán trú</Badge>
              </div>
            </div>

            {foodCategoryItems.length === 0 ? (
              <p className="text-xs text-neutral-400 italic text-center py-4 bg-neutral-50 rounded-xl">Không có khoản phí ăn uống bán trú phù hợp cho lớp này.</p>
            ) : (
              <div className="space-y-4">
                {foodCategoryItems.map(item => {
                  const isChecked = selectedItemIds.includes(item.id);
                  const defaultQty = getDefaultQuantity(item);
                  const qtyVal = customQuantities[item.id] !== undefined ? customQuantities[item.id] : defaultQty;
                  const itemNote = customNotes[item.id] || '';

                  return (
                    <div 
                      key={item.id} 
                      className={`p-3.5 border rounded-xl transition-all ${
                        isChecked 
                          ? 'border-brand-orange/30 bg-brand-orange/[0.02] shadow-2xs' 
                          : 'border-neutral-100 dark:border-neutral-800 hover:border-neutral-200'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex items-start gap-2.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              setSelectedItemIds(prev => 
                                prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id]
                              );
                            }}
                            className="w-4.5 h-4.5 mt-0.5 text-brand-orange border-neutral-300 rounded-sm focus:ring-brand-orange cursor-pointer"
                          />
                          <div>
                            <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100 leading-snug">{item.name}</p>
                            <p className="text-[10px] text-neutral-400 mt-0.5">
                              Mã: <span className="font-mono font-semibold">{item.code}</span> | {formatCurrency(item.price)}/{item.unit}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold font-mono text-neutral-900 dark:text-neutral-100">
                            {formatCurrency(Math.round(qtyVal * item.price))}
                          </span>
                        </div>
                      </div>

                      {isChecked && (
                        <div className="mt-2.5 pt-2.5 border-t border-dashed border-neutral-150 dark:border-neutral-800 flex flex-wrap items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-neutral-500 uppercase shrink-0">Số ngày ăn:</span>
                            <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 rounded-md p-0.5">
                              <button 
                                type="button"
                                onClick={() => {
                                  const newVal = Math.max(0, qtyVal - 1);
                                  setCustomQuantities(prev => ({ ...prev, [item.id]: newVal }));
                                }}
                                className="w-5.5 h-5.5 rounded bg-white dark:bg-neutral-700 flex items-center justify-center text-xs text-neutral-600 dark:text-neutral-300 font-bold hover:bg-neutral-50 shadow-2xs"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min="0"
                                value={qtyVal}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 0;
                                  setCustomQuantities(prev => ({ ...prev, [item.id]: val }));
                                }}
                                className="w-10 text-center font-mono text-xs border-0 bg-transparent text-neutral-900 dark:text-white focus:ring-0 p-0"
                              />
                              <button 
                                type="button"
                                onClick={() => {
                                  const newVal = qtyVal + 1;
                                  setCustomQuantities(prev => ({ ...prev, [item.id]: newVal }));
                                }}
                                className="w-5.5 h-5.5 rounded bg-white dark:bg-neutral-700 flex items-center justify-center text-xs text-neutral-600 dark:text-neutral-300 font-bold hover:bg-neutral-50 shadow-2xs"
                              >
                                +
                              </button>
                            </div>
                            <span className="text-[10px] text-neutral-400 font-medium">(Ngày)</span>
                          </div>
                          <div className="flex-1 min-w-[180px]">
                            <input
                              type="text"
                              placeholder="Ghi chú cụ thể..."
                              value={itemNote}
                              onChange={(e) => {
                                const val = e.target.value;
                                setCustomNotes(prev => ({ ...prev, [item.id]: val }));
                              }}
                              className="w-full text-[11px] px-2.5 py-1 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-neutral-50/50 focus:bg-white text-neutral-800 outline-none focus:ring-1 focus:ring-brand-orange"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Hidden Discount Toggle Panel for Food */}
            {showFoodDiscounts && (
              <div className="mt-4 p-4 bg-rose-50/10 dark:bg-rose-950/5 border border-rose-100 dark:border-rose-950/30 rounded-xl space-y-3 animate-fadeIn">
                <div className="flex items-center gap-2 mb-1 pb-1 border-b border-rose-100/50 dark:border-rose-950/30">
                  <Coins className="w-4 h-4 text-rose-600" />
                  <span className="text-xs font-bold text-rose-700 dark:text-rose-400">Giảm trừ phí ăn đặc thù</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex rounded-lg border border-neutral-200 bg-white overflow-hidden shrink-0">
                    <button
                      type="button"
                      onClick={() => setFoodManualDiscountType('percent')}
                      className={`px-2.5 py-1 text-xs font-bold transition-all ${foodManualDiscountType === 'percent' ? 'bg-brand-orange text-white' : 'text-neutral-500 hover:bg-neutral-50'}`}
                    >
                      %
                    </button>
                    <button
                      type="button"
                      onClick={() => setFoodManualDiscountType('amount')}
                      className={`px-2.5 py-1 text-xs font-bold transition-all ${foodManualDiscountType === 'amount' ? 'bg-brand-orange text-white' : 'text-neutral-500 hover:bg-neutral-50'}`}
                    >
                      đ
                    </button>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={foodManualDiscountValue}
                    onChange={(e) => setFoodManualDiscountValue(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full text-xs p-1.5 rounded-lg border border-neutral-200 bg-white text-neutral-800 outline-none focus:ring-1 focus:ring-brand-orange"
                    placeholder={foodManualDiscountType === 'percent' ? 'Nhập % giảm...' : 'Nhập số tiền giảm...'}
                  />
                </div>
              </div>
            )}
          </Card>

          {/* SECTION 3: OTHER SERVICES & EXTRAS */}
          <Card className="border border-brand-navy/10 shadow-sm">
            <div className="flex justify-between items-center mb-4 border-b border-neutral-100 dark:border-neutral-800 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-brand-orange/10 text-brand-orange flex items-center justify-center text-xs font-bold">3</div>
                <div>
                  <h4 className="font-bold text-neutral-800 dark:text-neutral-200 text-xs uppercase tracking-wider">
                    Dịch vụ & Tiện ích khác
                  </h4>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowServicesDiscounts(!showServicesDiscounts)}
                  title="Thiết lập ưu đãi dịch vụ"
                  className={`p-1.5 rounded-lg border transition-all ${
                    showServicesDiscounts 
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-600' 
                      : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-500 dark:bg-neutral-900 dark:border-neutral-800'
                  }`}
                >
                  <Coins className="w-3.5 h-3.5" />
                </button>
                <Badge variant="neutral">Tự chọn</Badge>
              </div>
            </div>

            {servicesCategoryItems.length === 0 ? (
              <p className="text-xs text-neutral-400 italic text-center py-4 bg-neutral-50 rounded-xl">Không có dịch vụ ngoài khóa / tiện ích thêm nào phù hợp cấp lớp học này.</p>
            ) : (
              <div className="space-y-4">
                {servicesCategoryItems.map(item => {
                  const isChecked = selectedItemIds.includes(item.id);
                  const defaultQty = getDefaultQuantity(item);
                  const qtyVal = customQuantities[item.id] !== undefined ? customQuantities[item.id] : defaultQty;
                  const itemNote = customNotes[item.id] || '';

                  return (
                    <div 
                      key={item.id} 
                      className={`p-3.5 border rounded-xl transition-all ${
                        isChecked 
                          ? 'border-brand-orange/30 bg-brand-orange/[0.02] shadow-2xs' 
                          : 'border-neutral-100 dark:border-neutral-800 hover:border-neutral-200'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex items-start gap-2.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              setSelectedItemIds(prev => 
                                prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id]
                              );
                            }}
                            className="w-4.5 h-4.5 mt-0.5 text-brand-orange border-neutral-300 rounded-sm focus:ring-brand-orange cursor-pointer"
                          />
                          <div>
                            <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100 leading-snug">{item.name}</p>
                            <p className="text-[10px] text-neutral-400 mt-0.5">
                              Mã: <span className="font-mono font-semibold">{item.code}</span> | {formatCurrency(item.price)}/{item.unit}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold font-mono text-neutral-900 dark:text-neutral-100">
                            {formatCurrency(Math.round(qtyVal * item.price))}
                          </span>
                        </div>
                      </div>

                      {isChecked && (
                        <div className="mt-2.5 pt-2.5 border-t border-dashed border-neutral-150 dark:border-neutral-800 flex flex-wrap items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-neutral-500 uppercase shrink-0">Số lượng:</span>
                            <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 rounded-md p-0.5">
                              <button 
                                type="button"
                                onClick={() => {
                                  const newVal = Math.max(0, qtyVal - 1);
                                  setCustomQuantities(prev => ({ ...prev, [item.id]: newVal }));
                                }}
                                className="w-5.5 h-5.5 rounded bg-white dark:bg-neutral-700 flex items-center justify-center text-xs text-neutral-600 dark:text-neutral-300 font-bold hover:bg-neutral-50 shadow-2xs"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min="0"
                                step="any"
                                value={qtyVal}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value);
                                  setCustomQuantities(prev => ({ ...prev, [item.id]: isNaN(val) ? 0 : val }));
                                }}
                                className="w-10 text-center font-mono text-xs border-0 bg-transparent text-neutral-900 dark:text-white focus:ring-0 p-0"
                              />
                              <button 
                                type="button"
                                onClick={() => {
                                  const newVal = qtyVal + 1;
                                  setCustomQuantities(prev => ({ ...prev, [item.id]: newVal }));
                                }}
                                className="w-5.5 h-5.5 rounded bg-white dark:bg-neutral-700 flex items-center justify-center text-xs text-neutral-600 dark:text-neutral-300 font-bold hover:bg-neutral-50 shadow-2xs"
                              >
                                +
                              </button>
                            </div>
                            <span className="text-[10px] text-neutral-400 font-medium">({item.unit})</span>
                          </div>
                          <div className="flex-1 min-w-[180px]">
                            <input
                              type="text"
                              placeholder="Ghi chú chi tiết..."
                              value={itemNote}
                              onChange={(e) => {
                                const val = e.target.value;
                                setCustomNotes(prev => ({ ...prev, [item.id]: val }));
                              }}
                              className="w-full text-[11px] px-2.5 py-1 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-neutral-50/50 focus:bg-white text-neutral-800 outline-none focus:ring-1 focus:ring-brand-orange"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Hidden Discount Toggle Panel for Services */}
            {showServicesDiscounts && (
              <div className="mt-4 p-4 bg-rose-50/10 dark:bg-rose-950/5 border border-rose-100 dark:border-rose-950/30 rounded-xl space-y-3 animate-fadeIn">
                <div className="flex items-center gap-2 mb-1 pb-1 border-b border-rose-100/50 dark:border-rose-950/30">
                  <Coins className="w-4 h-4 text-rose-600" />
                  <span className="text-xs font-bold text-rose-700 dark:text-rose-400">Miễn giảm tiền dịch vụ tự chọn</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex rounded-lg border border-neutral-200 bg-white overflow-hidden shrink-0">
                    <button
                      type="button"
                      onClick={() => setServicesManualDiscountType('percent')}
                      className={`px-2.5 py-1 text-xs font-bold transition-all ${servicesManualDiscountType === 'percent' ? 'bg-brand-orange text-white' : 'text-neutral-500 hover:bg-neutral-50'}`}
                    >
                      %
                    </button>
                    <button
                      type="button"
                      onClick={() => setServicesManualDiscountType('amount')}
                      className={`px-2.5 py-1 text-xs font-bold transition-all ${servicesManualDiscountType === 'amount' ? 'bg-brand-orange text-white' : 'text-neutral-500 hover:bg-neutral-50'}`}
                    >
                      đ
                    </button>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={servicesManualDiscountValue}
                    onChange={(e) => setServicesManualDiscountValue(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full text-xs p-1.5 rounded-lg border border-neutral-200 bg-white text-neutral-800 outline-none focus:ring-1 focus:ring-brand-orange"
                    placeholder={servicesManualDiscountType === 'percent' ? 'Nhập % giảm...' : 'Nhập số tiền giảm...'}
                  />
                </div>
              </div>
            )}
          </Card>

          {/* GENERAL BILLING REMARKS / NOTES */}
          <Card className="border border-brand-navy/10 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Bookmark className="w-4.5 h-4.5 text-neutral-400" />
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Ghi chú chung của báo phí (In ra trên phiếu báo phí)</label>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Nhập ghi chú chung quan trọng, ví dụ hạn đóng tiền hoặc các lưu ý khác gửi phụ huynh học sinh..."
              rows={3}
              className="w-full text-xs p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy transition-colors"
            />
          </Card>

        </div>

        {/* RIGHT COLUMN: Real-time Invoice preview & totals breakdown */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 flex flex-col gap-6">
          
          <Card className="border-2 border-brand-orange/20 shadow-lg relative overflow-hidden bg-white dark:bg-neutral-950">
            {/* Header decoration */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-brand-orange" />

            <div className="flex justify-between items-center border-b border-neutral-100 dark:border-neutral-800 pb-3 mb-4">
              <div>
                <h4 className="font-bold text-neutral-900 dark:text-neutral-100 text-sm uppercase flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-brand-orange" />
                  <span>Dự thảo báo phí gốc</span>
                </h4>
                <p className="text-[10px] text-neutral-400">Cập nhật số liệu theo thời gian thực</p>
              </div>
              <Badge variant="success">
                {paymentTerm === 'month' ? '1 Tháng' : paymentTerm === 'quarter' ? 'Quý' : paymentTerm === 'semester' ? 'Học Kỳ 1' : 'Cả Năm'}
              </Badge>
            </div>

            {/* Calculations items listing */}
            <div className="space-y-4 mb-6">
              
              <div className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Các khoản thu được tích chọn</div>
              
              {finalCalculatedItems.length === 0 ? (
                <div className="text-xs text-neutral-400 italic py-6 text-center border border-dashed border-neutral-150 rounded-xl bg-neutral-50/50">
                  Vui lòng tích chọn ít nhất một khoản thu ở cột bên trái để hiển thị báo phí dự thảo.
                </div>
              ) : (
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1 border border-neutral-100 dark:border-neutral-900 p-3 rounded-xl bg-neutral-50/50">
                  {finalCalculatedItems.map(item => (
                    <div key={item.itemId} className="flex flex-col border-b border-neutral-100 dark:border-neutral-800/50 pb-2.5 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start text-xs">
                        <div className="max-w-[70%]">
                          <p className="font-bold text-neutral-800 dark:text-neutral-200 text-[11px] leading-tight">{item.name}</p>
                          <p className="text-[10px] text-neutral-400 mt-0.5 font-mono">
                            {item.quantity} {item.unit === 'Tháng' ? 'tháng' : item.unit === 'Ngày' ? 'ngày thực học' : item.unit} × {formatCurrency(item.unitPrice)}
                          </p>
                        </div>
                        <span className="font-bold font-mono text-neutral-900 dark:text-neutral-100 shrink-0">{formatCurrency(item.total)}</span>
                      </div>
                      {item.notes && (
                        <p className="text-[10px] text-brand-orange font-medium mt-1 bg-brand-orange/5 px-2 py-0.5 rounded border border-brand-orange/10 self-start">
                          📝 {item.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Formula explanation */}
              <div className="border border-brand-navy/15 rounded-xl p-3 bg-brand-light-bg/50 flex gap-2.5 items-start text-[10px] text-neutral-500 leading-normal">
                <Info className="w-4.5 h-4.5 text-brand-orange shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-neutral-800 dark:text-neutral-200">Quy tắc tự động của Việt Anh:</p>
                  <p className="mt-0.5">
                    • Học phí & Xe đưa đón tính theo chu kỳ đóng.<br />
                    • Tiền ăn bán trú tính theo ngày thực học thực tế ({paymentTerm === 'year' ? activeYearConfig?.totalBoardingDays : paymentTerm === 'semester' ? Math.round(activeYearConfig?.totalBoardingDays / 2) : paymentTerm === 'quarter' ? 60 : 20} ngày ăn).
                  </p>
                </div>
              </div>

              {/* Discounts subtraction */}
              {appliedDiscounts.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-neutral-150 dark:border-neutral-800">
                  <div className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Ưu đãi miễn giảm được khấu trừ</div>
                  <div className="space-y-1.5">
                    {appliedDiscounts.map(disc => (
                      <div key={disc.policyId} className="flex justify-between text-xs text-rose-600 dark:text-rose-400 font-bold bg-rose-50/50 dark:bg-rose-950/20 px-2.5 py-1.5 rounded-lg border border-rose-100 dark:border-rose-950/30">
                        <span>• {disc.name}</span>
                        <span className="font-bold font-mono">-{formatCurrency(disc.discountValue)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Calculations total sum block */}
            <div className="bg-brand-navy text-white rounded-xl p-4 flex flex-col gap-2 mb-6 shadow-sm">
              <div className="flex justify-between text-xs text-neutral-300">
                <span>Cộng gộp học phí & dịch vụ:</span>
                <span className="font-semibold font-mono">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs text-brand-orange font-bold">
                <span>Tổng giá trị ưu đãi hỗ trợ:</span>
                <span className="font-bold font-mono">-{formatCurrency(discountTotal)}</span>
              </div>
              <div className="flex justify-between items-center text-xs pt-2.5 border-t border-brand-navy-light/40">
                <span className="font-bold uppercase tracking-wider text-[11px]">Tổng Thực Đóng (VND):</span>
                <span className="text-lg font-extrabold text-brand-orange font-mono leading-none">{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            {/* Submit Action Button */}
            <Button
              variant="success"
              size="lg"
              className="w-full text-center text-sm py-3 font-bold uppercase tracking-wider hover:scale-[1.01]"
              onClick={handleGenerateQuote}
              disabled={!studentName.trim() || finalCalculatedItems.length === 0}
              icon={<CheckCircle className="w-5 h-5" />}
            >
              Phê duyệt & In báo phí (VietQR)
            </Button>
            
          </Card>

          {/* 4. ONBOARDING 5-MINUTE PROGRESS CHECKLIST */}
          <Card className="border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/20 p-4">
            <h5 className="font-bold text-xs uppercase tracking-wider text-brand-orange mb-3 flex items-center gap-1.5">
              <Bookmark className="w-4 h-4" />
              <span>Tiến trình tuyển sinh (Đào tạo 5 phút)</span>
            </h5>
            
            <div className="space-y-2.5 text-xs text-neutral-600 dark:text-neutral-400">
              
              <div className="flex items-center gap-2.5">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                  studentName.trim().length >= 3 
                    ? 'bg-emerald-500 border-emerald-500 text-white' 
                    : 'border-neutral-300 text-neutral-400 bg-white dark:bg-neutral-900'
                }`}>
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className={studentName.trim().length >= 3 ? 'line-through text-neutral-400' : ''}>
                  Điền họ tên Học sinh đầy đủ
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                  selectedClassId !== '' 
                    ? 'bg-emerald-500 border-emerald-500 text-white' 
                    : 'border-neutral-300 text-neutral-400 bg-white dark:bg-neutral-900'
                }`}>
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className={selectedClassId !== '' ? 'line-through text-neutral-400' : ''}>
                  Chọn Khối học & xếp vào Lớp học tương ứng
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border bg-emerald-500 border-emerald-500 text-white`}>
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="line-through text-neutral-400">
                  Chọn Phương thức Đóng (Tháng/Quý/Kỳ/Năm)
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                  selectedItemIds.length > 0
                    ? 'bg-emerald-500 border-emerald-500 text-white' 
                    : 'border-neutral-300 text-neutral-400 bg-white dark:bg-neutral-900'
                }`}>
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className={selectedItemIds.length > 0 ? 'line-through text-neutral-400' : ''}>
                  Xét chọn, điều chỉnh Số lượng / Ghi chú hoặc Giảm giá đặc biệt
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                  !studentName.trim() || finalCalculatedItems.length === 0
                    ? 'border-neutral-300 text-neutral-400 bg-white dark:bg-neutral-900'
                    : 'bg-brand-orange border-brand-orange text-white animate-pulse'
                }`}>
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className={studentName.trim() && finalCalculatedItems.length > 0 ? 'font-bold text-brand-orange' : ''}>
                  Nhấn nút xanh lá &quot;Phê duyệt & In báo phí (VietQR)&quot;
                </span>
              </div>

            </div>
          </Card>

        </div>

      </div>

    </div>
  );
}

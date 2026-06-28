import React, { useState, useMemo } from 'react';
import { Database } from '../store/db';
import { FeeQuote, SelectedFeeItem, AppliedDiscount, PaymentTerm } from '../types';
import { useApp } from '../contexts/AppContext';
import { Card, Input, Button, Badge, Modal, Select } from '../components/UI';
import { 
  Search, 
  Printer, 
  Copy, 
  Edit2, 
  Trash2, 
  Download, 
  Filter, 
  Calendar, 
  User, 
  Eye,
  RefreshCw,
  Coins
} from 'lucide-react';

export default function QuoteHistory() {
  const { currentUser, setSelectedQuoteForSheet, setActiveTab, addToast, dbTrigger, triggerDbRefresh } = useApp();
  
  // 1. Fetch DB records
  const initialQuotes = useMemo(() => Database.getQuotes(), [dbTrigger]);
  const levels = useMemo(() => Database.getEducationLevels(), [dbTrigger]);
  const classes = useMemo(() => Database.getClasses(), [dbTrigger]);
  const years = useMemo(() => Database.getAcademicYears(), [dbTrigger]);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevelId, setFilterLevelId] = useState('all');
  const [filterYearId, setFilterYearId] = useState('all');

  // Modal edit states
  const [editingQuote, setEditingQuote] = useState<FeeQuote | null>(null);
  const [editStudentName, setEditStudentName] = useState('');
  const [editStudentDob, setEditStudentDob] = useState('');
  const [editPaymentTerm, setEditPaymentTerm] = useState<PaymentTerm>('semester');
  const [editNotes, setEditNotes] = useState('');

  // 2. Filter logic
  const filteredQuotes = useMemo(() => {
    return initialQuotes.filter(q => {
      const matchSearch = 
        q.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.createdByName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchLevel = filterLevelId === 'all' || q.levelId === filterLevelId;
      const matchYear = filterYearId === 'all' || q.yearId === filterYearId;

      return matchSearch && matchLevel && matchYear;
    });
  }, [initialQuotes, searchQuery, filterLevelId, filterYearId]);

  // Helper formatting
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    } catch {
      return dateStr;
    }
  };

  const getTermLabel = (term: string) => {
    switch (term) {
      case 'month': return 'Tháng';
      case 'quarter': return 'Quý';
      case 'semester': return 'Học kỳ';
      case 'year': return 'Cả năm';
      default: return term;
    }
  };

  // 3. Actions: View/Print
  const handleViewQuote = (quote: FeeQuote) => {
    setSelectedQuoteForSheet(quote);
    setActiveTab('quote-sheet');
    addToast('info', 'Xem báo phí', `Đang hiển thị biểu phí cho học sinh ${quote.studentName}`);
  };

  // 4. Actions: Clone / Duplicate
  const handleCloneQuote = (quote: FeeQuote) => {
    try {
      const nextQuoteId = Database.generateNextQuoteId(years.find(y => y.id === quote.yearId)?.name || '2026');
      
      const cloned: FeeQuote = {
        ...quote,
        id: nextQuoteId,
        studentName: `${quote.studentName} (Bản sao)`,
        createdAt: new Date().toISOString(),
        createdById: currentUser.id,
        createdByName: currentUser.fullName
      };

      const updated = [cloned, ...initialQuotes];
      Database.setQuotes(updated, currentUser, { action: 'NHÂN BẢN BÁO PHÍ' });
      triggerDbRefresh();
      addToast('success', 'Nhân bản thành công', `Bản sao đã được tạo với mã mới: ${nextQuoteId}`);
    } catch {
      addToast('error', 'Lỗi nhân bản', 'Không thể nhân bản phiếu báo phí này.');
    }
  };

  // 5. Actions: Edit Basic Info
  const handleOpenEdit = (quote: FeeQuote) => {
    // Security check: Admissions or accountant or admin
    if (currentUser.role === 'marketing') {
      addToast('warning', 'Hạn chế quyền', 'Marketing chỉ có quyền xem lịch sử, không có quyền chỉnh sửa.');
      return;
    }

    setEditingQuote(quote);
    setEditStudentName(quote.studentName);
    setEditStudentDob(quote.studentDob);
    setEditPaymentTerm(quote.paymentTerm);
    setEditNotes(quote.notes);
  };

  const handleSaveEdit = () => {
    if (!editingQuote) return;
    if (!editStudentName.trim()) {
      addToast('error', 'Thiếu dữ liệu', 'Vui lòng điền họ tên học sinh.');
      return;
    }

    try {
      const updatedList = initialQuotes.map(q => {
        if (q.id === editingQuote.id) {
          // If the payment term has changed, we should trigger a dynamic recalculation inside the database for this specific quote!
          // Let's implement an elegant in-place recalculation
          let recalculatedItems = [...q.selectedFeeItems];
          const activeYear = years.find(y => y.id === q.yearId) || years[0];

          if (q.paymentTerm !== editPaymentTerm && activeYear) {
            recalculatedItems = q.selectedFeeItems.map(item => {
              let qty = item.quantity;
              
              if (item.unit === 'Tháng') {
                switch (editPaymentTerm) {
                  case 'month': qty = 1; break;
                  case 'quarter': qty = 3; break;
                  case 'semester': qty = activeYear.semesters[0]?.months || 5; break;
                  case 'year': qty = activeYear.semesters.reduce((acc, sem) => acc + sem.months, 0) || 10; break;
                }
              } else if (item.unit === 'Ngày') {
                switch (editPaymentTerm) {
                  case 'month': qty = 20; break;
                  case 'quarter': qty = 60; break;
                  case 'semester': qty = Math.round(activeYear.totalBoardingDays / 2) || 90; break;
                  case 'year': qty = activeYear.totalBoardingDays || 175; break;
                }
              } else if (item.unit === 'Học kỳ') {
                switch (editPaymentTerm) {
                  case 'month': qty = 0.2; break;
                  case 'quarter': qty = 0.6; break;
                  case 'semester': qty = 1; break;
                  case 'year': qty = activeYear.semesters.length || 2; break;
                }
              }

              return {
                ...item,
                quantity: qty,
                total: Math.round(qty * item.unitPrice)
              };
            });
          }

          const newSubtotal = recalculatedItems.reduce((acc, i) => acc + i.total, 0);

          // Recalculate discounts based on new payment term
          const tuitionSubtotal = recalculatedItems
            .filter(item => {
              const fullItem = Database.getFeeItems().find(f => f.id === item.itemId);
              return fullItem?.categoryId === 'cat-hocphi';
            })
            .reduce((acc, item) => acc + item.total, 0);

          let newAppliedDiscounts = [...q.appliedDiscounts];
          // Replace or adjust payment term discounts
          const discountPolicies = Database.getDiscountPolicies().filter(p => p.isActive);
          
          newAppliedDiscounts = q.appliedDiscounts.map(disc => {
            const policy = discountPolicies.find(p => p.id === disc.policyId);
            if (policy && policy.conditionType === 'payment_term') {
              if (policy.conditionValue === editPaymentTerm) {
                const discountVal = policy.discountType === 'percent'
                  ? Math.round(tuitionSubtotal * (policy.value / 100))
                  : policy.value;
                return { ...disc, discountValue: discountVal };
              } else {
                // Not matching this term anymore
                return { ...disc, discountValue: 0 };
              }
            }
            // Retain sibling / other discounts but recalculate their percentages since tuitionSubtotal might have changed
            if (policy && ['sibling', 'early_bird'].includes(policy.conditionType)) {
              const discountVal = policy.discountType === 'percent'
                ? Math.round(tuitionSubtotal * (policy.value / 100))
                : policy.value;
              return { ...disc, discountValue: discountVal };
            }
            return disc;
          }).filter(d => d.discountValue > 0);

          const newDiscountTotal = newAppliedDiscounts.reduce((acc, d) => acc + d.discountValue, 0);
          const newGrandTotal = Math.max(0, newSubtotal - newDiscountTotal);

          return {
            ...q,
            studentName: editStudentName.trim(),
            studentDob: editStudentDob,
            paymentTerm: editPaymentTerm,
            notes: editNotes,
            selectedFeeItems: recalculatedItems,
            appliedDiscounts: newAppliedDiscounts,
            subtotal: newSubtotal,
            discountTotal: newDiscountTotal,
            grandTotal: newGrandTotal
          };
        }
        return q;
      });

      Database.setQuotes(updatedList, currentUser, { action: `CHỈNH SỬA BÁO PHÍ: ${editingQuote.id}` });
      
      // Update changing log detail explicitly
      const originalQuote = initialQuotes.find(q => q.id === editingQuote.id);
      if (originalQuote) {
        Database.addAuditLog(
          currentUser, 
          'HIỆU CHỈNH BÁO PHÍ', 
          `Hiệu chỉnh thông tin phiếu báo phí ${editingQuote.id} của học sinh ${editStudentName}`,
          JSON.stringify(originalQuote),
          JSON.stringify(updatedList.find(q => q.id === editingQuote.id))
        );
      }

      triggerDbRefresh();
      setEditingQuote(null);
      addToast('success', 'Cập nhật thành công', `Phiếu báo phí ${editingQuote.id} đã được lưu.`);
    } catch {
      addToast('error', 'Lỗi cập nhật', 'Không thể hiệu chỉnh phiếu báo phí này.');
    }
  };

  // 6. Action: Delete Quote
  const handleDeleteQuote = (quoteId: string) => {
    // Check permissions
    if (currentUser.role !== 'admin' && currentUser.role !== 'accountant') {
      addToast('error', 'Từ chối truy cập', 'Chỉ Quản trị viên hoặc Kế toán mới có quyền xóa phiếu báo phí.');
      return;
    }

    if (window.confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn phiếu báo phí ${quoteId}? Thao tác này không thể khôi phục.`)) {
      const updated = initialQuotes.filter(q => q.id !== quoteId);
      Database.setQuotes(updated, currentUser, { action: `XÓA BÁO PHÍ: ${quoteId}` });
      Database.addAuditLog(currentUser, 'XÓA BÁO PHÍ', `Đã xóa phiếu báo học phí mã ${quoteId}`);
      triggerDbRefresh();
      addToast('success', 'Xóa thành công', `Đã xóa vĩnh viễn phiếu ${quoteId}.`);
    }
  };

  // 7. EXPORT HISTORIC RECORD TO EXCEL / CSV
  const handleExportCSV = () => {
    if (currentUser.role === 'marketing') {
      addToast('warning', 'Hạn chế quyền', 'Tài khoản Marketing không có quyền xuất tập tin Excel/CSV.');
      return;
    }

    try {
      let csvContent = 'Mã báo phí,Ngày tạo,Họ tên học sinh,Cấp học,Lớp,Hình thức đóng,Tổng phụ thu (đ),Giảm trừ ưu đãi (đ),Thực đóng (đ),Người lập\n';
      
      filteredQuotes.forEach(q => {
        const lvlName = levels.find(l => l.id === q.levelId)?.name || '';
        const clsName = classes.find(c => c.id === q.classId)?.name || '';
        
        csvContent += `"${q.id}","${q.createdAt.substring(0, 10)}","${q.studentName}","${lvlName}","${clsName}","${getTermLabel(q.paymentTerm)}",${q.subtotal},${q.discountTotal},${q.grandTotal},"${q.createdByName}"\n`;
      });

      // Standard browser download trigger
      const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' }); // Add UTF-8 BOM
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', `ThaiSon_BaoPhi_LichSu_${new Date().toISOString().substring(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      addToast('success', 'Xuất dữ liệu thành công', `Đã xuất ${filteredQuotes.length} bản ghi báo phí ra tệp CSV.`);
    } catch {
      addToast('error', 'Lỗi xuất dữ liệu', 'Không thể tạo tệp CSV xuất bản.');
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 dark:border-neutral-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 uppercase">
            LỊCH SỬ TÍNH PHÍ & BẢNG BÁO GIÁ
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Tra cứu, in lại phiếu báo học phí, nhân bản hồ sơ tuyển sinh nhanh và xuất bảng dữ liệu kế toán.
          </p>
        </div>
        
        {currentUser.role !== 'marketing' && (
          <Button variant="secondary" size="sm" onClick={handleExportCSV} icon={<Download className="w-4 h-4" />}>
            Xuất Excel / CSV
          </Button>
        )}
      </div>

      {/* 1. Searching & Filters Row */}
      <Card className="p-4 bg-neutral-50/50">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          
          <div className="sm:col-span-2">
            <Input
              label="Tìm kiếm nhanh"
              placeholder="Nhập tên học sinh, mã báo phí (TS-...), người lập..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>

          <Select
            label="Lọc theo cấp học"
            value={filterLevelId}
            onChange={(e) => setFilterLevelId(e.target.value)}
          >
            <option value="all">Tất cả cấp học</option>
            {levels.map(l => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </Select>

          <Select
            label="Lọc năm học"
            value={filterYearId}
            onChange={(e) => setFilterYearId(e.target.value)}
          >
            <option value="all">Tất cả năm học</option>
            {years.map(y => (
              <option key={y.id} value={y.id}>Năm học {y.name}</option>
            ))}
          </Select>

        </div>
      </Card>

      {/* 2. Historic List Grid Table */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-950/50 text-neutral-500 font-bold uppercase border-b border-neutral-100 dark:border-neutral-800">
                <th className="p-4 text-center w-12">STT</th>
                <th className="p-4">Mã Báo Phí</th>
                <th className="p-4">Ngày tạo</th>
                <th className="p-4">Học sinh</th>
                <th className="p-4">Cấp / Lớp</th>
                <th className="p-4">Đóng phí</th>
                <th className="p-4 text-right">Thực đóng</th>
                <th className="p-4">Người lập</th>
                <th className="p-4 text-center w-48">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {filteredQuotes.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-neutral-400 italic">
                    Không tìm thấy phiếu báo phí nào thỏa mãn bộ lọc tìm kiếm.
                  </td>
                </tr>
              ) : (
                filteredQuotes.map((q, idx) => {
                  const lvlName = levels.find(l => l.id === q.levelId)?.name || '';
                  const clsName = classes.find(c => c.id === q.classId)?.name || '';
                  
                  return (
                    <tr key={q.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20">
                      <td className="p-4 text-center text-neutral-400 font-mono">{idx + 1}</td>
                      <td className="p-4 font-bold text-brand-navy dark:text-brand-orange font-mono">{q.id}</td>
                      <td className="p-4 text-neutral-500">{formatDate(q.createdAt)}</td>
                      <td className="p-4">
                        <div className="font-bold text-neutral-800 dark:text-neutral-200">{q.studentName}</div>
                        <div className="text-[10px] text-neutral-400">Sinh nhật: {formatDate(q.studentDob).substring(0, 10)}</div>
                      </td>
                      <td className="p-4">
                        <span className="font-medium">{lvlName}</span>
                        <div className="text-[10px] text-neutral-400">Lớp: {clsName}</div>
                      </td>
                      <td className="p-4">
                        <span className="inline-block bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold px-2 py-0.5 rounded-md text-[10px]">
                          {getTermLabel(q.paymentTerm)}
                        </span>
                      </td>
                      <td className="p-4 text-right font-bold text-brand-orange font-mono">
                        {formatCurrency(q.grandTotal)}
                        {q.discountTotal > 0 && (
                          <div className="text-[10px] text-rose-500 line-through font-normal font-mono">{formatCurrency(q.subtotal)}</div>
                        )}
                      </td>
                      <td className="p-4 text-neutral-500">
                        <div className="font-medium text-neutral-800 dark:text-neutral-200">{q.createdByName}</div>
                        <div className="text-[9px] text-neutral-400 uppercase tracking-wider">Nhân viên</div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center items-center gap-1.5">
                          
                          {/* Printable sheet review */}
                          <button
                            onClick={() => handleViewQuote(q)}
                            className="p-1.5 hover:bg-brand-orange/10 text-brand-orange rounded-md transition-colors cursor-pointer"
                            title="Xem phiếu báo phí / In VietQR"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Clone */}
                          {currentUser.role !== 'marketing' && (
                            <button
                              onClick={() => handleCloneQuote(q)}
                              className="p-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-indigo-600 rounded-md transition-colors cursor-pointer"
                              title="Nhân bản phiếu báo giá"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          )}

                          {/* Edit basic details */}
                          {currentUser.role !== 'marketing' && (
                            <button
                              onClick={() => handleOpenEdit(q)}
                              className="p-1.5 hover:bg-sky-50 dark:hover:bg-sky-950/40 text-sky-600 rounded-md transition-colors cursor-pointer"
                              title="Sửa nhanh thông tin báo phí"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}

                          {/* Delete quote */}
                          {(currentUser.role === 'admin' || currentUser.role === 'accountant') && (
                            <button
                              onClick={() => handleDeleteQuote(q.id)}
                              className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 rounded-md transition-colors cursor-pointer"
                              title="Xóa vĩnh viễn"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}

                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Modal Edit Dialog */}
      <Modal
        isOpen={editingQuote !== null}
        onClose={() => setEditingQuote(null)}
        title={`Sửa thông tin báo phí ${editingQuote?.id}`}
        footerButtons={
          <>
            <Button variant="secondary" onClick={() => setEditingQuote(null)}>
              Hủy bỏ
            </Button>
            <Button variant="primary" onClick={handleSaveEdit}>
              Cập nhật lại
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Họ và tên Học sinh *"
            value={editStudentName}
            onChange={(e) => setEditStudentName(e.target.value)}
          />

          <Input
            label="Ngày sinh"
            type="date"
            value={editStudentDob}
            onChange={(e) => setEditStudentDob(e.target.value)}
          />

          <Select
            label="Hình thức đóng học phí *"
            value={editPaymentTerm}
            onChange={(e) => setEditPaymentTerm(e.target.value as PaymentTerm)}
          >
            <option value="month">Đóng theo Tháng (1 tháng)</option>
            <option value="quarter">Đóng theo Quý (3 tháng)</option>
            <option value="semester">Đóng theo Học kỳ (5 tháng)</option>
            <option value="year">Đóng Cả năm (10 tháng)</option>
          </Select>

          <div className="p-3 bg-rose-50/50 border border-rose-100 rounded-lg text-xs text-rose-700 flex gap-2">
            <Coins className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Lưu ý về quy tắc tính tự động:</span> Thay đổi hình thức đóng phí sẽ tự động cập nhật lại thời gian, ngày hoạt động ăn uống và tỷ lệ ưu đãi giảm phí của gói đó theo biểu phí chuẩn ban đầu.
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-500">Ghi chú bổ sung</label>
            <textarea
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              rows={3}
              className="w-full text-xs p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy transition-colors"
            />
          </div>
        </div>
      </Modal>

    </div>
  );
}

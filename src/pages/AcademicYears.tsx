import React, { useState, useMemo } from 'react';
import { Database } from '../store/db';
import { AcademicYear, Semester, Holiday } from '../types';
import { useApp } from '../contexts/AppContext';
import { Card, Input, Button, Badge, Modal } from '../components/UI';
import { Plus, Edit2, Trash2, Calendar, Clock, Sparkles } from 'lucide-react';

export default function AcademicYears() {
  const { currentUser, addToast, dbTrigger, triggerDbRefresh } = useApp();
  
  const initialYears = useMemo(() => Database.getAcademicYears(), [dbTrigger]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingYear, setEditingYear] = useState<AcademicYear | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalStudyDays, setTotalStudyDays] = useState(180);
  const [totalBoardingDays, setTotalBoardingDays] = useState(175);
  const [status, setStatus] = useState<'active' | 'inactive'>('inactive');

  // Semester and Holiday states (simplified arrays inside modal)
  const [hk1Months, setHk1Months] = useState(5);
  const [hk2Months, setHk2Months] = useState(4);
  const [holidayInputText, setHolidayInputText] = useState('Tết Nguyên Đán, Quốc khánh 2/9, Tết Dương Lịch');

  const handleOpenAdd = () => {
    setEditingYear(null);
    setName('');
    setStartDate('2026-08-15');
    setEndDate('2027-05-31');
    setTotalStudyDays(180);
    setTotalBoardingDays(175);
    setStatus('inactive');
    setHk1Months(5);
    setHk2Months(4);
    setHolidayInputText('Tết Nguyên Đán, Quốc khánh 2/9, Tết Dương Lịch');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (yr: AcademicYear) => {
    setEditingYear(yr);
    setName(yr.name);
    setStartDate(yr.startDate);
    setEndDate(yr.endDate);
    setTotalStudyDays(yr.totalStudyDays);
    setTotalBoardingDays(yr.totalBoardingDays);
    setStatus(yr.status);
    
    // Fill semester lengths
    setHk1Months(yr.semesters[0]?.months || 5);
    setHk2Months(yr.semesters[1]?.months || 4);

    // Format holidays to string for simple text area
    const holidayStr = yr.holidays.map(h => `${h.name} (${h.date})`).join(', ');
    setHolidayInputText(holidayStr || 'Tết Nguyên Đán, Quốc khánh, Tết Dương Lịch');
    
    setIsModalOpen(true);
  };

  const handleSaveYear = () => {
    if (!name.trim() || !startDate || !endDate) {
      addToast('error', 'Lỗi nhập liệu', 'Vui lòng điền đầy đủ các thông tin năm học bắt buộc.');
      return;
    }

    // Process holidays from text input
    // Parses string like "Tết (2027-02-05), Lễ (2027-04-30)"
    const parsedHolidays: Holiday[] = [];
    const splitHols = holidayInputText.split(',');
    splitHols.forEach(h => {
      const trimmed = h.trim();
      if (!trimmed) return;
      
      const dateMatch = trimmed.match(/\(([^)]+)\)/);
      if (dateMatch && dateMatch[1]) {
        parsedHolidays.push({
          name: trimmed.replace(/\([^)]+\)/g, '').trim(),
          date: dateMatch[1].trim()
        });
      } else {
        // assign mock holiday offset
        parsedHolidays.push({
          name: trimmed,
          date: '2027-01-01'
        });
      }
    });

    const semesters: Semester[] = [
      { id: `sem-${Date.now()}-hk1`, name: 'Học kỳ 1', months: Number(hk1Months) },
      { id: `sem-${Date.now()}-hk2`, name: 'Học kỳ 2', months: Number(hk2Months) }
    ];

    const payload: AcademicYear = {
      id: editingYear?.id || `year-${Date.now()}`,
      name: name.trim(),
      startDate,
      endDate,
      totalStudyDays: Number(totalStudyDays),
      totalBoardingDays: Number(totalBoardingDays),
      holidays: parsedHolidays,
      semesters,
      status
    };

    let updated = [...initialYears];

    // If marked active, set all other years to inactive to prevent multiple active year overlaps!
    if (status === 'active') {
      updated = updated.map(y => ({ ...y, status: 'inactive' }));
    }

    if (editingYear) {
      updated = updated.map(y => y.id === editingYear.id ? payload : y);
      addToast('success', 'Cập nhật thành công', `Đã lưu cấu hình cho Năm học: ${name}`);
    } else {
      updated = [payload, ...updated];
      addToast('success', 'Tạo năm học thành công', `Đã tạo Năm học mới: ${name}`);
    }

    Database.setAcademicYears(updated, currentUser, {
      action: editingYear ? 'SỬA NĂM HỌC' : 'THÊM NĂM HỌC',
      oldValue: editingYear ? JSON.stringify(editingYear) : undefined,
      newValue: JSON.stringify(payload)
    });

    triggerDbRefresh();
    setIsModalOpen(false);
  };

  const handleDeleteYear = (yr: AcademicYear) => {
    if (yr.status === 'active') {
      addToast('error', 'Không thể xóa', 'Không thể xóa năm học đang hoạt động chính thức. Hãy kích hoạt năm học khác trước.');
      return;
    }

    // Check if there are quotes referencing this year
    const quotes = Database.getQuotes();
    const hasQuotes = quotes.some(q => q.yearId === yr.id);
    if (hasQuotes) {
      addToast('error', 'Từ chối xóa', `Không thể xóa năm học "${yr.name}" vì có phiếu báo phí lịch sử đang thuộc năm học này.`);
      return;
    }

    if (window.confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn cấu hình năm học "${yr.name}"?`)) {
      const updated = initialYears.filter(y => y.id !== yr.id);
      Database.setAcademicYears(updated, currentUser, {
        action: 'XÓA NĂM HỌC',
        oldValue: JSON.stringify(yr)
      });
      triggerDbRefresh();
      addToast('success', 'Đã xóa', `Đã loại bỏ năm học "${yr.name}".`);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 dark:border-neutral-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 uppercase flex items-center gap-2">
            <Calendar className="w-5 h-5 text-brand-orange" />
            <span>Thiết lập Năm học & Lịch hoạt động</span>
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Cài đặt độ dài học kỳ, tổng số ngày bán trú/ăn uống, các đợt nghỉ Tết để tự động tính toán biểu phí chính xác.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={handleOpenAdd} icon={<Plus className="w-4 h-4" />}>
          Thêm năm học mới
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {initialYears.map((yr) => (
          <Card key={yr.id} className={`border ${yr.status === 'active' ? 'border-brand-navy shadow-md' : 'border-neutral-200'}`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-brand-navy/10 text-brand-navy rounded-lg">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100">Năm học {yr.name}</h3>
                  <p className="text-xs text-neutral-400">Thời gian: {yr.startDate} đến {yr.endDate}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Badge variant={yr.status === 'active' ? 'success' : 'neutral'}>
                  {yr.status === 'active' ? 'Đang hoạt động chính' : 'Lưu trữ / Nháp'}
                </Badge>
                
                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(yr)}
                    className="p-1.5 hover:bg-sky-50 dark:hover:bg-sky-950/40 text-sky-600 rounded-md transition-colors cursor-pointer"
                    title="Cấu hình"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteYear(yr)}
                    className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 rounded-md transition-colors cursor-pointer"
                    title="Xóa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-neutral-50 dark:bg-neutral-950 rounded-lg border border-neutral-100 dark:border-neutral-900">
                <span className="text-neutral-400 block mb-1 font-semibold uppercase text-[10px]">Thời gian học</span>
                <span className="text-sm font-bold text-neutral-800 dark:text-neutral-100">{yr.totalStudyDays} ngày thực học</span>
              </div>

              <div className="p-3 bg-neutral-50 dark:bg-neutral-950 rounded-lg border border-neutral-100 dark:border-neutral-900">
                <span className="text-neutral-400 block mb-1 font-semibold uppercase text-[10px]">Hoạt động bán trú</span>
                <span className="text-sm font-bold text-neutral-800 dark:text-neutral-100">{yr.totalBoardingDays} ngày ăn cơm</span>
              </div>

              <div className="p-3 bg-neutral-50 dark:bg-neutral-950 rounded-lg border border-neutral-100 dark:border-neutral-900">
                <span className="text-neutral-400 block mb-1 font-semibold uppercase text-[10px]">Phân chia học kỳ</span>
                <span className="text-xs font-bold text-neutral-800 dark:text-neutral-100">
                  {yr.semesters[0]?.name}: {yr.semesters[0]?.months}T | {yr.semesters[1]?.name}: {yr.semesters[1]?.months}T
                </span>
              </div>

              <div className="p-3 bg-neutral-50 dark:bg-neutral-950 rounded-lg border border-neutral-100 dark:border-neutral-900">
                <span className="text-neutral-400 block mb-1 font-semibold uppercase text-[10px]">Số đợt nghỉ lễ</span>
                <span className="text-sm font-bold text-brand-navy dark:text-brand-orange">{yr.holidays.length} đợt nghỉ lễ chính</span>
              </div>
            </div>

            {/* List Holidays */}
            {yr.holidays.length > 0 && (
              <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 text-xs">
                <span className="font-semibold text-neutral-500 mr-2 uppercase text-[9px]">Lịch nghỉ lễ tết đã cấu hình:</span>
                <span className="text-neutral-700 dark:text-neutral-300">
                  {yr.holidays.map(h => `${h.name} (${h.date})`).join(', ')}
                </span>
              </div>
            )}
          </Card>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingYear ? 'Sửa thông tin năm học' : 'Tạo cấu hình năm học mới'}
        footerButtons={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button variant="primary" onClick={handleSaveYear}>Lưu cấu hình</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Tên Năm học (Ví dụ: 2026-2027) *"
            placeholder="Nhập tên năm học..."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Ngày khai giảng / Bắt đầu học *"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />

            <Input
              label="Ngày bế giảng / Kết thúc năm học *"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Số ngày thực học hành chính *"
              type="number"
              value={totalStudyDays}
              onChange={(e) => setTotalStudyDays(Number(e.target.value))}
            />

            <Input
              label="Số ngày tổ chức ăn bán trú *"
              type="number"
              value={totalBoardingDays}
              onChange={(e) => setTotalBoardingDays(Number(e.target.value))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Độ dài Học kỳ 1 (số tháng) *"
              type="number"
              value={hk1Months}
              onChange={(e) => setHk1Months(Number(e.target.value))}
            />

            <Input
              label="Độ dài Học kỳ 2 (số tháng) *"
              type="number"
              value={hk2Months}
              onChange={(e) => setHk2Months(Number(e.target.value))}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-500">Các đợt nghỉ lễ, tết (định dạng: Tên lễ (YYYY-MM-DD), tách bằng dấu phẩy)</label>
            <textarea
              value={holidayInputText}
              onChange={(e) => setHolidayInputText(e.target.value)}
              placeholder="Tết Nguyên Đán (2027-02-05), Giải phóng miền Nam (2027-04-30)"
              rows={3}
              className="w-full text-xs p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-500">Trạng thái vận hành năm học</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="text-xs font-semibold bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-2.5 text-neutral-800 dark:text-neutral-200 outline-none w-full focus:ring-1 focus:ring-brand-navy cursor-pointer"
            >
              <option value="inactive">Lưu nháp / Chưa kích hoạt</option>
              <option value="active">Kích hoạt làm năm học hoạt động chính</option>
            </select>
          </div>
        </div>
      </Modal>

    </div>
  );
}

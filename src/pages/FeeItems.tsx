import React, { useState, useMemo, useRef } from 'react';
import { Database } from '../store/db';
import { FeeItem, FeeCategory, EducationLevel, ClassItem, AcademicYear } from '../types';
import { useApp } from '../contexts/AppContext';
import { Card, Input, Button, Badge, Modal, Select } from '../components/UI';
import { Plus, Edit2, Trash2, Search, Upload, Info, Check, Eye, EyeOff } from 'lucide-react';

export default function FeeItems() {
  const { currentUser, addToast, dbTrigger, triggerDbRefresh } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Fetch DB
  const initialItems = useMemo(() => Database.getFeeItems(), [dbTrigger]);
  const categories = useMemo(() => Database.getFeeCategories(), [dbTrigger]);
  const levels = useMemo(() => Database.getEducationLevels(), [dbTrigger]);
  const classes = useMemo(() => Database.getClasses(), [dbTrigger]);
  const years = useMemo(() => Database.getAcademicYears(), [dbTrigger]);

  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCatId, setFilterCatId] = useState('all');
  const [filterYearId, setFilterYearId] = useState('all');

  // Modal edit / add states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FeeItem | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formPrice, setFormPrice] = useState<number>(0);
  const [formUnit, setFormUnit] = useState('Tháng');
  const [formType, setFormType] = useState<'mandatory' | 'optional'>('mandatory');
  const [formLevelId, setFormLevelId] = useState('all');
  const [formClassId, setFormClassId] = useState('all');
  const [formYearId, setFormYearId] = useState('');
  const [formStartDate, setFormStartDate] = useState('2026-08-15');
  const [formEndDate, setFormEndDate] = useState('2027-05-31');
  const [formVisible, setFormVisible] = useState(true);

  // Filter list of classes based on level selected in the form
  const formFilteredClasses = useMemo(() => {
    if (formLevelId === 'all') return [];
    return classes.filter(c => c.levelId === formLevelId);
  }, [classes, formLevelId]);

  // Sync default fields
  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormName('');
    setFormCode(`PHI_${Date.now().toString().substring(7)}`);
    setFormCategoryId(categories[0]?.id || '');
    setFormPrice(0);
    setFormUnit('Tháng');
    setFormType('mandatory');
    setFormLevelId('all');
    setFormClassId('all');
    setFormYearId(years.find(y => y.status === 'active')?.id || years[0]?.id || '');
    setFormStartDate('2026-08-15');
    setFormEndDate('2027-05-31');
    setFormVisible(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: FeeItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormCode(item.code);
    setFormCategoryId(item.categoryId);
    setFormPrice(item.price);
    setFormUnit(item.unit);
    setFormType(item.type);
    setFormLevelId(item.levelId);
    setFormClassId(item.classId);
    setFormYearId(item.yearId);
    setFormStartDate(item.startDate);
    setFormEndDate(item.endDate);
    setFormVisible(item.visible);
    setIsModalOpen(true);
  };

  // 2. Filter logic
  const filteredItems = useMemo(() => {
    return initialItems.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = filterCatId === 'all' || item.categoryId === filterCatId;
      const matchYear = filterYearId === 'all' || item.yearId === filterYearId;
      return matchSearch && matchCat && matchYear;
    });
  }, [initialItems, searchQuery, filterCatId, filterYearId]);

  // 3. Save / Update
  const handleSaveItem = () => {
    if (!formName.trim() || !formCode.trim() || !formYearId) {
      addToast('error', 'Lỗi nhập liệu', 'Vui lòng nhập đầy đủ các thông tin bắt buộc.');
      return;
    }

    const itemPayload: FeeItem = {
      id: editingItem?.id || `fee-${Date.now()}`,
      name: formName.trim(),
      code: formCode.trim().toUpperCase(),
      categoryId: formCategoryId,
      price: Number(formPrice),
      unit: formUnit,
      type: formType,
      levelId: formLevelId,
      classId: formLevelId === 'all' ? 'all' : formClassId,
      yearId: formYearId,
      startDate: formStartDate,
      endDate: formEndDate,
      visible: formVisible
    };

    let updatedList: FeeItem[] = [];
    let actionType = '';

    if (editingItem) {
      updatedList = initialItems.map(i => i.id === editingItem.id ? itemPayload : i);
      actionType = 'CẬP NHẬT BIỂU PHÍ';
      addToast('success', 'Cập nhật thành công', `Đã lưu các thay đổi cho khoản phí: ${formName}`);
    } else {
      updatedList = [itemPayload, ...initialItems];
      actionType = 'THÊM KHOẢN PHÍ MỚI';
      addToast('success', 'Tạo mới thành công', `Đã thêm khoản phí ${formName} vào hệ thống.`);
    }

    // Save to DB and trigger log
    Database.setFeeItems(updatedList, currentUser, {
      action: actionType,
      oldValue: editingItem ? JSON.stringify(editingItem) : undefined,
      newValue: JSON.stringify(itemPayload)
    });

    triggerDbRefresh();
    setIsModalOpen(false);
  };

  // 4. Delete
  const handleDeleteItem = (item: FeeItem) => {
    if (window.confirm(`Bạn có chắc muốn xóa vĩnh viễn khoản phí "${item.name}"? Thao tác này sẽ làm gián đoạn lịch sử tính toán nếu có.`)) {
      const updated = initialItems.filter(i => i.id !== item.id);
      Database.setFeeItems(updated, currentUser, {
        action: 'XÓA KHOẢN PHÍ',
        oldValue: JSON.stringify(item)
      });
      triggerDbRefresh();
      addToast('success', 'Đã xóa khoản phí', `Khoản phí ${item.name} đã được dọn sạch.`);
    }
  };

  // 5. BULK CSV IMPORT FOR BATCH UPDATES
  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        const lines = text.split('\n');
        const importedList: FeeItem[] = [];
        
        // Skip header line
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          // Basic split parsing (handles quote grouping simply)
          const cols = line.split(',').map(col => col.replace(/^"|"$/g, '').trim());
          if (cols.length < 8) continue;

          const [name, code, catCode, price, unit, type, lvlCode, yearName] = cols;

          // Resolve IDs dynamically from Codes to prevent hardcoding errors!
          const categoryId = categories.find(c => c.code === catCode)?.id || categories[0]?.id || 'cat-hocphi';
          const levelId = lvlCode === 'all' ? 'all' : (levels.find(l => l.code === lvlCode)?.id || 'all');
          const yearId = years.find(y => y.name === yearName)?.id || years[0]?.id || '';

          if (!yearId) continue;

          importedList.push({
            id: `fee-import-${Date.now()}-${i}`,
            name,
            code: code.toUpperCase(),
            categoryId,
            price: Number(price) || 0,
            unit: unit || 'Tháng',
            type: type === 'optional' ? 'optional' : 'mandatory',
            levelId,
            classId: 'all',
            yearId,
            startDate: '2026-08-15',
            endDate: '2027-05-31',
            visible: true
          });
        }

        if (importedList.length === 0) {
          addToast('error', 'Lỗi nhập tệp', 'Không tìm thấy dữ liệu hợp lệ trong tệp tin CSV của bạn.');
          return;
        }

        const merged = [...importedList, ...initialItems];
        Database.setFeeItems(merged, currentUser, { action: `BATCH IMPORT: ${importedList.length} ITEMS` });
        Database.addAuditLog(currentUser, 'IMPORT BIỂU PHÍ', `Nhập biểu phí hàng loạt thành công: thêm mới ${importedList.length} dòng.`);
        triggerDbRefresh();
        addToast('success', 'Nhập dữ liệu thành công', `Đã thêm hàng loạt ${importedList.length} biểu phí mới vào hệ thống.`);
      } catch {
        addToast('error', 'Lỗi nhập tệp', 'Có lỗi cú pháp khi giải mã tệp CSV. Vui lòng kiểm tra định dạng.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto">
      
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 dark:border-neutral-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 uppercase">
            QUẢN LÝ BIỂU PHÍ HỌC ĐƯỜNG (ADMIN)
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Định nghĩa đơn giá, cấu hình biểu phí bắt buộc/tùy chọn áp dụng riêng biệt cho từng khối, lớp và năm học.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {/* Invisible file input for CSV Import */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleCSVImport}
            accept=".csv"
            className="hidden"
          />
          <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()} icon={<Upload className="w-4 h-4" />}>
            Nhập File CSV
          </Button>

          <Button variant="primary" size="sm" onClick={handleOpenAdd} icon={<Plus className="w-4 h-4" />}>
            Thêm khoản phí mới
          </Button>
        </div>
      </div>

      {/* Filtering Row */}
      <Card className="p-4 bg-neutral-50/50">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <div className="sm:col-span-2">
            <Input
              label="Tìm kiếm biểu phí"
              placeholder="Nhập tên khoản phí, mã phí (HP_...)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>

          <Select
            label="Lọc theo Danh mục"
            value={filterCatId}
            onChange={(e) => setFilterCatId(e.target.value)}
          >
            <option value="all">Tất cả danh mục</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>

          <Select
            label="Lọc theo Năm học"
            value={filterYearId}
            onChange={(e) => setFilterYearId(e.target.value)}
          >
            <option value="all">Tất cả năm học</option>
            {years.map(y => (
              <option key={y.id} value={y.id}>Năm {y.name}</option>
            ))}
          </Select>
        </div>
      </Card>

      {/* Fee Items Table Grid */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-950/50 text-neutral-500 font-bold uppercase border-b border-neutral-100 dark:border-neutral-800">
                <th className="p-4">Mã</th>
                <th className="p-4">Tên khoản thu</th>
                <th className="p-4">Danh mục</th>
                <th className="p-4 text-right">Đơn giá</th>
                <th className="p-4">Đơn vị</th>
                <th className="p-4">Tính chất</th>
                <th className="p-4">Áp dụng</th>
                <th className="p-4 text-center">Hiển thị</th>
                <th className="p-4 text-center w-28">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-neutral-400 italic">
                    Chưa có khoản phí nào phù hợp với bộ lọc tìm kiếm.
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => {
                  const catName = categories.find(c => c.id === item.categoryId)?.name || '';
                  const lvlName = item.levelId === 'all' ? 'Tất cả khối' : (levels.find(l => l.id === item.levelId)?.name || '');
                  const clsName = item.classId === 'all' ? 'Tất cả lớp' : (classes.find(c => c.id === item.classId)?.name || '');
                  const yrName = years.find(y => y.id === item.yearId)?.name || '';

                  return (
                    <tr key={item.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20">
                      <td className="p-4 font-mono font-bold text-neutral-800 dark:text-neutral-200">{item.code}</td>
                      <td className="p-4">
                        <div className="font-bold text-neutral-800 dark:text-neutral-200">{item.name}</div>
                        <div className="text-[10px] text-neutral-400">Năm học: {yrName}</div>
                      </td>
                      <td className="p-4 text-neutral-600 font-medium">{catName}</td>
                      <td className="p-4 text-right font-bold text-brand-orange font-mono">{formatCurrency(item.price)}</td>
                      <td className="p-4 text-neutral-500">{item.unit}</td>
                      <td className="p-4">
                        <Badge variant={item.type === 'mandatory' ? 'error' : 'info'}>
                          {item.type === 'mandatory' ? 'Bắt buộc' : 'Tùy chọn'}
                        </Badge>
                      </td>
                      <td className="p-4 text-neutral-500">
                        <div>{lvlName}</div>
                        {item.levelId !== 'all' && <div className="text-[10px] text-neutral-400">Lớp: {clsName}</div>}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center">
                          {item.visible ? (
                            <Eye className="w-4 h-4 text-brand-orange" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-neutral-400" />
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center items-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 hover:bg-sky-50 dark:hover:bg-sky-950/40 text-sky-600 rounded-md transition-colors cursor-pointer"
                            title="Sửa"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item)}
                            className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 rounded-md transition-colors cursor-pointer"
                            title="Xóa vĩnh viễn"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* CSV formatting tips */}
      <div className="p-4 border border-sky-100 dark:border-sky-950/40 bg-sky-50/50 dark:bg-sky-950/10 rounded-xl flex gap-3 text-xs text-neutral-600 dark:text-neutral-400">
        <Info className="w-5 h-5 text-sky-500 shrink-0" />
        <div>
          <span className="font-bold text-sky-700 dark:text-sky-400 uppercase">Lưu ý định dạng tệp CSV import hàng loạt:</span>
          <p className="mt-1 leading-relaxed">
            Hàng tiêu đề bắt buộc có dạng:<br />
            <code className="bg-white dark:bg-neutral-950 px-1.5 py-0.5 rounded border border-neutral-200 dark:border-neutral-800 font-mono text-[10px]">
              Tên khoản thu, Mã khoản thu, Mã danh mục, Đơn giá, Đơn vị, Tính chất, Mã cấp học, Năm học
            </code><br />
            Ví dụ mẫu:<br />
            <code className="bg-white dark:bg-neutral-950 px-1.5 py-0.5 rounded border border-neutral-200 dark:border-neutral-800 font-mono text-[10px]">
              Học phí Mầm non Chồi, HP_CHOI_2627, HP, 6500000, Tháng, mandatory, MN, 2026-2027
            </code>
          </p>
        </div>
      </div>

      {/* Modal Dialog for Add / Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Sửa thông tin khoản phí' : 'Thêm khoản phí mới'}
        footerButtons={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Hủy bỏ
            </Button>
            <Button variant="primary" onClick={handleSaveItem}>
              {editingItem ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Tên khoản phí (Ví dụ: Tiền học bán trú lớp 1) *"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Mã biểu phí (Vết định danh duy nhất) *"
              value={formCode}
              onChange={(e) => setFormCode(e.target.value)}
              required
            />

            <Select
              label="Danh mục thu *"
              value={formCategoryId}
              onChange={(e) => setFormCategoryId(e.target.value)}
            >
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Đơn giá (VNĐ) *"
              type="number"
              value={formPrice}
              onChange={(e) => setFormPrice(Number(e.target.value))}
              required
            />

            <Select
              label="Đơn vị tính *"
              value={formUnit}
              onChange={(e) => setFormUnit(e.target.value)}
            >
              <option value="Tháng">Tháng</option>
              <option value="Ngày">Ngày thực tế</option>
              <option value="Lần">Lần duy nhất</option>
              <option value="Năm">Năm học</option>
              <option value="Học kỳ">Học kỳ</option>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Cấp học áp dụng *"
              value={formLevelId}
              onChange={(e) => setFormLevelId(e.target.value)}
            >
              <option value="all">Tất cả cấp học</option>
              {levels.map(l => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </Select>

            <Select
              label="Lớp học áp dụng"
              value={formClassId}
              onChange={(e) => setFormClassId(e.target.value)}
              disabled={formLevelId === 'all'}
            >
              <option value="all">Tất cả lớp trong khối</option>
              {formFilteredClasses.map(c => (
                <option key={c.id} value={c.id}>Lớp {c.name}</option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Năm học áp dụng *"
              value={formYearId}
              onChange={(e) => setFormYearId(e.target.value)}
            >
              {years.map(y => (
                <option key={y.id} value={y.id}>Năm {y.name}</option>
              ))}
            </Select>

            <Select
              label="Tính chất bắt buộc *"
              value={formType}
              onChange={(e) => setFormType(e.target.value as any)}
            >
              <option value="mandatory">Bắt buộc đóng (Được điền sẵn)</option>
              <option value="optional">Dịch vụ tự chọn (Phụ huynh tự đăng ký)</option>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Ngày hiệu lực"
              type="date"
              value={formStartDate}
              onChange={(e) => setFormStartDate(e.target.value)}
            />

            <Input
              label="Ngày hết hạn"
              type="date"
              value={formEndDate}
              onChange={(e) => setFormEndDate(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 mt-2">
            <input
              type="checkbox"
              id="formVisible"
              checked={formVisible}
              onChange={(e) => setFormVisible(e.target.checked)}
              className="w-4 h-4 text-brand-orange border-neutral-300 rounded focus:ring-brand-orange cursor-pointer"
            />
            <label htmlFor="formVisible" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer">
              Cho phép hiển thị & chọn lựa khi tuyển sinh tính học phí
            </label>
          </div>
        </div>
      </Modal>

    </div>
  );
}

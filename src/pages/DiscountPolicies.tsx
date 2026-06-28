import React, { useState, useMemo } from 'react';
import { Database } from '../store/db';
import { DiscountPolicy } from '../types';
import { useApp } from '../contexts/AppContext';
import { Card, Input, Button, Badge, Modal, Select } from '../components/UI';
import { Plus, Edit2, Trash2, Tag, Gift, Percent } from 'lucide-react';

export default function DiscountPolicies() {
  const { currentUser, addToast, dbTrigger, triggerDbRefresh } = useApp();
  
  const initialPolicies = useMemo(() => Database.getDiscountPolicies(), [dbTrigger]);
  const levels = useMemo(() => Database.getEducationLevels(), [dbTrigger]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<DiscountPolicy | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [discountType, setDiscountType] = useState<'percent' | 'amount'>('percent');
  const [value, setValue] = useState<number>(0);
  const [conditionType, setConditionType] = useState<'payment_term' | 'sibling' | 'early_bird' | 'custom'>('payment_term');
  const [conditionValue, setConditionValue] = useState('year');
  const [applicableLevelId, setApplicableLevelId] = useState('all');
  const [isActive, setIsActive] = useState(true);
  const [startDate, setStartDate] = useState('2026-08-15');
  const [endDate, setEndDate] = useState('2027-05-31');

  const handleOpenAdd = () => {
    setEditingPolicy(null);
    setName('');
    setDiscountType('percent');
    setValue(0);
    setConditionType('payment_term');
    setConditionValue('year');
    setApplicableLevelId('all');
    setIsActive(true);
    setStartDate('2026-08-15');
    setEndDate('2027-05-31');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: DiscountPolicy) => {
    setEditingPolicy(p);
    setName(p.name);
    setDiscountType(p.discountType);
    setValue(p.value);
    setConditionType(p.conditionType);
    setConditionValue(p.conditionValue);
    setApplicableLevelId(p.applicableLevelId);
    setIsActive(p.isActive);
    setStartDate(p.startDate);
    setEndDate(p.endDate);
    setIsModalOpen(true);
  };

  const handleSavePolicy = () => {
    if (!name.trim()) {
      addToast('error', 'Lỗi nhập liệu', 'Vui lòng điền tên chương trình khuyến mại/giảm giá.');
      return;
    }

    const payload: DiscountPolicy = {
      id: editingPolicy?.id || `disc-${Date.now()}`,
      name: name.trim(),
      discountType,
      value: Number(value),
      conditionType,
      conditionValue,
      applicableLevelId,
      isActive,
      startDate,
      endDate
    };

    let updated = [...initialPolicies];
    if (editingPolicy) {
      updated = updated.map(p => p.id === editingPolicy.id ? payload : p);
      addToast('success', 'Cập nhật thành công', `Đã lưu chính sách giảm giá: ${name}`);
    } else {
      updated = [payload, ...updated];
      addToast('success', 'Tạo mới thành công', `Đã tạo chương trình ưu đãi mới: ${name}`);
    }

    Database.setDiscountPolicies(updated, currentUser, {
      action: editingPolicy ? 'SỬA CHÍNH SÁCH GIẢM GIÁ' : 'THÊM CHÍNH SÁCH GIẢM GIÁ',
      oldValue: editingPolicy ? JSON.stringify(editingPolicy) : undefined,
      newValue: JSON.stringify(payload)
    });

    triggerDbRefresh();
    setIsModalOpen(false);
  };

  const handleDeletePolicy = (p: DiscountPolicy) => {
    if (window.confirm(`Bạn có chắc muốn xóa vĩnh viễn chính sách giảm giá "${p.name}"?`)) {
      const updated = initialPolicies.filter(x => x.id !== p.id);
      Database.setDiscountPolicies(updated, currentUser, {
        action: 'XÓA CHÍNH SÁCH GIẢM GIÁ',
        oldValue: JSON.stringify(p)
      });
      triggerDbRefresh();
      addToast('success', 'Xóa chính sách', `Chính sách "${p.name}" đã được xóa.`);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const getConditionLabel = (type: string, val: string) => {
    if (type === 'payment_term') {
      return `Đóng học phí cả năm (${val === 'year' ? 'Năm' : 'Học kỳ'})`;
    }
    if (type === 'sibling') {
      return `Học sinh có anh chị em đồng học (Con thứ ${val === 'second_child' ? '2' : '3'})`;
    }
    if (type === 'early_bird') {
      return `Nhập học sớm giữ chỗ (${val === 'early_registration' ? 'Trước ngày hạn' : val})`;
    }
    return `Chiến dịch phụ trợ (${val})`;
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 dark:border-neutral-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 uppercase flex items-center gap-2">
            <Tag className="w-5 h-5 text-brand-orange" />
            <span>Chính sách Giảm giá & Ưu đãi học bổng (ADMIN)</span>
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Thiết lập công thức chiết khấu tự động cho phụ huynh đóng theo năm học, đóng theo kỳ, giảm trừ diện con thứ hai, hoặc đăng ký sớm.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={handleOpenAdd} icon={<Plus className="w-4 h-4" />}>
          Tạo ưu đãi mới
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {initialPolicies.map((p) => (
          <Card key={p.id} className={`flex flex-col justify-between border ${p.isActive ? 'border-brand-navy/20' : 'border-neutral-200 opacity-60'}`}>
            <div>
              <div className="flex justify-between items-start gap-4 mb-3">
                <div className="p-2 bg-brand-orange/10 text-brand-orange rounded-lg">
                  {p.discountType === 'percent' ? <Percent className="w-4 h-4" /> : <Gift className="w-4 h-4" />}
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant={p.isActive ? 'success' : 'neutral'}>
                    {p.isActive ? 'Đang kích hoạt' : 'Tạm tắt'}
                  </Badge>

                  <div className="flex gap-1">
                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="p-1 hover:bg-sky-50 dark:hover:bg-sky-950/40 text-sky-600 rounded transition-colors cursor-pointer"
                      title="Sửa"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeletePolicy(p)}
                      className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 rounded transition-colors cursor-pointer"
                      title="Xóa"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <h4 className="font-bold text-neutral-900 dark:text-neutral-100 text-sm leading-snug">{p.name}</h4>
              <p className="text-xs text-neutral-400 mt-1">Hạn dùng: {p.startDate} đến {p.endDate}</p>

              <div className="mt-4 p-3 bg-neutral-50 dark:bg-neutral-950 rounded-lg border border-neutral-100 dark:border-neutral-900 text-xs flex flex-col gap-1">
                <div>
                  <span className="text-neutral-400 font-semibold uppercase text-[9px] block">Mức giảm trừ</span>
                  <span className="font-bold text-brand-orange text-sm">
                    {p.discountType === 'percent' ? `${p.value}% học phí chính` : `Trừ tiền mặt ${formatCurrency(p.value)}`}
                  </span>
                </div>
                <div className="mt-2 pt-2 border-t border-neutral-150 dark:border-neutral-900">
                  <span className="text-neutral-400 font-semibold uppercase text-[9px] block">Điều kiện áp dụng</span>
                  <span className="text-neutral-700 dark:text-neutral-300 font-medium">
                    {getConditionLabel(p.conditionType, p.conditionValue)}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPolicy ? 'Sửa chính sách giảm giá' : 'Tạo chương trình ưu đãi mới'}
        footerButtons={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button variant="primary" onClick={handleSavePolicy}>Lưu chính sách</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Tên chương trình ưu đãi *"
            placeholder="Ví dụ: Ưu đãi đóng phí Cả năm học (giảm 6%)..."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Kiểu chiết khấu *"
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as any)}
            >
              <option value="percent">Giảm theo tỷ lệ phần trăm (%)</option>
              <option value="amount">Trừ số tiền mặt trực tiếp (đ)</option>
            </Select>

            <Input
              label="Giá trị ưu đãi (Phần trăm hoặc Tiền mặt) *"
              type="number"
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Nhóm điều kiện kích hoạt *"
              value={conditionType}
              onChange={(e) => {
                setConditionType(e.target.value as any);
                if (e.target.value === 'payment_term') setConditionValue('year');
                else if (e.target.value === 'sibling') setConditionValue('second_child');
                else if (e.target.value === 'early_bird') setConditionValue('early_registration');
                else setConditionValue('custom_campaign');
              }}
            >
              <option value="payment_term">Hình thức đóng (Tháng / Quý / Kỳ / Năm)</option>
              <option value="sibling">Diện đồng học (Con thứ hai trở lên)</option>
              <option value="early_bird">Đăng ký nhập học sớm</option>
              <option value="custom">Chiến dịch phụ trợ khác (Mùa vụ)</option>
            </Select>

            <Select
              label="Giá trị kích hoạt chi tiết *"
              value={conditionValue}
              onChange={(e) => setConditionValue(e.target.value)}
            >
              {conditionType === 'payment_term' && (
                <>
                  <option value="year">Cả năm học (10 tháng)</option>
                  <option value="semester">Đóng theo Học kỳ (5 tháng)</option>
                  <option value="quarter">Đóng theo Quý (3 tháng)</option>
                </>
              )}
              {conditionType === 'sibling' && (
                <>
                  <option value="second_child">Đóng cho Con thứ hai trở lên</option>
                </>
              )}
              {conditionType === 'early_bird' && (
                <>
                  <option value="early_registration">Nhập học sớm giữ chỗ trước hạn</option>
                </>
              )}
              {conditionType === 'custom' && (
                <>
                  <option value="june_promo">Khuyến mãi mùa hè trong tháng 6</option>
                  <option value="marketing_deal">Mã voucher tuyển sinh phụ trội</option>
                </>
              )}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Ngày hiệu lực mở *"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />

            <Input
              label="Ngày hết hạn chiến dịch *"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 mt-2">
            <input
              type="checkbox"
              id="isActivePolicy"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 text-brand-orange border-neutral-300 rounded focus:ring-brand-orange cursor-pointer"
            />
            <label htmlFor="isActivePolicy" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer">
              Bật hoạt động ngay lập tức
            </label>
          </div>
        </div>
      </Modal>

    </div>
  );
}

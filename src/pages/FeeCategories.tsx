import React, { useState, useMemo } from 'react';
import { Database } from '../store/db';
import { FeeCategory } from '../types';
import { useApp } from '../contexts/AppContext';
import { Card, Input, Button, Modal } from '../components/UI';
import { Plus, Edit2, Trash2, Layers, Save } from 'lucide-react';

export default function FeeCategories() {
  const { currentUser, addToast, dbTrigger, triggerDbRefresh } = useApp();
  
  const initialCategories = useMemo(() => Database.getFeeCategories(), [dbTrigger]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<FeeCategory | null>(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');

  const handleOpenAdd = () => {
    setEditingCat(null);
    setName('');
    setCode(`CAT_${Date.now().toString().substring(8)}`);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: FeeCategory) => {
    setEditingCat(cat);
    setName(cat.name);
    setCode(cat.code);
    setIsModalOpen(true);
  };

  const handleSaveCat = () => {
    if (!name.trim() || !code.trim()) {
      addToast('error', 'Lỗi nhập liệu', 'Vui lòng điền đầy đủ thông tin.');
      return;
    }

    const payload: FeeCategory = {
      id: editingCat?.id || `cat-${Date.now()}`,
      name: name.trim(),
      code: code.trim().toUpperCase()
    };

    let updated: FeeCategory[] = [];
    if (editingCat) {
      updated = initialCategories.map(c => c.id === editingCat.id ? payload : c);
      addToast('success', 'Cập nhật thành công', `Đã lưu danh mục: ${name}`);
    } else {
      updated = [payload, ...initialCategories];
      addToast('success', 'Tạo thành công', `Đã thêm danh mục mới: ${name}`);
    }

    Database.setFeeCategories(updated, currentUser, {
      action: editingCat ? 'SỬA DANH MỤC THU' : 'THÊM DANH MỤC THU',
      oldValue: editingCat ? JSON.stringify(editingCat) : undefined,
      newValue: JSON.stringify(payload)
    });

    triggerDbRefresh();
    setIsModalOpen(false);
  };

  const handleDeleteCat = (cat: FeeCategory) => {
    // Check if there are fee items associated with this category
    const items = Database.getFeeItems();
    const hasItems = items.some(item => item.categoryId === cat.id);
    if (hasItems) {
      addToast('error', 'Từ chối xóa', `Không thể xóa danh mục "${cat.name}" vì đang có biểu phí phụ thuộc.`);
      return;
    }

    if (window.confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn danh mục "${cat.name}"?`)) {
      const updated = initialCategories.filter(c => c.id !== cat.id);
      Database.setFeeCategories(updated, currentUser, {
        action: 'XÓA DANH MỤC THU',
        oldValue: JSON.stringify(cat)
      });
      triggerDbRefresh();
      addToast('success', 'Đã xóa', `Đã loại bỏ danh mục "${cat.name}".`);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 dark:border-neutral-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 uppercase flex items-center gap-2">
            <Layers className="w-5 h-5 text-brand-orange" />
            <span>Quản lý Danh mục khoản phí (SaaS)</span>
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Phân loại các khoản thu (Học phí, Phí bán trú, Phí đưa đón) giúp quản lý hóa đơn tuyển sinh dễ dàng.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={handleOpenAdd} icon={<Plus className="w-4 h-4" />}>
          Thêm danh mục
        </Button>
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl overflow-hidden shadow-xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-neutral-50 dark:bg-neutral-950/50 text-neutral-500 font-bold uppercase border-b border-neutral-100 dark:border-neutral-800">
              <th className="p-4 w-12 text-center">STT</th>
              <th className="p-4">Mã danh mục</th>
              <th className="p-4">Tên phân loại danh mục</th>
              <th className="p-4 text-center w-28">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {initialCategories.map((cat, idx) => (
              <tr key={cat.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20">
                <td className="p-4 text-center text-neutral-400 font-mono">{idx + 1}</td>
                <td className="p-4 font-bold font-mono text-neutral-800 dark:text-neutral-200">{cat.code}</td>
                <td className="p-4 text-sm font-semibold text-neutral-900 dark:text-neutral-100">{cat.name}</td>
                <td className="p-4 text-center">
                  <div className="flex justify-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      className="p-1.5 hover:bg-sky-50 dark:hover:bg-sky-950/40 text-sky-600 rounded-md transition-colors cursor-pointer"
                      title="Sửa"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCat(cat)}
                      className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 rounded-md transition-colors cursor-pointer"
                      title="Xóa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCat ? 'Hiệu chỉnh danh mục thu' : 'Tạo danh mục mới'}
        footerButtons={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button variant="primary" onClick={handleSaveCat} icon={<Save className="w-4 h-4" />}>
              Xác nhận & Lưu danh mục
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Tên Danh mục *"
            placeholder="Ví dụ: Học phí chính khóa..."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="Mã danh mục *"
            placeholder="Ví dụ: HP..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </div>
      </Modal>

    </div>
  );
}

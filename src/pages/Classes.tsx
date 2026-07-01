import React, { useState, useMemo } from 'react';
import { Database } from '../store/db';
import { ClassItem, EducationLevel } from '../types';
import { useApp } from '../contexts/AppContext';
import { Card, Input, Button, Modal, Select } from '../components/UI';
import { Plus, Edit2, Trash2, Users, Save } from 'lucide-react';

export default function Classes() {
  const { currentUser, addToast, dbTrigger, triggerDbRefresh } = useApp();
  
  const initialClasses = useMemo(() => Database.getClasses(), [dbTrigger]);
  const levels = useMemo(() => Database.getEducationLevels(), [dbTrigger]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);
  const [name, setName] = useState('');
  const [levelId, setLevelId] = useState('');

  const handleOpenAdd = () => {
    setEditingClass(null);
    setName('');
    setLevelId(levels[0]?.id || '');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cls: ClassItem) => {
    setEditingClass(cls);
    setName(cls.name);
    setLevelId(cls.levelId);
    setIsModalOpen(true);
  };

  const handleSaveClass = () => {
    if (!name.trim() || !levelId) {
      addToast('error', 'Lỗi nhập liệu', 'Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }

    const payload: ClassItem = {
      id: editingClass?.id || `class-${Date.now()}`,
      name: name.trim(),
      levelId
    };

    let updated: ClassItem[] = [];
    if (editingClass) {
      updated = initialClasses.map(c => c.id === editingClass.id ? payload : c);
      addToast('success', 'Cập nhật thành công', `Đã lưu thông tin lớp: ${name}`);
    } else {
      updated = [payload, ...initialClasses];
      addToast('success', 'Tạo thành công', `Đã thêm lớp mới: ${name}`);
    }

    Database.setClasses(updated, currentUser, {
      action: editingClass ? 'SỬA LỚP HỌC' : 'THÊM LỚP HỌC',
      oldValue: editingClass ? JSON.stringify(editingClass) : undefined,
      newValue: JSON.stringify(payload)
    });

    triggerDbRefresh();
    setIsModalOpen(false);
  };

  const handleDeleteClass = (cls: ClassItem) => {
    // Check if there are active quotes referencing this class
    const quotes = Database.getQuotes();
    const hasQuotes = quotes.some(q => q.classId === cls.id);
    if (hasQuotes) {
      addToast('error', 'Từ chối xóa', `Không thể xóa lớp "${cls.name}" vì có phiếu báo học phí đang liên kết.`);
      return;
    }

    if (window.confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn lớp "${cls.name}"?`)) {
      const updated = initialClasses.filter(c => c.id !== cls.id);
      Database.setClasses(updated, currentUser, {
        action: 'XÓA LỚP HỌC',
        oldValue: JSON.stringify(cls)
      });
      triggerDbRefresh();
      addToast('success', 'Đã xóa', `Đã loại bỏ lớp "${cls.name}".`);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 dark:border-neutral-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 uppercase flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-orange" />
            <span>Quản lý Lớp học chi tiết (ADMIN)</span>
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Thiết lập danh sách các lớp học cụ thể (Mầm, Chồi, Lá, Lớp 1, Lớp 2...) thuộc các cấp học tương thích.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={handleOpenAdd} icon={<Plus className="w-4 h-4" />}>
          Thêm lớp học
        </Button>
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl overflow-hidden shadow-xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-neutral-50 dark:bg-neutral-950/50 text-neutral-500 font-bold uppercase border-b border-neutral-100 dark:border-neutral-800">
              <th className="p-4 w-12 text-center">STT</th>
              <th className="p-4">Tên Lớp học</th>
              <th className="p-4">Thuộc Cấp / Khối học</th>
              <th className="p-4 text-center w-28">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {initialClasses.map((cls, idx) => {
              const levelName = levels.find(l => l.id === cls.levelId)?.name || 'Chưa định nghĩa';
              return (
                <tr key={cls.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20">
                  <td className="p-4 text-center text-neutral-400 font-mono">{idx + 1}</td>
                  <td className="p-4 text-sm font-semibold text-neutral-900 dark:text-neutral-100">Lớp {cls.name}</td>
                  <td className="p-4 text-neutral-600 font-medium">{levelName}</td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(cls)}
                        className="p-1.5 hover:bg-sky-50 dark:hover:bg-sky-950/40 text-sky-600 rounded-md transition-colors cursor-pointer"
                        title="Sửa"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClass(cls)}
                        className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 rounded-md transition-colors cursor-pointer"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingClass ? 'Hiệu chỉnh lớp học' : 'Tạo lớp học mới'}
        footerButtons={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Hủy bỏ</Button>
            <Button variant="primary" onClick={handleSaveClass} icon={<Save className="w-4 h-4" />}>
              {editingClass ? 'Xác nhận & Lưu lớp học' : 'Xác nhận & Tạo mới'}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Tên Lớp học (Ví dụ: Nhà trẻ, Lớp 1, Lớp 2) *"
            placeholder="Nhập tên lớp..."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          
          <Select
            label="Cấp học tương ứng *"
            value={levelId}
            onChange={(e) => setLevelId(e.target.value)}
          >
            {levels.map(l => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </Select>
        </div>
      </Modal>

    </div>
  );
}

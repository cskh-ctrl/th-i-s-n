import React, { useState, useMemo } from 'react';
import { Database } from '../store/db';
import { EducationLevel } from '../types';
import { useApp } from '../contexts/AppContext';
import { Card, Input, Button, Modal } from '../components/UI';
import { Plus, Edit2, Trash2, GraduationCap } from 'lucide-react';

export default function EducationLevels() {
  const { currentUser, addToast, dbTrigger, triggerDbRefresh } = useApp();
  
  const initialLevels = useMemo(() => Database.getEducationLevels(), [dbTrigger]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState<EducationLevel | null>(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');

  const handleOpenAdd = () => {
    setEditingLevel(null);
    setName('');
    setCode(`LVL_${Date.now().toString().substring(8)}`);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (lvl: EducationLevel) => {
    setEditingLevel(lvl);
    setName(lvl.name);
    setCode(lvl.code);
    setIsModalOpen(true);
  };

  const handleSaveLevel = () => {
    if (!name.trim() || !code.trim()) {
      addToast('error', 'Lỗi nhập liệu', 'Vui lòng điền đầy đủ thông tin.');
      return;
    }

    const payload: EducationLevel = {
      id: editingLevel?.id || `level-${Date.now()}`,
      name: name.trim(),
      code: code.trim().toUpperCase()
    };

    let updated: EducationLevel[] = [];
    if (editingLevel) {
      updated = initialLevels.map(l => l.id === editingLevel.id ? payload : l);
      addToast('success', 'Cập nhật thành công', `Đã lưu cấp học: ${name}`);
    } else {
      updated = [payload, ...initialLevels];
      addToast('success', 'Tạo thành công', `Đã thêm cấp học mới: ${name}`);
    }

    Database.setEducationLevels(updated, currentUser, {
      action: editingLevel ? 'SỬA CẤP HỌC' : 'THÊM CẤP HỌC',
      oldValue: editingLevel ? JSON.stringify(editingLevel) : undefined,
      newValue: JSON.stringify(payload)
    });

    triggerDbRefresh();
    setIsModalOpen(false);
  };

  const handleDeleteLevel = (lvl: EducationLevel) => {
    // Check if there are classes associated with this level
    const classes = Database.getClasses();
    const hasClasses = classes.some(c => c.levelId === lvl.id);
    if (hasClasses) {
      addToast('error', 'Từ chối xóa', `Không thể xóa cấp học "${lvl.name}" vì đang có lớp học thuộc khối này.`);
      return;
    }

    if (window.confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn cấp học "${lvl.name}"?`)) {
      const updated = initialLevels.filter(l => l.id !== lvl.id);
      Database.setEducationLevels(updated, currentUser, {
        action: 'XÓA CẤP HỌC',
        oldValue: JSON.stringify(lvl)
      });
      triggerDbRefresh();
      addToast('success', 'Đã xóa', `Đã loại bỏ cấp học "${lvl.name}".`);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 dark:border-neutral-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 uppercase flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-brand-orange" />
            <span>Quản lý Khối học phổ thông (ADMIN)</span>
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Định nghĩa các cấp học chính yếu trong toàn hệ thống (Mầm non, Tiểu học, Trung học cơ sở, Trung học phổ thông).
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={handleOpenAdd} icon={<Plus className="w-4 h-4" />}>
          Thêm cấp học
        </Button>
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl overflow-hidden shadow-xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-neutral-50 dark:bg-neutral-950/50 text-neutral-500 font-bold uppercase border-b border-neutral-100 dark:border-neutral-800">
              <th className="p-4 w-12 text-center">STT</th>
              <th className="p-4">Mã Khối / Cấp</th>
              <th className="p-4">Tên Khối / Cấp học</th>
              <th className="p-4 text-center w-28">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {initialLevels.map((lvl, idx) => (
              <tr key={lvl.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20">
                <td className="p-4 text-center text-neutral-400 font-mono">{idx + 1}</td>
                <td className="p-4 font-bold font-mono text-neutral-800 dark:text-neutral-200">{lvl.code}</td>
                <td className="p-4 text-sm font-semibold text-neutral-900 dark:text-neutral-100">{lvl.name}</td>
                <td className="p-4 text-center">
                  <div className="flex justify-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(lvl)}
                      className="p-1.5 hover:bg-sky-50 dark:hover:bg-sky-950/40 text-sky-600 rounded-md transition-colors cursor-pointer"
                      title="Sửa"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteLevel(lvl)}
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
        title={editingLevel ? 'Hiệu chỉnh cấp học' : 'Tạo cấp học mới'}
        footerButtons={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button variant="primary" onClick={handleSaveLevel}>Lưu</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Tên Cấp học *"
            placeholder="Ví dụ: Mầm non, Tiểu học..."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="Mã định danh *"
            placeholder="Ví dụ: MN, TH, THCS, THPT..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </div>
      </Modal>

    </div>
  );
}

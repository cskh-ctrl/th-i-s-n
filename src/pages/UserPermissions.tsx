import React, { useState, useMemo } from 'react';
import { Database } from '../store/db';
import { User, UserRole } from '../types';
import { useApp } from '../contexts/AppContext';
import { Card, Input, Button, Badge, Modal, Select } from '../components/UI';
import { Plus, Edit2, Trash2, Shield, Lock, CheckCircle2 } from 'lucide-react';

export default function UserPermissions() {
  const { currentUser, addToast, dbTrigger, triggerDbRefresh } = useApp();
  
  const initialUsers = useMemo(() => Database.getUsers(), [dbTrigger]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form states
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('admissions');
  const [isActive, setIsActive] = useState(true);

  const handleOpenAdd = () => {
    setEditingUser(null);
    setUsername('');
    setFullName('');
    setEmail('');
    setRole('admissions');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (usr: User) => {
    setEditingUser(usr);
    setUsername(usr.username);
    setFullName(usr.fullName);
    setEmail(usr.email);
    setRole(usr.role);
    setIsActive(usr.isActive);
    setIsModalOpen(true);
  };

  const handleSaveUser = () => {
    if (!username.trim() || !fullName.trim() || !email.trim()) {
      addToast('error', 'Lỗi nhập liệu', 'Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }

    const payload: User = {
      id: editingUser?.id || `usr-${Date.now()}`,
      username: username.trim().toLowerCase(),
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      role,
      isActive
    };

    let updated = [...initialUsers];
    if (editingUser) {
      updated = updated.map(u => u.id === editingUser.id ? payload : u);
      addToast('success', 'Cập nhật thành công', `Đã lưu tài khoản: ${fullName}`);
    } else {
      updated = [...updated, payload];
      addToast('success', 'Tạo mới thành công', `Đã cấp quyền cho tài khoản mới: ${fullName}`);
    }

    Database.setUsers(updated, currentUser, {
      action: editingUser ? 'SỬA NGƯỜI DÙNG' : 'THÊM NGƯỜI DÙNG'
    });
    
    Database.addAuditLog(
      currentUser, 
      editingUser ? 'CẬP NHẬT NGƯỜI DÙNG' : 'THÊM NGƯỜI DÙNG', 
      `Đã ${editingUser ? 'hiệu chỉnh' : 'tạo mới'} thông tin tài khoản ${fullName} với quyền ${role.toUpperCase()}`,
      editingUser ? JSON.stringify(editingUser) : undefined,
      JSON.stringify(payload)
    );

    triggerDbRefresh();
    setIsModalOpen(false);
  };

  const handleDeleteUser = (usr: User) => {
    if (usr.id === currentUser.id) {
      addToast('error', 'Không thể tự xóa', 'Bạn không thể tự xóa tài khoản của chính mình đang đăng nhập.');
      return;
    }

    if (window.confirm(`Bạn có chắc chắn muốn thu hồi toàn bộ quyền truy cập và xóa vĩnh viễn tài khoản "${usr.fullName}"?`)) {
      const updated = initialUsers.filter(u => u.id !== usr.id);
      Database.setUsers(updated, currentUser, { action: 'XÓA NGƯỜI DÙNG' });
      Database.addAuditLog(currentUser, 'THU HỒI TÀI KHOẢN', `Đã thu hồi vĩnh viễn quyền truy cập của tài khoản ${usr.fullName}`);
      triggerDbRefresh();
      addToast('success', 'Thu hồi thành công', `Đã xóa vĩnh viễn tài khoản "${usr.fullName}".`);
    }
  };

  // Helper text describing the exact matrix requested
  const getRoleBadge = (roleStr: string) => {
    switch (roleStr) {
      case 'admin': return <Badge variant="error">ADMINISTRATOR</Badge>;
      case 'accountant': return <Badge variant="success">KẾ TOÁN (ACCOUNTANT)</Badge>;
      case 'admissions': return <Badge variant="info">TUYỂN SINH (ADMISSIONS)</Badge>;
      default: return <Badge variant="neutral">MARKETING / READONLY</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 dark:border-neutral-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 uppercase flex items-center gap-2">
            <Shield className="w-5 h-5 text-brand-orange" />
            <span>Phân quyền người dùng & quản trị (ADMIN)</span>
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Đăng ký thành viên, cấp chứng chỉ phân quyền chi tiết cho nhân viên tuyển sinh, kế toán hoặc marketing.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={handleOpenAdd} icon={<Plus className="w-4 h-4" />}>
          Thêm người dùng
        </Button>
      </div>

      {/* Grid of Users */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {initialUsers.map((usr) => (
          <Card key={usr.id} className="relative overflow-hidden">
            <div className="flex justify-between items-start gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-navy/10 text-brand-navy font-bold flex items-center justify-center text-sm border border-brand-orange/20">
                  {usr.fullName.split(' ').pop()?.charAt(0) || 'U'}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-neutral-800 dark:text-neutral-200 leading-snug">{usr.fullName}</h4>
                  <p className="text-[10px] text-neutral-400">@{usr.username} | {usr.email}</p>
                </div>
              </div>

              <div className="flex gap-1">
                <button
                  onClick={() => handleOpenEdit(usr)}
                  className="p-1 hover:bg-sky-50 dark:hover:bg-sky-950/40 text-sky-600 rounded transition-colors cursor-pointer"
                  title="Sửa"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteUser(usr)}
                  className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 rounded transition-colors cursor-pointer"
                  title="Xóa"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800">
              {getRoleBadge(usr.role)}
              <Badge variant={usr.isActive ? 'success' : 'neutral'}>
                {usr.isActive ? 'Đang hoạt động' : 'Đã khóa'}
              </Badge>
            </div>
          </Card>
        ))}
      </div>

      {/* Role matrix explanation board */}
      <Card className="bg-neutral-900 text-white border-none shadow-md">
        <div className="flex items-center gap-2 mb-3">
          <Lock className="w-4 h-4 text-brand-orange" />
          <h4 className="font-bold text-xs uppercase tracking-wider text-brand-orange">Ma trận quyền hạn hệ thống học phí Việt Anh</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-[11px] leading-relaxed text-neutral-300">
          <div className="p-2.5 bg-neutral-950 rounded-lg">
            <span className="font-bold text-brand-orange block mb-1">ADMINISTRATOR</span>
            Toàn bộ các quyền năng tối cao bao gồm hiệu chỉnh cấu hình biểu phí gốc, năm học mới, người dùng và phục hồi sao lưu.
          </div>
          <div className="p-2.5 bg-neutral-950 rounded-lg">
            <span className="font-bold text-brand-orange block mb-1">KẾ TOÁN (ACCOUNTANT)</span>
            Phép tính học phí, phê duyệt in ấn, xuất tệp CSV/Excel lịch sử, phục hồi tệp tin nén. Không được phép chỉnh sửa biểu phí gốc.
          </div>
          <div className="p-2.5 bg-neutral-950 rounded-lg">
            <span className="font-bold text-brand-orange block mb-1">TUYỂN SINH (ADMISSIONS)</span>
            Phép tính học phí trực tuyến, in VietQR, in phiếu báo giá A4/A5, xem lịch sử tính phí, nhân bản. Không được sửa biểu phí.
          </div>
          <div className="p-2.5 bg-neutral-950 rounded-lg">
            <span className="font-bold text-brand-orange block mb-1">MARKETING (READ ONLY)</span>
            Chỉ được cấp quyền xem dữ liệu báo cáo tổng quan Dashboard, tìm kiếm lịch sử báo giá. Không được phép tính toán hoặc sửa đổi.
          </div>
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Hiệu chỉnh phân quyền thành viên' : 'Đăng ký thành viên mới'}
        footerButtons={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button variant="primary" onClick={handleSaveUser}>Đăng ký quyền</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Họ và tên thành viên *"
            placeholder="Ví dụ: Nguyễn Văn Trỗi..."
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Tên đăng nhập (Username) *"
              placeholder="Ví dụ: trancm..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={editingUser !== null}
            />

            <Input
              label="Địa chỉ email chính thức *"
              placeholder="Ví dụ: trancm@truongvietanh.com..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Chức danh phân quyền *"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
            >
              <option value="admin">Quản trị viên (Admin)</option>
              <option value="accountant">Phòng Kế toán (Accountant)</option>
              <option value="admissions">Phòng Tuyển sinh (Admissions)</option>
              <option value="marketing">Phòng Tiếp thị / Marketing (Read-only)</option>
            </Select>

            <Select
              label="Trạng thái tài khoản *"
              value={isActive ? 'true' : 'false'}
              onChange={(e) => setIsActive(e.target.value === 'true')}
            >
              <option value="true">Đang kích hoạt (Active)</option>
              <option value="false">Tạm khóa / Vô hiệu hóa (Locked)</option>
            </Select>
          </div>
        </div>
      </Modal>

    </div>
  );
}

import React, { useState, useMemo } from 'react';
import { Database } from '../store/db';
import { SystemSettings as ISettings } from '../types';
import { useApp } from '../contexts/AppContext';
import { Card, Input, Button } from '../components/UI';
import { Settings, Save, Landmark, School, HelpCircle, CheckCircle2 } from 'lucide-react';

export default function SystemSettings() {
  const { currentUser, addToast, dbTrigger, triggerDbRefresh } = useApp();

  // Load configuration
  const currentSettings = useMemo(() => Database.getSettings(), [dbTrigger]);

  // Form states
  const [schoolName, setSchoolName] = useState(currentSettings.schoolName);
  const [schoolAddress, setSchoolAddress] = useState(currentSettings.schoolAddress);
  const [schoolPhone, setSchoolPhone] = useState(currentSettings.schoolPhone);
  
  const [bankName, setBankName] = useState(currentSettings.bankName);
  const [bankAccount, setBankAccount] = useState(currentSettings.bankAccount);
  const [bankAccountName, setBankAccountName] = useState(currentSettings.bankAccountName);

  const handleSaveSettings = () => {
    if (!schoolName.trim() || !schoolAddress.trim() || !bankAccount.trim() || !bankAccountName.trim()) {
      addToast('error', 'Lỗi nhập liệu', 'Vui lòng điền đầy đủ các thông tin cài đặt trường học bắt buộc.');
      return;
    }

    try {
      const payload: ISettings = {
        ...currentSettings,
        schoolName: schoolName.trim(),
        schoolAddress: schoolAddress.trim(),
        schoolPhone: schoolPhone.trim(),
        bankName: bankName.trim(),
        bankAccount: bankAccount.trim(),
        bankAccountName: bankAccountName.trim()
      };

      Database.setSettings(payload, currentUser);
      triggerDbRefresh();
      addToast('success', 'Lưu cài đặt thành công', 'Cấu hình thông tin trường học & VietQR đã được lưu vào hệ thống.');
    } catch {
      addToast('error', 'Lỗi xử lý', 'Có lỗi xảy ra khi lưu trữ cài đặt cấu hình.');
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto">
      
      {/* Page Header */}
      <div className="border-b border-neutral-100 dark:border-neutral-800 pb-4">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 uppercase flex items-center gap-2">
          <Settings className="w-5 h-5 text-brand-orange" />
          <span>Cấu hình thông tin Trường học & Ngân hàng</span>
        </h2>
        <p className="text-xs text-neutral-500 mt-1">
          Cập nhật thông tin địa chỉ hiển thị trên hóa đơn, logo trường học, và số tài khoản để tự động sinh mã thanh toán QR-Code VietQR.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        
        {/* Card 1: School Profile */}
        <Card>
          <div className="flex items-center gap-2 mb-5 border-b border-neutral-100 dark:border-neutral-800 pb-2">
            <School className="w-5 h-5 text-brand-orange" />
            <h3 className="font-bold text-neutral-800 dark:text-neutral-200 text-sm uppercase">1. Hồ sơ thông tin trường học</h3>
          </div>

          <div className="flex flex-col gap-4">
            <Input
              label="Tên đơn vị giáo dục / Trường học *"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              required
            />

            <Input
              label="Địa chỉ văn phòng / Cơ sở tuyển sinh *"
              value={schoolAddress}
              onChange={(e) => setSchoolAddress(e.target.value)}
              required
            />

            <Input
              label="Số điện thoại / Hotline liên lạc *"
              value={schoolPhone}
              onChange={(e) => setSchoolPhone(e.target.value)}
              required
            />
          </div>
        </Card>

        {/* Card 2: Bank transfer setup for VietQR */}
        <Card>
          <div className="flex items-center gap-2 mb-5 border-b border-neutral-100 dark:border-neutral-800 pb-2">
            <Landmark className="w-5 h-5 text-brand-orange" />
            <h3 className="font-bold text-neutral-800 dark:text-neutral-200 text-sm uppercase">2. Thiết lập ngân hàng liên kết VietQR</h3>
          </div>

          <div className="flex flex-col gap-4">
            <Input
              label="Tên Ngân hàng thụ hưởng *"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="Ngân hàng Vietcombank..."
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Số tài khoản ngân hàng thụ hưởng *"
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                placeholder="1026543219..."
                required
              />

              <Input
                label="Họ tên chủ tài khoản (Không dấu) *"
                value={bankAccountName}
                onChange={(e) => setBankAccountName(e.target.value)}
                placeholder="CONG TY CP GIAO DUC VIET ANH..."
                required
              />
            </div>
          </div>
        </Card>

        {/* Explaining notice on VietQR generation */}
        <div className="p-4 border border-brand-navy/20 bg-brand-navy/5 rounded-xl flex gap-3 text-xs text-neutral-600 dark:text-neutral-400">
          <HelpCircle className="w-5 h-5 text-brand-orange shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold text-brand-navy dark:text-brand-orange uppercase">Nguyên lý tự động hóa VietQR:</span>
            <p className="mt-1">
              Hệ thống tự động sử dụng số tài khoản, mã ngân hàng thụ hưởng Vietcombank (970436) kết hợp với số thực đóng của phiếu báo học phí để sinh ảnh động mã QR chất lượng cao. Khi phụ huynh dùng Mobile Banking để quét, hệ thống ngân hàng sẽ tự động điền đúng tên chủ tài khoản, điền đúng chính xác tới từng đồng tiền lẻ và đúng nội dung chuyển khoản mã phiếu báo giá.
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button variant="primary" size="lg" onClick={handleSaveSettings} icon={<Save className="w-5 h-5" />}>
            Lưu toàn bộ cài đặt
          </Button>
        </div>

      </div>

    </div>
  );
}

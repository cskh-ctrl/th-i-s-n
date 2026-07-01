import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Card, Input, Button } from '../components/UI';
import { User, Lock, LogIn, Key, GraduationCap } from 'lucide-react';

export default function Login() {
  const { login } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim() || !password.trim()) {
      setErrorMsg('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
      return;
    }

    setIsLoading(true);
    // Introduce a tiny mock loading delay for realism and satisfying UX
    setTimeout(() => {
      const success = login(username.trim(), password.trim());
      setIsLoading(false);
      if (!success) {
        setErrorMsg('Sai tài khoản hoặc mật khẩu. Vui lòng kiểm tra lại!');
      }
    }, 450);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 p-4 transition-colors duration-300">
      
      <div className="w-full max-w-md flex flex-col gap-6">
        
        {/* Title / Branding */}
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 bg-brand-navy/10 dark:bg-brand-orange/10 rounded-2xl flex items-center justify-center border border-brand-orange/20 animate-pulse">
            <GraduationCap className="w-8 h-8 text-brand-navy dark:text-brand-orange" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-tight">
              Trường Việt Anh
            </h2>
            <p className="text-xs text-brand-orange font-bold tracking-widest uppercase mt-0.5">
              Cổng tính toán & quản lý học phí
            </p>
          </div>
        </div>

        {/* Login Form Card */}
        <Card className="shadow-lg border border-neutral-150/80 dark:border-neutral-800 p-8">
          <div className="mb-6">
            <h3 className="text-base font-bold text-neutral-800 dark:text-neutral-200">
              ĐĂNG NHẬP HỆ THỐNG
            </h3>
            <p className="text-xs text-neutral-500 mt-1">
              Nhập tài khoản được cấp quyền để truy cập cấu hình & báo giá.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            {/* Username Input */}
            <Input
              label="Tên đăng nhập (Username)"
              placeholder="Nhập tên đăng nhập (ví dụ: Admin)..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              icon={<User className="w-4 h-4 text-neutral-400" />}
              required
            />

            {/* Password Input */}
            <Input
              label="Mật khẩu (Password)"
              placeholder="Nhập mật khẩu truy cập..."
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-4 h-4 text-neutral-400" />}
              required
            />

            {/* Error Message Panel */}
            {errorMsg && (
              <div className="p-3 bg-rose-50/80 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-950/40 rounded-lg text-xs text-rose-600 dark:text-rose-400 font-semibold">
                {errorMsg}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2 font-bold py-3"
              disabled={isLoading}
              icon={<LogIn className="w-4 h-4" />}
            >
              {isLoading ? 'Đang xác thực...' : 'Xác nhận đăng nhập'}
            </Button>

          </form>

          {/* Quick account helper card */}
          <div className="mt-6 pt-5 border-t border-neutral-100 dark:border-neutral-800">
            <div className="flex items-start gap-2.5 p-3 bg-sky-50/50 dark:bg-sky-950/10 border border-sky-100 dark:border-sky-900/40 rounded-lg text-[11px] text-neutral-600 dark:text-neutral-400 leading-normal">
              <Key className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-sky-700 dark:text-sky-400 uppercase">Tài khoản quản trị cao nhất:</span>
                <ul className="mt-1 space-y-0.5 list-disc list-inside">
                  <li>Tên đăng nhập: <strong className="font-mono text-neutral-900 dark:text-white">admin</strong></li>
                  <li>Mật khẩu: <strong className="font-mono text-neutral-900 dark:text-white">1234</strong></li>
                </ul>
                <p className="mt-1.5 text-[10px] text-neutral-400 italic">
                  * Khi vào trong, bạn có thể tự do thêm người dùng khác và cấp mật khẩu riêng biệt tại mục "Người dùng & Phân quyền".
                </p>
              </div>
            </div>
          </div>

        </Card>

        {/* Back-link decorative */}
        <p className="text-[10px] text-neutral-400 text-center">
          Bản quyền © 2026 Hệ thống Giáo dục Việt Anh. Bảo mật SSL 256-bit.
        </p>

      </div>

    </div>
  );
}

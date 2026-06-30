import React, { useState, useMemo, useRef } from 'react';
import { Database } from '../store/db';
import { AuditLog } from '../types';
import { useApp } from '../contexts/AppContext';
import { Card, Input, Button, Badge } from '../components/UI';
import { 
  Download, 
  Upload, 
  Trash2, 
  Activity, 
  Info, 
  RefreshCw,
  Search,
  CheckCircle2,
  AlertOctagon,
  Cloud,
  CloudLightning,
  Database as DbStackIcon
} from 'lucide-react';

export default function DataBackup() {
  const { currentUser, addToast, dbTrigger, triggerDbRefresh } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Firebase Sync States
  const [isPushing, setIsPushing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);

  const handlePushToFirebase = async () => {
    setIsPushing(true);
    try {
      await Database.pushToFirebase();
      addToast('success', 'Đồng bộ đám mây thành công', 'Đã tải toàn bộ dữ liệu cấu hình lên cơ sở dữ liệu Firebase Firestore.');
      triggerDbRefresh();
    } catch (e: any) {
      addToast('error', 'Đồng bộ thất bại', e.message || 'Lỗi không xác định khi ghi dữ liệu lên Cloud.');
    } finally {
      setIsPushing(false);
    }
  };

  const handlePullFromFirebase = async () => {
    if (!window.confirm('Cảnh báo: Tải dữ liệu từ Firebase sẽ ghi đè toàn bộ dữ liệu hiện tại trên trình duyệt của bạn. Tiếp tục?')) {
      return;
    }
    setIsPulling(true);
    try {
      await Database.pullFromFirebase();
      addToast('success', 'Tải dữ liệu đám mây thành công', 'Hệ thống đã cập nhật toàn bộ biểu phí mới nhất từ Firebase Firestore.');
      triggerDbRefresh();
    } catch (e: any) {
      addToast('error', 'Tải dữ liệu thất bại', e.message || 'Lỗi không xác định khi tải dữ liệu từ Cloud.');
    } finally {
      setIsPulling(false);
    }
  };

  // 1. Fetch DB
  const initialLogs = useMemo(() => Database.getAuditLogs(), [dbTrigger]);
  
  // States
  const [logSearchQuery, setLogSearchQuery] = useState('');

  // 2. Filter logs
  const filteredLogs = useMemo(() => {
    return initialLogs.filter(log => {
      const matchSearch = 
        log.userName.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
        log.details.toLowerCase().includes(logSearchQuery.toLowerCase());
      return matchSearch;
    });
  }, [initialLogs, logSearchQuery]);

  // 3. Download full DB backup
  const handleExportBackup = () => {
    try {
      const fullJson = Database.exportFullBackup();
      const blob = new Blob([fullJson], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', `ThaiSon_School_Tuition_DB_Backup_${new Date().toISOString().substring(0, 10)}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      addToast('success', 'Sao lưu thành công', 'Toàn bộ cơ sở dữ liệu đã được nén thành tệp tin JSON tải về.');
    } catch {
      addToast('error', 'Lỗi sao lưu', 'Không thể tạo bản sao lưu.');
    }
  };

  // 4. Upload & restore DB from backup
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.confirm('Cảnh báo: Phục hồi từ bản sao lưu sẽ ghi đè và thay thế toàn bộ dữ liệu hiện tại trong hệ thống. Bạn có chắc chắn muốn tiếp tục?')) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const success = Database.importFullBackup(text, currentUser);
      if (success) {
        triggerDbRefresh();
        addToast('success', 'Khôi phục dữ liệu thành công', 'Toàn bộ hệ thống đã được phục hồi chính xác từ tệp tin lưu trữ.');
      } else {
        addToast('error', 'Khôi phục thất bại', 'Tệp tin tải lên bị lỗi cú pháp hoặc không tương thích.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // 5. Hard Wipe DB to defaults
  const handleWipeDatabase = () => {
    if (window.confirm('CẢNH BÁO KHẨN CẤP: Hành động này sẽ dọn sạch toàn bộ dữ liệu bao gồm biểu phí tự chế, học sinh, và lịch sử hóa đơn để phục hồi về hạt giống seed ban đầu. Bạn có chắc chắn?')) {
      Database.resetToDefault(currentUser);
      triggerDbRefresh();
      addToast('success', 'Làm sạch thành công', 'Đã xóa toàn bộ cấu hình cá nhân hóa và khôi phục hạt giống dữ liệu mặc định.');
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    } catch {
      return dateStr;
    }
  };

  const getLogRoleBadge = (role: string) => {
    switch (role) {
      case 'admin': return <Badge variant="error">ADMIN</Badge>;
      case 'accountant': return <Badge variant="success">KẾ TOÁN</Badge>;
      case 'admissions': return <Badge variant="info">TS</Badge>;
      default: return <Badge variant="neutral">MKT</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto">
      
      {/* Title */}
      <div className="border-b border-neutral-100 dark:border-neutral-800 pb-4">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 uppercase flex items-center gap-2">
          <Activity className="w-5 h-5 text-brand-orange" />
          <span>Sao lưu dữ liệu & Nhật ký thay đổi (ADMIN)</span>
        </h2>
        <p className="text-xs text-neutral-500 mt-1">
          Bảo mật dữ liệu tối cao bằng cách sao lưu nén dự phòng định kỳ, khôi phục từ tệp tin lưu trữ, hoặc truy vết lịch sử sửa đổi của nhân viên.
        </p>
      </div>

      {/* Firebase Cloud Sync Control Panel */}
      <Card className="border-brand-navy/20 dark:border-brand-orange/20 bg-brand-navy/5 dark:bg-brand-orange/5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-brand-navy/15 dark:bg-brand-orange/20 rounded-xl text-brand-navy dark:text-brand-orange shrink-0">
              <Cloud className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-sm uppercase">
                  Đồng bộ Đám mây Firebase Firestore
                </h3>
                <Badge variant="success" className="animate-pulse">ĐÃ KẾT NỐI</Badge>
              </div>
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed max-w-2xl">
                Hệ thống đang kết nối trực tiếp với dự án Firestore Cloud: <code className="bg-neutral-200 dark:bg-neutral-800 px-1 py-0.5 rounded font-mono text-[10px] text-brand-navy dark:text-brand-orange font-bold font-mono">gen-lang-client-0938470979</code>. 
                Bạn có thể nạp toàn bộ dữ liệu mẫu cấu hình hiện tại lên đám mây hoặc khôi phục dữ liệu từ đám mây về thiết bị bất cứ lúc nào.
              </p>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Tự động sao lưu
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Đồng bộ thời gian thực
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Bảo mật cấp cao TLS/SSL
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch lg:items-center gap-3 shrink-0">
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={handlePullFromFirebase} 
              disabled={isPulling || isPushing}
              icon={<RefreshCw className={`w-4 h-4 ${isPulling ? 'animate-spin' : ''}`} />}
              className="font-bold text-xs"
            >
              {isPulling ? 'Đang tải về...' : 'Tải dữ liệu từ Firebase'}
            </Button>
            <Button 
              variant="success" 
              size="sm" 
              onClick={handlePushToFirebase} 
              disabled={isPulling || isPushing}
              icon={<CloudLightning className={`w-4 h-4 ${isPushing ? 'animate-spin' : ''}`} />}
              className="font-bold text-xs bg-emerald-600 hover:bg-emerald-700 hover:text-white"
            >
              {isPushing ? 'Đang đồng bộ...' : 'Đẩy dữ liệu lên Firebase'}
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Back up */}
        <Card className="flex flex-col justify-between">
          <div>
            <span className="text-brand-orange font-extrabold uppercase text-[10px] tracking-widest block mb-2">Hành động bảo mật</span>
            <h4 className="font-bold text-neutral-900 dark:text-neutral-100 text-sm uppercase">Tạo bản sao lưu nén</h4>
            <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
              Tải xuống tức thời tệp nén <code className="bg-neutral-100 dark:bg-neutral-950 px-1 py-0.5 rounded text-[10px] font-mono">.json</code> chứa toàn bộ năm học, cấp học, lớp học, cấu hình biểu phí gốc và lịch sử in ấn hóa đơn.
            </p>
          </div>
          <Button variant="success" size="sm" onClick={handleExportBackup} className="w-full mt-6" icon={<Download className="w-4 h-4" />}>
            Tải xuống file sao lưu
          </Button>
        </Card>

        {/* Card 2: Restore */}
        <Card className="flex flex-col justify-between relative">
          <div>
            <span className="text-brand-orange font-extrabold uppercase text-[10px] tracking-widest block mb-2">Hành động khôi phục</span>
            <h4 className="font-bold text-neutral-900 dark:text-neutral-100 text-sm uppercase">Khôi phục từ tệp tin</h4>
            <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
              Đọc tệp tin nén cấu hình đã tải trước đó để khôi phục toàn vẹn hệ thống học phí của trường học về trạng thái lưu trữ cũ.
            </p>
          </div>
          
          <div className="mt-6">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportBackup}
              accept=".json"
              className="hidden"
            />
            <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()} className="w-full" icon={<Upload className="w-4 h-4" />}>
              Tải lên tệp khôi phục
            </Button>
          </div>
        </Card>

        {/* Card 3: Wipe/Reset */}
        <Card className="flex flex-col justify-between border-rose-500/10">
          <div>
            <span className="text-rose-600 font-extrabold uppercase text-[10px] tracking-widest block mb-2">Hành động nguy hại</span>
            <h4 className="font-bold text-neutral-900 dark:text-neutral-100 text-sm uppercase">Làm sạch cơ sở dữ liệu</h4>
            <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
              Khôi phục nhanh toàn bộ hệ thống về hạt giống dữ liệu chuẩn ban đầu của Trường Việt Anh (Wipe localStorage).
            </p>
          </div>
          <Button variant="danger" size="sm" onClick={handleWipeDatabase} className="w-full mt-6" icon={<Trash2 className="w-4 h-4" />}>
            Xóa trắng & Reset
          </Button>
        </Card>

      </div>

      {/* 2. Changing Logs - Audit Trail section */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 dark:border-neutral-800 pb-4 mb-4">
          <div>
            <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-sm uppercase flex items-center gap-2">
              <Activity className="w-4.5 h-4.5 text-brand-orange" />
              <span>Truy vết nhật ký thay đổi chi tiết (Audit Trail)</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Ghi nhận tự động vết thay đổi: ai đã sửa khoản phí, sửa đơn giá lúc nào, giá trị cũ và giá trị mới là bao nhiêu.
            </p>
          </div>

          <div className="w-full sm:w-80">
            <Input
              placeholder="Nhập tên nhân viên, hành động sửa đổi..."
              value={logSearchQuery}
              onChange={(e) => setLogSearchQuery(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
        </div>

        {/* Audit list Table */}
        <div className="border border-neutral-100 dark:border-neutral-800 rounded-xl overflow-hidden text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-950/50 text-neutral-500 font-bold uppercase border-b border-neutral-100 dark:border-neutral-800">
                  <th className="p-3 w-40">Thời điểm</th>
                  <th className="p-3">Hành động</th>
                  <th className="p-3">Nội dung chỉnh sửa</th>
                  <th className="p-3 w-40">Nhân viên thực hiện</th>
                  <th className="p-3 w-28">Vai trò</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-neutral-400 italic">
                      Không tìm thấy bản ghi nhật ký truy vết sửa đổi nào.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map(log => (
                    <tr key={log.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20">
                      <td className="p-3 text-neutral-500 font-mono">{formatDate(log.timestamp)}</td>
                      <td className="p-3 font-bold text-brand-navy dark:text-brand-orange">{log.action}</td>
                      <td className="p-3">
                        <p className="text-neutral-800 dark:text-neutral-200 font-semibold">{log.details}</p>
                        
                        {/* Old / New values displays if exists */}
                        {log.oldValue && log.newValue && (
                          <div className="mt-2 grid grid-cols-2 gap-3 text-[10px] bg-neutral-50 dark:bg-neutral-950/50 border border-neutral-100 dark:border-neutral-900 rounded-lg p-2 leading-relaxed">
                            <div className="text-neutral-500">
                              <span className="font-bold text-rose-500 block uppercase mb-1">Giá trị cũ:</span>
                              <div className="max-h-24 overflow-y-auto font-mono whitespace-pre-wrap">{log.oldValue.length > 100 ? `${log.oldValue.substring(0, 100)}...` : log.oldValue}</div>
                            </div>
                            <div className="text-neutral-700 dark:text-neutral-300">
                              <span className="font-bold text-brand-orange block uppercase mb-1">Giá trị mới:</span>
                              <div className="max-h-24 overflow-y-auto font-mono whitespace-pre-wrap">{log.newValue.length > 100 ? `${log.newValue.substring(0, 100)}...` : log.newValue}</div>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="p-3 font-semibold text-neutral-800 dark:text-neutral-200">{log.userName}</td>
                      <td className="p-3">{getLogRoleBadge(log.userRole)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

    </div>
  );
}

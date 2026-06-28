import React, { useRef, useState } from 'react';
import { FeeQuote, SystemSettings } from '../types';
import { Database } from '../store/db';
import { Button, Card } from './UI';
import { Printer, ArrowLeft, Check, Download, AlertTriangle } from 'lucide-react';

interface PrintableQuoteProps {
  quote: FeeQuote;
  onBack?: () => void;
}

export default function PrintableQuote({ quote, onBack }: PrintableQuoteProps) {
  const settings: SystemSettings = Database.getSettings();
  const [pageSize, setPageSize] = useState<'A4' | 'A5'>('A4');
  
  const levels = Database.getEducationLevels();
  const classes = Database.getClasses();
  const years = Database.getAcademicYears();
  
  const levelName = levels.find(l => l.id === quote.levelId)?.name || '';
  const className = classes.find(c => c.id === quote.classId)?.name || '';
  const yearName = years.find(y => y.id === quote.yearId)?.name || '';

  // Calculate VietQR Code URL
  // Bank Code: 970436 (Vietcombank)
  // Account: settings.bankAccount
  // Name: settings.bankAccountName
  // Amount: quote.grandTotal
  // Description: HOC PHI [QuoteID] [StudentName] (unsigned)
  const removeVietnameseTones = (str: string) => {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .toUpperCase();
  };

  const cleanStudentName = removeVietnameseTones(quote.studentName).replace(/\s+/g, '%20');
  const qrTransferMemo = `HP%20${quote.id}%20${cleanStudentName}`.substring(0, 50);
  const vietQrUrl = `https://api.vietqr.io/image/970436-${settings.bankAccount}-compact2.jpg?amount=${quote.grandTotal}&addInfo=${qrTransferMemo}&accountName=${encodeURIComponent(settings.bankAccountName)}`;

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  const getTermLabel = (term: string) => {
    switch (term) {
      case 'month': return 'Theo tháng (1 tháng)';
      case 'quarter': return 'Theo quý (3 tháng)';
      case 'semester': return 'Theo học kỳ (5 tháng)';
      case 'year': return 'Cả năm học (10 tháng)';
      default: return term;
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto pb-12">
      {/* Action Toolbar - Hidden on Print */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 print:hidden">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack} icon={<ArrowLeft className="w-4 h-4" />}>
              Quay lại
            </Button>
          )}
          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">Báo phí: {quote.id}</h3>
            <p className="text-xs text-neutral-500">Học sinh: {quote.studentName}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Format Swapper */}
          <div className="flex rounded-lg bg-white dark:bg-neutral-950 p-1 border border-neutral-200 dark:border-neutral-800 text-xs font-semibold">
            <button
              onClick={() => setPageSize('A4')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                pageSize === 'A4'
                  ? 'bg-brand-navy text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              In A4 (Dọc)
            </button>
            <button
              onClick={() => setPageSize('A5')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                pageSize === 'A5'
                  ? 'bg-brand-navy text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              In A5 (Ngang)
            </button>
          </div>

          <Button variant="primary" size="sm" onClick={handlePrint} icon={<Printer className="w-4 h-4" />}>
            In / Xuất PDF
          </Button>
        </div>
      </div>

      {/* Frame for Browser Print Preview - Configured dynamically by pageSize state */}
      <div 
        className={`bg-white text-neutral-900 p-8 md:p-12 border border-neutral-200 shadow-lg mx-auto w-full font-sans transition-all duration-300 ${
          pageSize === 'A4' 
            ? 'aspect-[1/1.414]' 
            : 'aspect-[1.414/1] max-w-full text-xs'
        }`}
        style={{ contentVisibility: 'auto' }}
      >
        <div className="flex flex-col h-full justify-between gap-6">
          {/* 1. Invoice Header */}
          <div className="flex justify-between items-start border-b-2 border-brand-navy pb-4">
            <div className="flex gap-4 items-center">
              <img 
                src="https://truongvietanh.com/logo-vietanh.webp" 
                alt="Trường Việt Anh" 
                className="w-16 h-16 object-contain border border-neutral-100 p-1.5 rounded-xl"
                referrerPolicy="no-referrer"
              />
              <div>
                <h1 className="text-xl font-bold tracking-tight text-neutral-900 uppercase">
                  {settings.schoolName}
                </h1>
                <p className="text-xs text-neutral-500 max-w-md mt-0.5 leading-relaxed">
                  Đại diện Hệ thống Trường Việt Anh<br />
                  Địa chỉ: {settings.schoolAddress}<br />
                  Hotline: {settings.schoolPhone}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block bg-brand-light-bg text-brand-navy text-[10px] font-bold px-2 py-0.5 rounded-md mb-1 border border-brand-border">
                BẢNG BÁO PHÍ CHÍNH THỨC
              </span>
              <h2 className="text-lg font-bold text-neutral-800 font-mono">{quote.id}</h2>
              <p className="text-xs text-neutral-500 mt-1">
                Ngày tạo: {formatDate(quote.createdAt.substring(0, 10))}<br />
                Hạn đóng phí: <span className="font-semibold text-rose-600">{formatDate(quote.validUntil)}</span>
              </p>
            </div>
          </div>

          {/* 2. Customer & Class Information */}
          <div className="grid grid-cols-2 gap-6 bg-neutral-50 p-4 rounded-lg border border-neutral-200">
            <div>
              <h4 className="text-xs font-bold text-brand-navy uppercase tracking-wider mb-2">Thông tin học sinh</h4>
              <div className="grid grid-cols-[100px_1fr] gap-x-2 gap-y-1 text-xs">
                <span className="text-neutral-500">Họ và tên:</span>
                <span className="font-bold text-neutral-900 text-sm">{quote.studentName}</span>
                
                <span className="text-neutral-500">Ngày sinh:</span>
                <span>{formatDate(quote.studentDob)}</span>
                
                <span className="text-neutral-500">Năm học:</span>
                <span>{yearName}</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-brand-navy uppercase tracking-wider mb-2">Xếp lớp & Đóng phí</h4>
              <div className="grid grid-cols-[100px_1fr] gap-x-2 gap-y-1 text-xs">
                <span className="text-neutral-500">Khối học:</span>
                <span className="font-medium">{levelName}</span>
                
                <span className="text-neutral-500">Lớp học:</span>
                <span className="font-semibold">{className}</span>
                
                <span className="text-neutral-500">Phương thức:</span>
                <span className="font-bold text-brand-orange">{getTermLabel(quote.paymentTerm)}</span>
              </div>
            </div>
          </div>

          {/* 3. Detailed Itemized Fees Grid */}
          <div className="flex-grow">
            <h4 className="text-xs font-bold text-brand-navy uppercase tracking-wider mb-2">Chi tiết các khoản thu</h4>
            <table className="w-full border-collapse border border-neutral-200 text-xs">
              <thead>
                <tr className="bg-brand-navy text-white text-left font-bold">
                  <th className="border border-neutral-200 p-2 text-center w-8">STT</th>
                  <th className="border border-neutral-200 p-2">Khoản thu</th>
                  <th className="border border-neutral-200 p-2 text-center">Đơn vị</th>
                  <th className="border border-neutral-200 p-2 text-center">Số lượng</th>
                  <th className="border border-neutral-200 p-2 text-right">Đơn giá</th>
                  <th className="border border-neutral-200 p-2 text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {quote.selectedFeeItems.map((item, idx) => (
                  <tr key={item.itemId} className="hover:bg-neutral-50">
                    <td className="border border-neutral-200 p-2 text-center">{idx + 1}</td>
                    <td className="border border-neutral-200 p-2">
                      <div className="font-semibold text-neutral-900">{item.name}</div>
                      <div className="text-[10px] text-neutral-400">
                        {item.type === 'mandatory' ? 'Khoản phí bắt buộc' : 'Khoản đăng ký tự chọn'}
                      </div>
                    </td>
                    <td className="border border-neutral-200 p-2 text-center">{item.unit}</td>
                    <td className="border border-neutral-200 p-2 text-center font-medium">{item.quantity}</td>
                    <td className="border border-neutral-200 p-2 text-right font-mono">{formatCurrency(item.unitPrice)}</td>
                    <td className="border border-neutral-200 p-2 text-right font-semibold font-mono">{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 4. Discounts & Calculations Summary block */}
          <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-6 items-start mt-4">
            {/* Left side: Applied Discount details & Bank instruction */}
            <div className="flex flex-col gap-3">
              {quote.appliedDiscounts.length > 0 && (
                <div className="border border-brand-border rounded-lg p-3 bg-brand-light-bg">
                  <h5 className="text-[10px] font-bold text-brand-navy uppercase mb-1.5">Ưu đãi giảm học phí đã áp dụng</h5>
                  <ul className="text-xs space-y-1 text-neutral-700">
                    {quote.appliedDiscounts.map(disc => (
                      <li key={disc.policyId} className="flex justify-between">
                        <span>• {disc.name}</span>
                        <span className="font-semibold text-rose-600 font-mono">-{formatCurrency(disc.discountValue)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Payment information */}
              <div className="border border-neutral-200 rounded-lg p-3 bg-neutral-50 text-xs">
                <h5 className="text-[10px] font-bold text-neutral-600 uppercase mb-1.5">Thông tin thanh toán qua ngân hàng</h5>
                <div className="grid grid-cols-[80px_1fr] gap-x-2 gap-y-0.5">
                  <span className="text-neutral-400">Ngân hàng:</span>
                  <span className="font-semibold">{settings.bankName}</span>
                  
                  <span className="text-neutral-400">Số tài khoản:</span>
                  <span className="font-bold text-neutral-950 font-mono">{settings.bankAccount}</span>
                  
                  <span className="text-neutral-400">Chủ tài khoản:</span>
                  <span className="font-semibold uppercase text-neutral-900">{settings.bankAccountName}</span>
                  
                  <span className="text-neutral-400">Nội dung CK:</span>
                  <span className="font-semibold text-brand-navy font-mono bg-brand-light-bg px-1.5 py-0.5 rounded-sm border border-brand-border">
                    HP {quote.id} {quote.studentName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Right side: Calculation totals & VietQR payment code */}
            <div className="flex flex-col gap-4 items-stretch justify-between h-full">
              {/* Calculations Box */}
              <div className="bg-neutral-900 text-white rounded-xl p-4 flex flex-col gap-2">
                <div className="flex justify-between text-xs border-b border-neutral-800 pb-1.5">
                  <span className="text-neutral-400">Tổng cộng chưa giảm:</span>
                  <span className="font-semibold font-mono">{formatCurrency(quote.subtotal)}</span>
                </div>
                <div className="flex justify-between text-xs border-b border-neutral-800 pb-1.5">
                  <span className="text-neutral-400">Tổng giá trị giảm trừ:</span>
                  <span className="font-semibold text-rose-400 font-mono">-{formatCurrency(quote.discountTotal)}</span>
                </div>
                <div className="flex justify-between text-sm pt-1">
                  <span className="font-bold text-brand-orange uppercase">Thực đóng (VND):</span>
                  <span className="text-base font-bold text-brand-orange font-mono">{formatCurrency(quote.grandTotal)}</span>
                </div>
              </div>

              {/* VietQR Integration block */}
              <div className="flex items-center gap-4 border border-neutral-200 rounded-xl p-3 bg-white">
                <img 
                  src={vietQrUrl} 
                  alt="VietQR Bank Transfer Code" 
                  className="w-20 h-20 border border-neutral-100 rounded-md object-contain"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-grow">
                  <span className="inline-block bg-brand-orange text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full mb-1">
                    QUÉT QR ĐỂ THANH TOÁN
                  </span>
                  <p className="text-[10px] text-neutral-500 leading-normal">
                    Quét QR bằng ví điện tử hoặc ứng dụng ngân hàng di động để tự động điền số tiền và nội dung chuyển khoản chính xác tuyệt đối.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 5. Legal Signature Block */}
          <div className="grid grid-cols-2 gap-12 text-center text-xs mt-6 border-t border-neutral-200 pt-6">
            <div className="flex flex-col gap-12 items-center justify-between">
              <p className="font-medium text-neutral-500">Phụ huynh học sinh<br /><span className="text-[10px] font-normal italic">(Ký và ghi rõ họ tên)</span></p>
              <div className="h-10"></div>
              <p className="text-neutral-300 font-light font-mono">...............................................</p>
            </div>

            <div className="flex flex-col gap-12 items-center justify-between relative">
              <p className="font-semibold text-neutral-800">Trưởng phòng Kế toán & Tuyển sinh<br /><span className="text-[10px] font-normal italic text-neutral-500">(Đã duyệt điện tử)</span></p>
              
              {/* Electronic Seal representation */}
              <div className="relative">
                <div className="absolute -top-6 -left-16 w-24 h-24 border-3 border-rose-500/80 rounded-full flex items-center justify-center text-[8px] text-rose-500/90 font-bold rotate-12 select-none pointer-events-none p-1 text-center leading-tight">
                  <div>
                    TRƯỜNG VIỆT ANH<br />
                    ★<br />
                    ĐÃ DUYỆT BÁO PHÍ
                  </div>
                </div>
                {/* Simulated Signature */}
                <div className="text-sky-700 italic font-bold font-serif text-lg rotate-[-6deg] select-none pointer-events-none">
                  Thanh Phan
                </div>
              </div>

              <p className="font-bold text-neutral-700 uppercase">Phan Thị Thanh</p>
            </div>
          </div>

          {/* 6. Terms Notice */}
          <div className="text-[10px] text-neutral-400 text-center border-t border-neutral-100 pt-3 leading-normal">
            Báo phí được lập tự động từ Hệ thống Quản lý Học phí Trường Việt Anh. Mọi điều khoản thu chi tuân thủ quy chế học bổng và quy định tài chính của hệ thống. Vui lòng liên hệ Văn phòng Tuyển sinh trước thời hạn để được giải đáp thắc mắc.
          </div>
        </div>
      </div>
      
      {/* Dynamic Printing CSS for standard browsers */}
      <style>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          header, footer, nav, sidebar, aside {
            display: none !important;
          }
          @page {
            size: ${pageSize === 'A4' ? 'A4 portrait' : 'A5 landscape'};
            margin: 0.5cm;
          }
          .aspect-\\[1\\/1\\.414\\], .aspect-\\[1\\.414\\/1\\] {
            aspect-ratio: auto !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}

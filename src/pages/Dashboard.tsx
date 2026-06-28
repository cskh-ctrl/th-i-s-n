import React, { useMemo } from 'react';
import { Database } from '../store/db';
import { Card, Badge, Button } from '../components/UI';
import { useApp } from '../contexts/AppContext';
import { 
  Calculator, 
  TrendingUp, 
  Calendar, 
  Users, 
  DollarSign, 
  Award, 
  CheckCircle2, 
  ArrowRight, 
  History 
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';

export default function Dashboard() {
  const { currentUser, setActiveTab, dbTrigger } = useApp();

  // Load and memoize all aggregated stats to keep rendering blazing fast
  const stats = useMemo(() => {
    const quotes = Database.getQuotes();
    const levels = Database.getEducationLevels();
    const classes = Database.getClasses();
    const feeItems = Database.getFeeItems();
    
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const startOfYear = new Date(now.getFullYear(), 0, 1).getTime();

    // 1. Calculations count
    let todayCount = 0;
    let monthCount = 0;
    let yearCount = 0;
    let totalRevenue = 0;
    let totalDiscounts = 0;

    quotes.forEach(q => {
      const qTime = new Date(q.createdAt).getTime();
      if (qTime >= startOfToday) todayCount++;
      if (qTime >= startOfMonth) monthCount++;
      if (qTime >= startOfYear) yearCount++;
      
      totalRevenue += q.grandTotal;
      totalDiscounts += q.discountTotal;
    });

    // 2. Education level ratio
    const levelCountMap: Record<string, number> = {};
    levels.forEach(lvl => {
      levelCountMap[lvl.id] = 0;
    });

    quotes.forEach(q => {
      if (levelCountMap[q.levelId] !== undefined) {
        levelCountMap[q.levelId]++;
      } else {
        levelCountMap[q.levelId] = 1;
      }
    });

    const levelChartData = levels.map(lvl => ({
      name: lvl.name,
      value: levelCountMap[lvl.id] || 0
    })).filter(item => item.value > 0);

    // If empty, fill with default mock indicators so charts aren't completely blank
    if (levelChartData.length === 0) {
      levelChartData.push(
        { name: 'Mầm non', value: 3 },
        { name: 'Tiểu học', value: 5 },
        { name: 'THCS', value: 2 }
      );
    }

    // 3. Payment terms ratio
    const termCountMap = {
      month: 0,
      quarter: 0,
      semester: 0,
      year: 0
    };

    quotes.forEach(q => {
      if (termCountMap[q.paymentTerm] !== undefined) {
        termCountMap[q.paymentTerm]++;
      }
    });

    const termLabels = {
      month: 'Theo tháng',
      quarter: 'Theo quý',
      semester: 'Theo kỳ',
      year: 'Cả năm'
    };

    const termChartData = Object.entries(termCountMap).map(([key, value]) => ({
      name: termLabels[key as keyof typeof termLabels],
      value
    })).filter(item => item.value > 0);

    if (termChartData.length === 0) {
      termChartData.push(
        { name: 'Theo tháng', value: 2 },
        { name: 'Theo kỳ', value: 4 },
        { name: 'Cả năm', value: 3 }
      );
    }

    // 4. Top selected fee items
    const itemFreqMap: Record<string, { name: string; count: number }> = {};
    quotes.forEach(q => {
      q.selectedFeeItems.forEach(item => {
        if (!itemFreqMap[item.itemId]) {
          itemFreqMap[item.itemId] = { name: item.name, count: 0 };
        }
        itemFreqMap[item.itemId].count += item.quantity;
      });
    });

    const topItemsData = Object.values(itemFreqMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(item => ({
        name: item.name.length > 25 ? `${item.name.substring(0, 22)}...` : item.name,
        'Số lượng': item.count
      }));

    if (topItemsData.length === 0) {
      topItemsData.push(
        { name: 'Học phí Tiểu học', 'Số lượng': 15 },
        { name: 'Ăn bán trú (Trưa, Xế)', 'Số lượng': 12 },
        { name: 'Học phí Mầm non', 'Số lượng': 10 },
        { name: 'Phí đăng ký & Giữ chỗ', 'Số lượng': 8 },
        { name: 'Đồng phục Tiểu học', 'Số lượng': 6 }
      );
    }

    return {
      todayCount,
      monthCount,
      yearCount,
      totalRevenue,
      totalDiscounts,
      levelChartData,
      termChartData,
      topItemsData,
      totalQuotes: quotes.length
    };
  }, [dbTrigger]);

  const COLORS = ['#10b981', '#06b6d4', '#6366f1', '#f59e0b', '#ec4899'];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto">
      
      {/* Dynamic Welcoming Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-brand-navy dark:text-neutral-100 uppercase">
            HỆ THỐNG QUẢN LÝ HỌC PHÍ VIỆT ANH
          </h2>
          <p className="text-xs text-neutral-500">
            Dữ liệu tổng hợp trực tuyến từ phòng tuyển sinh và phòng kế toán Hệ thống Trường Việt Anh.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary" size="sm" onClick={() => setActiveTab('tuition-calc')} icon={<Calculator className="w-4 h-4" />}>
            Tính học phí mới
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setActiveTab('quote-history')} icon={<History className="w-4 h-4" />}>
            Xem lịch sử
          </Button>
        </div>
      </div>

      {/* Onboarding Guide Card for new staff */}
      <div className="bg-orange-50/50 dark:bg-neutral-900/30 border border-brand-orange/30 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-2xs">
        <div className="flex gap-3 items-start">
          <div className="w-10 h-10 rounded-xl bg-brand-orange/10 text-brand-orange flex items-center justify-center shrink-0">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <span className="bg-brand-orange/10 text-brand-orange text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Khóa đào tạo 5 phút cho Nhân Viên Mới
            </span>
            <h4 className="font-bold text-neutral-800 dark:text-neutral-200 text-sm mt-1">
              Bạn mới làm quen với quy trình tuyển sinh của trường?
            </h4>
            <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">
              Hãy nhấp vào nút dưới đây để trải nghiệm cổng tính học phí 3 bước cực kỳ đơn giản, có sẵn dữ liệu mẫu để thực hành ngay lập tức.
            </p>
          </div>
        </div>
        <button
          onClick={() => setActiveTab('tuition-calc')}
          className="bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold text-xs px-4.5 py-2.5 rounded-xl flex items-center gap-1.5 shrink-0 shadow-xs transition-all hover:scale-[1.02]"
        >
          <span>Trải nghiệm tính phí 5 phút</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 1. Stat Cards Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Today Counts */}
        <Card className="relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Lượt tính hôm nay</p>
              <h3 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mt-2 font-mono">
                {stats.todayCount}
              </h3>
            </div>
            <div className="p-3 bg-brand-orange/10 text-brand-orange rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[10px] text-neutral-400 mt-3 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse" />
            <span>Tự động cập nhật trực tuyến</span>
          </div>
        </Card>

        {/* Month Counts */}
        <Card className="relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Lượt tính tháng này</p>
              <h3 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mt-2 font-mono">
                {stats.monthCount}
              </h3>
            </div>
            <div className="p-3 bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 rounded-xl">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[10px] text-neutral-400 mt-3">
            Học kỳ hiện tại: <span className="font-semibold text-brand-orange">Học Kỳ 1</span>
          </div>
        </Card>

        {/* Quoted Billing Volume */}
        <Card className="relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Giá trị báo phí lũy kế</p>
              <h3 className="text-xl font-extrabold text-neutral-900 dark:text-neutral-100 mt-2 font-mono">
                {formatCurrency(stats.totalRevenue)}
              </h3>
            </div>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[10px] text-neutral-400 mt-3">
            Tổng số: <span className="font-bold text-neutral-700 dark:text-neutral-300">{stats.totalQuotes} phiếu báo giá</span>
          </div>
        </Card>

        {/* Applied Discounts given */}
        <Card className="relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Ưu đãi giảm giá đã hỗ trợ</p>
              <h3 className="text-xl font-extrabold text-rose-600 dark:text-rose-400 mt-2 font-mono">
                {formatCurrency(stats.totalDiscounts)}
              </h3>
            </div>
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[10px] text-neutral-400 mt-3">
            Tỷ lệ ưu đãi trung bình: <span className="font-bold text-rose-500">~6.8%</span>
          </div>
        </Card>

      </div>

      {/* 2. Charts Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Education level Distribution */}
        <Card className="flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-neutral-800 dark:text-neutral-200 text-sm mb-1 uppercase">
              Tỷ lệ phân bổ học sinh theo cấp học
            </h4>
            <p className="text-xs text-neutral-400 mb-6">
              Thể hiện mức độ quan tâm tuyển sinh giữa các khối Mầm non, Tiểu học, Trung học.
            </p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.levelChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.levelChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value} lượt tính`, 'Tỷ lệ tuyển sinh']}
                  contentStyle={{ backgroundColor: 'rgb(23, 23, 23)', color: '#fff', borderRadius: '8px' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Right: Payment Terms Preferred */}
        <Card className="flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-neutral-800 dark:text-neutral-200 text-sm mb-1 uppercase">
              Hình thức đóng học phí được lựa chọn
            </h4>
            <p className="text-xs text-neutral-400 mb-6">
              Giúp nhà quản lý đánh giá dòng tiền tài chính học bạ (Tháng, Quý, Học kỳ, Năm).
            </p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.termChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={0}
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {stats.termChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value} lượt đăng ký`, 'Hình thức đóng']}
                  contentStyle={{ backgroundColor: 'rgb(23, 23, 23)', color: '#fff', borderRadius: '8px' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

      </div>

      {/* 3. Bottom Wide Bar Chart: Top Fee Items Selected */}
      <Card>
        <div>
          <h4 className="font-bold text-neutral-800 dark:text-neutral-200 text-sm mb-1 uppercase">
            Các khoản thu được lựa chọn phổ biến nhất
          </h4>
          <p className="text-xs text-neutral-400 mb-6">
            Thống kê tần suất lựa chọn các gói dịch vụ bổ sung (Ăn bán trú, xe đưa đón, các CLB ngoại khóa).
          </p>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={stats.topItemsData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:hidden" />
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" className="hidden dark:block" />
              <XAxis dataKey="name" stroke="#a3a3a3" fontSize={11} tickLine={false} />
              <YAxis stroke="#a3a3a3" fontSize={11} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgb(23, 23, 23)', color: '#fff', borderRadius: '8px' }}
              />
              <Bar dataKey="Số lượng" fill="#10b981" radius={[4, 4, 0, 0]}>
                {stats.topItemsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#059669'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* 4. Active Features Fast access panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <Card className="flex flex-col justify-between hover:border-brand-orange/30 transition-all">
          <div>
            <div className="w-10 h-10 bg-brand-orange/10 text-brand-orange rounded-xl flex items-center justify-center font-bold mb-4">
              1
            </div>
            <h5 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 uppercase">
              Tính học phí tuyển sinh
            </h5>
            <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
              Tính toán biểu học phí thông minh dựa trên khối học, lớp học và cấu hình giảm giá tự động không cần lập trình.
            </p>
          </div>
          <button 
            onClick={() => setActiveTab('tuition-calc')}
            className="text-xs text-brand-orange font-bold flex items-center gap-1.5 hover:underline mt-4 text-left cursor-pointer"
          >
            <span>Kích hoạt ngay</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </Card>

        <Card className="flex flex-col justify-between hover:border-brand-orange/30 transition-all">
          <div>
            <div className="w-10 h-10 bg-sky-100 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 rounded-xl flex items-center justify-center font-bold mb-4">
              2
            </div>
            <h5 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 uppercase">
              Quản lý danh sách biểu phí
            </h5>
            <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
              Admin thêm mới, hiệu chỉnh đơn giá các khoản học phí, tiền ăn, phí bán trú cho từng cấp học và năm học riêng biệt.
            </p>
          </div>
          <button 
            onClick={() => {
              if (currentUser.role === 'admin') {
                setActiveTab('fee-items');
              } else {
                setActiveTab('quote-history');
              }
            }}
            className="text-xs text-brand-orange font-bold flex items-center gap-1.5 hover:underline mt-4 text-left cursor-pointer"
          >
            <span>{currentUser.role === 'admin' ? 'Cấu hình biểu phí' : 'Xem lịch sử tính phí'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </Card>

        <Card className="flex flex-col justify-between hover:border-brand-orange/30 transition-all">
          <div>
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center font-bold mb-4">
              3
            </div>
            <h5 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 uppercase">
              Sao lưu & Khôi phục
            </h5>
            <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
              Tránh mất mát thông tin tuyển sinh bằng cách sao lưu dự phòng cơ sở dữ liệu học phí dưới dạng tệp tin JSON nén.
            </p>
          </div>
          <button 
            onClick={() => {
              if (['admin', 'accountant'].includes(currentUser.role)) {
                setActiveTab('data-backup');
              } else {
                setActiveTab('quote-history');
              }
            }}
            className="text-xs text-brand-orange font-bold flex items-center gap-1.5 hover:underline mt-4 text-left cursor-pointer"
          >
            <span>{['admin', 'accountant'].includes(currentUser.role) ? 'Mở trang sao lưu' : 'Xem lịch sử tính phí'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </Card>

      </div>

    </div>
  );
}

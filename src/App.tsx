import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  History, 
  PieChart as PieChartIcon, 
  MessageSquare, 
  User, 
  Plus, 
  LogOut, 
  Moon, 
  Sun,
  TrendingUp,
  TrendingDown,
  Wallet,
  X,
  Send,
  Trash2,
  Search,
  Filter,
  ChevronRight,
  Utensils,
  Car,
  ShoppingBag,
  Receipt,
  Bell,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from 'recharts';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import Markdown from 'react-markdown';
import { useTheme } from './context/ThemeContext';
import { useAuth } from './context/AuthContext';
import { firebaseService } from './services/firebaseService';
import { getFinancialAdvice } from './services/aiService';
import { cn } from './lib/utils';

// --- Utils ---

const triggerHaptic = (pattern: number | number[] = 10) => {
  if (typeof window !== 'undefined' && window.navigator.vibrate) {
    window.navigator.vibrate(pattern);
  }
};

// --- Components ---

const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("infinite-card rounded-[24px] p-6", className)}>
    {children}
  </div>
);

const StickyHeader = ({ title }: { title?: string }) => {
  return (
    <div className="sticky top-0 z-50 w-full glass bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
          <Wallet size={18} className="text-white" />
        </div>
        <h1 className="text-xl font-bold tracking-tighter bg-gradient-to-br from-indigo-400 to-purple-500 bg-clip-text text-transparent">
          Expenso
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors">
          <Bell size={20} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
};

const getCategoryConfig = (category: string) => {
  switch (category) {
    case 'Food':
      return { icon: Utensils, color: "bg-orange-100 text-orange-600" };
    case 'Transport':
      return { icon: Car, color: "bg-blue-100 text-blue-600" };
    case 'Shopping':
      return { icon: ShoppingBag, color: "bg-purple-100 text-purple-600" };
    case 'Bills':
      return { icon: Receipt, color: "bg-rose-100 text-rose-600" };
    default:
      return { icon: Wallet, color: "bg-slate-100 text-slate-600" };
  }
};

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className,
  type = 'button',
  disabled = false
}: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  className?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
}) => {
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20",
    secondary: "bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100",
    danger: "bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20",
    ghost: "bg-transparent hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400"
  };

  return (
    <button 
      type={type}
      onClick={(e) => { triggerHaptic(); onClick?.(); }}
      disabled={disabled}
      className={cn(
        "px-6 py-3 rounded-2xl font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100",
        variants[variant],
        className
      )}
    >
      {children}
    </button>
  );
};

const Input = ({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  placeholder,
  required = false
}: { 
  label: string; 
  type?: string; 
  value: string | number; 
  onChange: (val: any) => void;
  placeholder?: string;
  required?: boolean;
}) => (
  <div className="space-y-1.5">
    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
    <input 
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
    />
  </div>
);

const Select = ({ 
  label, 
  options, 
  value, 
  onChange 
}: { 
  label: string; 
  options: { label: string; value: string }[]; 
  value: string; 
  onChange: (val: string) => void 
}) => (
  <div className="space-y-1.5">
    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
    <select 
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
    >
      {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
  </div>
);

// --- Pages ---

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await firebaseService.login(email, password);
      } else {
        await firebaseService.register(email, password);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] dark:bg-[#050505] p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="space-y-8 p-10">
          <div className="text-center space-y-3">
            <h1 className="text-4xl font-bold tracking-tighter text-slate-900 dark:text-white">Expenso</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
              {isLogin ? 'Welcome back to your financial space.' : 'Start your journey to financial clarity.'}
            </p>
          </div>

          {error && (
            <div className="p-4 bg-rose-500/10 text-rose-500 text-xs font-bold uppercase tracking-widest rounded-2xl border border-rose-500/20 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input label="Email" type="email" value={email} onChange={setEmail} placeholder="name@example.com" required />
            <Input label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" required />
            <Button type="submit" className="w-full py-4 text-lg">
              {isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <div className="text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs font-bold uppercase tracking-widest text-indigo-500 hover:text-indigo-600 transition-colors"
            >
              {isLogin ? "New here? Join Expenso" : "Already a member? Sign In"}
            </button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

const Dashboard = ({ transactions }: { transactions: any[] }) => {
  const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const expenses = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const balance = income - expenses;

  const categoryTotals = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc: any, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const topCategories = Object.entries(categoryTotals)
    .sort((a: any, b: any) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-8 pb-32">
      <div className="flex flex-col items-center justify-center py-8 space-y-1">
        <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">Available Balance</p>
        <h2 className="text-5xl font-bold dark:text-white tracking-tighter text-indigo-500">
          ${balance.toLocaleString()}
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-emerald-500/10 border border-emerald-500/20 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <ArrowUpRight size={20} />
            </div>
            <p className="text-emerald-500/80 text-[10px] font-bold uppercase tracking-widest">Income</p>
          </div>
          <h2 className="text-2xl font-bold text-emerald-500 tracking-tight">+${income.toLocaleString()}</h2>
        </Card>

        <Card className="bg-rose-500/10 border border-rose-500/20 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-rose-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
              <ArrowDownLeft size={20} />
            </div>
            <p className="text-rose-500/80 text-[10px] font-bold uppercase tracking-widest">Expenses</p>
          </div>
          <h2 className="text-2xl font-bold text-rose-500 tracking-tight">-${expenses.toLocaleString()}</h2>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 px-2">Financial Pulse</h3>
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 no-scrollbar">
          {topCategories.map(([category, amount]: any) => {
            const config = getCategoryConfig(category);
            return (
              <Card key={category} className="min-w-[140px] p-4 flex flex-col items-center text-center space-y-3 bg-white dark:bg-slate-900/50">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", config.color)}>
                  <config.icon size={22} strokeWidth={1.2} />
                </div>
                <div>
                  <p className="text-xs font-bold dark:text-white">{category}</p>
                  <p className="text-[10px] text-slate-500 font-medium">${amount.toLocaleString()}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center px-2">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Latest</h3>
          <button className="text-indigo-500 text-[10px] font-bold uppercase tracking-widest">View All</button>
        </div>
        <div className="space-y-3">
          {transactions.slice(0, 2).map((t) => {
            const config = getCategoryConfig(t.category);
            return (
              <motion.div 
                key={t.id} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 rounded-[24px] bg-white dark:bg-slate-900/50 border border-white/5 transition-all hover:scale-[1.01]"
              >
                <div className="flex items-center gap-4">
                  <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center", config.color)}>
                    <config.icon size={20} strokeWidth={1.2} />
                  </div>
                  <div>
                    <p className="font-bold text-sm dark:text-white">{t.category}</p>
                    <p className="text-[10px] text-slate-500">{format(parseISO(t.date), 'MMM dd')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn(
                    "font-bold text-sm tracking-tight",
                    t.type === 'income' ? "text-indigo-500" : "dark:text-white"
                  )}>
                    {t.type === 'income' ? '+' : ''}${t.amount.toLocaleString()}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const HistoryPage = ({ transactions, onDelete }: { transactions: any[], onDelete: (id: string) => void }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = transactions.filter(t => {
    const matchesSearch = t.category.toLowerCase().includes(search.toLowerCase()) || 
                         t.description?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || t.type === filter;
    return matchesSearch && matchesFilter;
  });

  const grouped = filtered.reduce((acc: any, t) => {
    const date = parseISO(t.date);
    let group = format(date, 'MMMM yyyy');
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) group = 'Today';
    else if (format(date, 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd')) group = 'Yesterday';

    if (!acc[group]) acc[group] = [];
    acc[group].push(t);
    return acc;
  }, {});

  return (
    <div className="space-y-6 pb-32">
      <div className="flex flex-col gap-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} strokeWidth={1.5} />
            <input 
              type="text" 
              placeholder="Search history..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900/50 border border-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white shadow-sm text-sm"
            />
          </div>
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-3 bg-white dark:bg-slate-900/50 border border-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white shadow-sm font-bold text-[10px] uppercase tracking-widest"
          >
            <option value="all">All</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
      </div>

      <div className="space-y-8">
        {Object.entries(grouped).map(([group, items]: any) => (
          <div key={group} className="space-y-3">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 px-2">{group}</h3>
            <div className="space-y-2">
              {items.map((t: any) => {
                const config = getCategoryConfig(t.category);
                return (
                  <div key={t.id} className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-900/30 border border-white/5 transition-all hover:bg-white/5 group">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", config.color)}>
                        <config.icon size={18} strokeWidth={1.2} />
                      </div>
                      <div>
                        <p className="font-bold text-xs dark:text-white">{t.category}</p>
                        {t.description && <p className="text-[10px] text-slate-500 truncate max-w-[120px]">{t.description}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className={cn(
                        "font-bold text-sm tracking-tight",
                        t.type === 'income' ? "text-indigo-500" : "dark:text-white"
                      )}>
                        {t.type === 'income' ? '+' : ''}${t.amount.toLocaleString()}
                      </p>
                      <button 
                        onClick={() => onDelete(t.id)}
                        className="p-1.5 text-slate-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={14} strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="py-20 text-center space-y-4">
            <div className="w-16 h-16 bg-slate-900/50 rounded-full flex items-center justify-center mx-auto text-slate-700">
              <Search size={32} strokeWidth={1} />
            </div>
            <p className="text-slate-500 text-xs font-medium">No records found</p>
          </div>
        )}
      </div>
    </div>
  );
};

const ReportsPage = ({ transactions }: { transactions: any[] }) => {
  // Monthly trends
  const monthlyData = transactions.reduce((acc: any, t) => {
    const month = format(parseISO(t.date), 'MMM');
    if (!acc[month]) acc[month] = { month, income: 0, expense: 0 };
    if (t.type === 'income') acc[month].income += t.amount;
    else acc[month].expense += t.amount;
    return acc;
  }, {});

  const barData = Object.values(monthlyData).reverse();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="space-y-10 pb-32">
      <div className={cn(
        "sticky top-0 z-30 -mx-6 px-6 py-6 transition-all duration-300",
        scrollY > 20 ? "bg-white/80 dark:bg-black/80 backdrop-blur-[25px] shadow-sm" : "bg-transparent"
      )}>
        <h2 className="text-3xl font-bold dark:text-white tracking-tight">Insights</h2>
      </div>
      
      <div className="grid grid-cols-1 gap-8">
        <Card className="h-[400px] rounded-[24px]">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6">Monthly Performance</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} stroke="#94a3b8" />
              <YAxis hide />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '16px', color: '#fff', fontSize: '12px' }}
              />
              <Bar dataKey="income" fill="#6366f1" radius={[10, 10, 10, 10]} barSize={20} />
              <Bar dataKey="expense" fill="#f43f5e" radius={[10, 10, 10, 10]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="rounded-[24px]">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6">Top Spending</h3>
            <div className="space-y-6">
              {Object.entries(
                transactions
                  .filter(t => t.type === 'expense')
                  .reduce((acc: any, t) => {
                    acc[t.category] = (acc[t.category] || 0) + t.amount;
                    return acc;
                  }, {})
              )
              .sort((a: any, b: any) => b[1] - a[1])
              .slice(0, 5)
              .map(([name, value]: any, i) => (
                <div key={name} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 font-bold text-xs">
                      0{i + 1}
                    </div>
                    <span className="font-bold dark:text-white">{name}</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white tracking-tight">${value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="rounded-[24px]">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6">Financial Health</h3>
            <div className="space-y-8">
              <div>
                <div className="flex justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Savings Rate</span>
                  <span className="text-lg font-bold dark:text-white">
                    {transactions.length > 0 ? Math.round(((transactions.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0) - transactions.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0)) / (transactions.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0) || 1)) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-3 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(0, Math.min(100, (transactions.length > 0 ? ((transactions.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0) - transactions.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0)) / (transactions.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0) || 1)) * 100 : 0)))}%` }}
                    className="bg-indigo-600 h-full rounded-full" 
                  />
                </div>
              </div>
              <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
                <p className="text-sm text-indigo-500 font-medium leading-relaxed">
                  "Your savings rate is the most important number in your financial life. Keep it above 20% to build wealth fast."
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const NumberHighlighter = ({ text }: { text: string }) => {
  const parts = text.split(/(\d+(?:\.\d+)?%?|\$\d+(?:\.\d+)?)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (/^(\d+(?:\.\d+)?%?|\$\d+(?:\.\d+)?)$/.test(part)) {
          return <span key={i} className="text-indigo-500 font-bold">{part}</span>;
        }
        return part;
      })}
    </>
  );
};

const SplashScreen = () => (
  <motion.div 
    initial={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.8, ease: "easeInOut" }}
    className="fixed inset-0 z-[100] bg-[#050505] flex flex-col items-center justify-center"
  >
    <div className="flex-1 flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: 1, 
          scale: 1,
        }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative"
      >
        <motion.h1 
          animate={{ 
            textShadow: [
              "0 0 20px rgba(99, 102, 241, 0)",
              "0 0 40px rgba(99, 102, 241, 0.4)",
              "0 0 20px rgba(99, 102, 241, 0)"
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-6xl font-bold tracking-tighter bg-gradient-to-br from-indigo-500 to-purple-600 bg-clip-text text-transparent"
        >
          Expenso
        </motion.h1>
        <motion.div 
          animate={{ 
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 1.05, 1]
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute inset-0 bg-indigo-500/10 blur-3xl -z-10 rounded-full"
        />
      </motion.div>
      
      <div className="mt-16 w-48 h-[2px] bg-slate-900 rounded-full overflow-hidden relative">
        <motion.div 
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 w-1/2 h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]"
        />
      </div>
    </div>

    <div className="pb-16 text-center">
      <motion.p 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-[10px] text-slate-500 uppercase tracking-[0.5em] font-bold"
      >
        Secure • Smart • Secret
      </motion.p>
    </div>
  </motion.div>
);

const TypewriterMarkdown = ({ content, isLast }: { content: string, isLast: boolean }) => {
  const [displayedContent, setDisplayedContent] = useState(isLast ? '' : content);
  
  useEffect(() => {
    if (!isLast) {
      setDisplayedContent(content);
      return;
    }
    
    let i = 0;
    const timer = setInterval(() => {
      setDisplayedContent(content.slice(0, i));
      i++;
      if (i > content.length) clearInterval(timer);
    }, 5);
    return () => clearInterval(timer);
  }, [content, isLast]);

  return (
    <Markdown components={{
      p: ({ children }) => (
        <p className="leading-relaxed">
          {React.Children.map(children, child => 
            typeof child === 'string' ? <NumberHighlighter text={child} /> : child
          )}
        </p>
      ),
      strong: ({ children }) => <strong className="text-indigo-400 font-bold">{children}</strong>,
      li: ({ children }) => (
        <li className="leading-relaxed">
          {React.Children.map(children, child => 
            typeof child === 'string' ? <NumberHighlighter text={child} /> : child
          )}
        </li>
      )
    }}>
      {displayedContent}
    </Markdown>
  );
};

const AiAssistant = ({ transactions, isOpen, onClose }: { transactions: any[], isOpen: boolean, onClose: () => void }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; content: string }[]>([
    { role: 'ai', content: "Hello! I'm your Expenso AI Assistant. Ask me anything about your finances!" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);
    const advice = await getFinancialAdvice(transactions, userMsg);
    setMessages(prev => [...prev, { role: 'ai', content: advice || "I'm sorry, I couldn't process that." }]);
    setIsTyping(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 h-[85vh] glass bg-[#050505]/95 rounded-t-[40px] z-50 flex flex-col overflow-hidden shadow-2xl border-t border-white/5"
          >
            <div className="w-12 h-1.5 bg-slate-800 rounded-full mx-auto mt-4 mb-2" />
            <div className="px-6 py-4 flex justify-between items-center border-b border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <MessageSquare size={18} className="text-white" />
                </div>
                <h2 className="text-lg font-bold text-white tracking-tight">AI Assistant</h2>
              </div>
              <button onClick={onClose} className="p-2 bg-white/5 rounded-full text-slate-400">
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>
            
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
              {messages.map((msg, i) => (
                <div key={i} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[85%] p-5 rounded-[28px] relative group",
                    msg.role === 'user' 
                      ? "bg-indigo-600 text-white rounded-tr-none" 
                      : "bg-white/5 text-slate-200 rounded-tl-none border border-white/5"
                  )}>
                    {msg.role === 'ai' && (
                      <div className="absolute -left-2 -top-2 w-4 h-4 bg-indigo-500 rounded-full blur-lg opacity-0 group-hover:opacity-50 transition-opacity" />
                    )}
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      {msg.role === 'ai' ? (
                        <TypewriterMarkdown content={msg.content} isLast={i === messages.length - 1} />
                      ) : (
                        <p className="leading-relaxed text-sm">{msg.content}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex flex-col items-start gap-3">
                  <div className="relative">
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 bg-indigo-500 rounded-full blur-xl" 
                    />
                    <div className="relative w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-indigo-500/40">
                      <MessageSquare size={18} strokeWidth={1.2} className="animate-bounce" />
                    </div>
                  </div>
                  <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.2em] animate-pulse">
                    Expenso is thinking...
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 pb-10 bg-[#050505] border-t border-white/5">
              <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-3">
                <input 
                  ref={inputRef}
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything..."
                  className="flex-1 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 text-white shadow-inner text-sm"
                />
                <button 
                  type="submit" 
                  disabled={isTyping}
                  className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/40 active:scale-90 transition-transform disabled:opacity-50"
                >
                  <Send size={22} strokeWidth={1.2} />
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-10 pb-32">
      <div className={cn(
        "sticky top-0 z-30 -mx-6 px-6 py-6 transition-all duration-300",
        scrollY > 20 ? "bg-white/80 dark:bg-black/80 backdrop-blur-[25px] shadow-sm" : "bg-transparent"
      )}>
        <h2 className="text-3xl font-bold dark:text-white tracking-tight">Settings</h2>
      </div>
      
      <Card className="flex flex-col items-center text-center py-12 rounded-[24px]">
        <div className="w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-500 mb-6 shadow-inner">
          <User size={48} strokeWidth={1} />
        </div>
        <h3 className="text-2xl font-bold dark:text-white tracking-tight">{user?.email}</h3>
        <p className="text-slate-400 text-sm font-medium mt-1 uppercase tracking-widest">Premium Member</p>
      </Card>

      <div className="space-y-4">
        <Card className="p-2 rounded-[24px]">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-100 dark:bg-slate-900 rounded-2xl flex items-center justify-center dark:text-white">
                {theme === 'dark' ? <Moon size={20} strokeWidth={1.2} /> : <Sun size={20} strokeWidth={1.2} />}
              </div>
              <div>
                <p className="font-bold dark:text-white">Dark Mode</p>
                <p className="text-xs text-slate-500">Switch to {theme === 'dark' ? 'light' : 'dark'} aesthetic</p>
              </div>
            </div>
            <button 
              onClick={() => { triggerHaptic(15); toggleTheme(); }}
              className={cn(
                "w-12 h-6 rounded-full transition-all relative",
                theme === 'dark' ? "bg-indigo-600" : "bg-slate-200"
              )}
            >
              <motion.div 
                animate={{ x: theme === 'dark' ? 24 : 4 }}
                className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm" 
              />
            </button>
          </div>

          <div className="h-px bg-slate-50 dark:bg-slate-800 mx-4" />

          <button 
            onClick={logout}
            className="w-full flex items-center justify-between p-4 text-rose-500 hover:bg-rose-500/5 rounded-2xl transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-rose-500/10 rounded-2xl flex items-center justify-center">
                <LogOut size={20} strokeWidth={1.2} />
              </div>
              <span className="font-bold">Sign Out</span>
            </div>
            <ChevronRight size={18} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
          </button>
        </Card>
      </div>

      <div className="text-center pt-10">
        <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold">Expenso v2.0.0 • Crafted with Care</p>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const { user, isLoading } = useAuth();
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);

  // Form state
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [type, setType] = useState('expense');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setIsSplashVisible(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  useEffect(() => {
    if (user) {
      loadTransactions();
    }
  }, [user]);

  const loadTransactions = async () => {
    if (!user) return;
    try {
      const data = await firebaseService.getTransactions(user.id);
      setTransactions(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await firebaseService.addTransaction(user.id, {
        amount: parseFloat(amount),
        category,
        type,
        date,
        description
      });
      setIsAddModalOpen(false);
      setAmount('');
      setDescription('');
      loadTransactions();
      triggerHaptic([10, 50, 10]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await firebaseService.deleteTransaction(id);
        loadTransactions();
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (isLoading || isSplashVisible) return (
    <AnimatePresence>
      {isSplashVisible && <SplashScreen key="splash" />}
    </AnimatePresence>
  );

  if (!user) return <AuthPage />;

  const tabs = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'history', label: 'Activity', icon: History },
    { id: 'add', label: 'Add', icon: Plus, special: true },
    { id: 'reports', label: 'Stats', icon: PieChartIcon },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#050505] flex flex-col">
      <StickyHeader />
      
      {/* Main Content */}
      <main className="flex-1 max-w-2xl mx-auto w-full p-6 md:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            {activeTab === 'dashboard' && <Dashboard transactions={transactions} />}
            {activeTab === 'history' && <HistoryPage transactions={transactions} onDelete={handleDelete} />}
            {activeTab === 'reports' && <ReportsPage transactions={transactions} />}
            {activeTab === 'profile' && <ProfilePage />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating AI Trigger */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsAiOpen(true)}
        className="fixed bottom-28 right-6 w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-indigo-500/40 z-40"
      >
        <MessageSquare size={24} strokeWidth={1.2} />
      </motion.button>

      {/* Bottom Tab Bar */}
      <nav className="fixed bottom-6 left-6 right-6 h-20 bg-white/80 dark:bg-black/80 backdrop-blur-[25px] rounded-[32px] flex items-center justify-around px-4 z-50 shadow-2xl border border-white/10">
        {tabs.map(tab => (
          tab.special ? (
            <button
              key={tab.id}
              onClick={() => setIsAddModalOpen(true)}
              className="w-16 h-16 -mt-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/40 active:scale-90 transition-transform"
            >
              <Plus size={32} strokeWidth={1.5} />
            </button>
          ) : (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex flex-col items-center gap-1 transition-all",
                activeTab === tab.id ? "text-indigo-500 scale-110" : "text-slate-400"
              )}
            >
              <tab.icon size={22} strokeWidth={1.2} />
              <span className="text-[10px] font-bold uppercase tracking-tighter">{tab.label}</span>
            </button>
          )
        ))}
      </nav>

      <AiAssistant transactions={transactions} isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />

      {/* Add Transaction Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-lg bg-white dark:bg-[#050505] rounded-t-[40px] sm:rounded-[40px] overflow-hidden shadow-2xl"
            >
              <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mt-4 mb-2 sm:hidden" />
              <div className="p-8 sm:p-10">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-3xl font-bold dark:text-white tracking-tight">New Entry</h2>
                  <button onClick={() => setIsAddModalOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-900 rounded-full transition-colors dark:text-white">
                    <X size={20} strokeWidth={1.2} />
                  </button>
                </div>

                <form onSubmit={handleAddTransaction} className="space-y-6">
                  <div className="flex p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl">
                    <button 
                      type="button"
                      onClick={() => setType('expense')}
                      className={cn(
                        "flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all",
                        type === 'expense' ? "bg-white dark:bg-slate-800 text-rose-500 shadow-sm" : "text-slate-400"
                      )}
                    >
                      Expense
                    </button>
                    <button 
                      type="button"
                      onClick={() => setType('income')}
                      className={cn(
                        "flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all",
                        type === 'income' ? "bg-white dark:bg-slate-800 text-emerald-500 shadow-sm" : "text-slate-400"
                      )}
                    >
                      Income
                    </button>
                  </div>

                  <div className="space-y-6">
                    <Input label="Amount" type="number" value={amount} onChange={setAmount} placeholder="0.00" required />
                    
                    <Select 
                      label="Category" 
                      value={category} 
                      onChange={setCategory} 
                      options={type === 'expense' ? [
                        { label: 'Food', value: 'Food' },
                        { label: 'Transport', value: 'Transport' },
                        { label: 'Shopping', value: 'Shopping' },
                        { label: 'Bills', value: 'Bills' },
                        { label: 'Entertainment', value: 'Entertainment' },
                        { label: 'Health', value: 'Health' },
                        { label: 'Other', value: 'Other' },
                      ] : [
                        { label: 'Salary', value: 'Salary' },
                        { label: 'Freelance', value: 'Freelance' },
                        { label: 'Investment', value: 'Investment' },
                        { label: 'Gift', value: 'Gift' },
                        { label: 'Other', value: 'Other' },
                      ]}
                    />

                    <Input label="Date" type="date" value={date} onChange={setDate} required />
                    <Input label="Description" value={description} onChange={setDescription} placeholder="Optional details..." />
                  </div>

                  <div className="pt-6 flex gap-4">
                    <Button type="submit" className="flex-1 py-4 text-lg">Save Transaction</Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

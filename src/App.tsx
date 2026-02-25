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
  ArrowDownLeft,
  AlertCircle,
  Zap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CreditCard,
  Settings as SettingsIcon,
  Shield,
  HelpCircle,
  Globe,
  DollarSign,
  Brain,
  Mic,
  Trash,
  Info,
  RefreshCw,
  Crown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  LineChart,
  Line,
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
import { 
  getFinancialAdvice, 
  getBudgetInsight 
} from './services/aiService';
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
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'gradient';
  className?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
}) => {
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20",
    gradient: "bg-gradient-to-r from-indigo-500 to-purple-600 hover:shadow-indigo-500/40 text-white shadow-lg shadow-indigo-500/30",
    secondary: "bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100",
    danger: "bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20",
    ghost: "bg-transparent hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400"
  };

  return (
    <motion.button 
      whileTap={{ scale: 0.96 }}
      type={type}
      onClick={(e) => { triggerHaptic(); onClick?.(); }}
      disabled={disabled}
      className={cn(
        "px-6 py-3 rounded-2xl font-semibold transition-all disabled:opacity-50",
        variants[variant],
        className
      )}
    >
      {children}
    </motion.button>
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

const TransactionItem = ({ 
  transaction, 
  onDelete, 
  deletingId 
}: { 
  transaction: any; 
  onDelete?: (id: string) => void; 
  deletingId?: string | null;
}) => {
  const config = getCategoryConfig(transaction.category);
  const isIncome = transaction.type === 'income';
  const isDeleting = deletingId === transaction.id;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex items-center justify-between p-4 rounded-[24px] bg-white dark:bg-slate-900/50 border border-white/5 transition-all hover:scale-[1.01] group relative overflow-hidden",
        isDeleting && "opacity-50 pointer-events-none scale-[0.98]"
      )}
    >
      <div className="flex items-center gap-4">
        <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center", config.color)}>
          <config.icon size={20} strokeWidth={1.2} />
        </div>
        <div>
          <p className="font-bold text-sm dark:text-white">{transaction.category}</p>
          <p className="text-[10px] text-slate-500">{format(parseISO(transaction.date), 'MMM dd')}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className={cn(
            "font-bold text-sm tracking-tight",
            isIncome ? "text-indigo-500" : "dark:text-white"
          )}>
            {isIncome ? '+' : ''}${transaction.amount.toLocaleString()}
          </p>
          {transaction.description && <p className="text-[10px] text-slate-400 uppercase tracking-widest text-right">{transaction.description}</p>}
        </div>
        {onDelete && (
          <button 
            onClick={() => onDelete(transaction.id)}
            className="p-1.5 text-rose-500/80 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0"
          >
            {isDeleting ? (
              <div className="w-3.5 h-3.5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Trash2 size={14} strokeWidth={1.5} />
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
};

// --- Pages ---

const FloatingInput = ({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  icon: Icon,
  required = false 
}: { 
  label: string; 
  type?: string; 
  value: string; 
  onChange: (val: string) => void;
  icon: any;
  required?: boolean;
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className="relative group">
      <div className={cn(
        "absolute left-4 top-1/2 -translate-y-1/2 transition-colors z-10",
        isFocused ? "text-indigo-500" : "text-slate-500"
      )}>
        <Icon size={20} strokeWidth={1.5} />
      </div>
      
      <input
        type={isPassword ? (showPassword ? 'text' : 'password') : type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        required={required}
        className={cn(
          "w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-[24px] outline-none transition-all text-white placeholder-transparent peer",
          isFocused && "border-indigo-500/50 ring-4 ring-indigo-500/10"
        )}
        placeholder={label}
      />
      
      <label className={cn(
        "absolute left-12 top-1/2 -translate-y-1/2 text-slate-500 transition-all pointer-events-none",
        (isFocused || value) && "-translate-y-8 text-xs text-indigo-500 font-bold"
      )}>
        {label}
      </label>

      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
        >
          {showPassword ? <EyeOff size={20} strokeWidth={1.5} /> : <Eye size={20} strokeWidth={1.5} />}
        </button>
      )}
    </div>
  );
};

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      if (isLogin) {
        await firebaseService.login(email, password);
      } else {
        await firebaseService.register(email, password);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError('Please enter your email first.');
      return;
    }
    try {
      await firebaseService.resetPassword(email);
      setError('Password reset email sent!');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] p-6 relative overflow-hidden">
      {/* Ambient Glow Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 blur-[120px] rounded-full" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-12">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-block"
          >
            <h1 className="text-5xl font-bold tracking-tighter text-white mb-2">Expenso</h1>
            <div className="h-1 w-12 bg-indigo-500 mx-auto rounded-full" />
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={isLogin ? 'login' : 'register'}
            initial={{ x: isLogin ? -20 : 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: isLogin ? 20 : -20, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            <Card className="space-y-8 p-10 bg-white/5 border-white/10 backdrop-blur-xl">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-white">
                  {isLogin ? 'Welcome back' : 'Create account'}
                </h2>
                <p className="text-slate-400 text-sm">
                  {isLogin ? 'Sign in to continue your journey.' : 'Start your journey to financial clarity.'}
                </p>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={cn(
                    "p-4 text-xs font-bold uppercase tracking-widest rounded-2xl border text-center",
                    error.includes('sent') 
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                      : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                  )}
                >
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <FloatingInput 
                  label="Email" 
                  type="email" 
                  value={email} 
                  onChange={setEmail} 
                  icon={Mail}
                  required 
                />
                <div className="space-y-2">
                  <FloatingInput 
                    label="Password" 
                    type="password" 
                    value={password} 
                    onChange={setPassword} 
                    icon={Lock}
                    required 
                  />
                  {isLogin && (
                    <div className="text-right">
                      <button 
                        type="button"
                        onClick={handleResetPassword}
                        className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-indigo-500 transition-colors"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  )}
                </div>

                <Button 
                  type="submit" 
                  variant="gradient" 
                  className="w-full py-4 text-lg"
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Get Started')}
                </Button>
              </form>

              <div className="text-center">
                <button 
                  onClick={() => { triggerHaptic(); setIsLogin(!isLogin); setError(''); }}
                  className="text-xs text-slate-400"
                >
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <span className="font-bold text-indigo-500 hover:text-indigo-400 transition-colors">
                    {isLogin ? 'Sign Up' : 'Sign In'}
                  </span>
                </button>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

const BudgetProgressBar = ({ current, total }: { current: number, total: number }) => {
  const percentage = Math.min(100, (current / total) * 100);
  const isOver = percentage >= 100;
  const isWarning = percentage >= 80 && percentage < 100;

  return (
    <Card className="p-6 rounded-[24px] bg-white dark:bg-slate-900/50 border border-white/5">
      <div className="flex justify-between items-end mb-4">
        <div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Weekly Budget</p>
          <h3 className="text-xl font-bold dark:text-white tracking-tight">
            ${current.toLocaleString()} <span className="text-slate-500 text-sm font-medium">/ ${total.toLocaleString()}</span>
          </h3>
        </div>
        <div className={cn(
          "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
          isOver ? "bg-rose-500/20 text-rose-500" : isWarning ? "bg-amber-500/20 text-amber-500" : "bg-indigo-500/20 text-indigo-500"
        )}>
          {isOver ? 'Over Limit' : isWarning ? 'Caution' : 'On Track'}
        </div>
      </div>
      <div className="relative h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ 
            width: `${percentage}%`,
            backgroundColor: isOver ? '#f43f5e' : isWarning ? '#f59e0b' : '#6366f1'
          }}
          transition={{ type: "spring", damping: 20, stiffness: 100 }}
          className={cn(
            "h-full rounded-full",
            isOver && "animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.5)]"
          )}
        />
      </div>
      <div className="flex justify-between mt-3">
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{Math.round(percentage)}% Used</p>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">${(total - current).toLocaleString()} Left</p>
      </div>
    </Card>
  );
};

const InsightChip = ({ insight }: { insight: string }) => {
  if (!insight) return null;
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-indigo-600/10 border border-indigo-500/20 p-4 rounded-2xl flex items-start gap-3 mb-6"
    >
      <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white shrink-0">
        <Zap size={16} fill="currentColor" />
      </div>
      <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 leading-relaxed">
        {insight}
      </p>
    </motion.div>
  );
};

const Dashboard = ({ transactions, weeklyBudget, budgetInsight }: { transactions: any[], weeklyBudget: number, budgetInsight: string }) => {
  const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const expenses = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const balance = income - expenses;

  // Calculate current week's spending
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  const weeklyExpenses = transactions
    .filter(t => t.type === 'expense' && new Date(t.date) >= startOfWeek)
    .reduce((acc, t) => acc + t.amount, 0);

  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return format(d, 'yyyy-MM-dd');
  });

  const incomeTrend = last7Days.map(date => ({
    amount: transactions
      .filter(t => t.type === 'income' && t.date === date)
      .reduce((acc, t) => acc + t.amount, 0)
  }));

  const expenseTrend = last7Days.map(date => ({
    amount: transactions
      .filter(t => t.type === 'expense' && t.date === date)
      .reduce((acc, t) => acc + t.amount, 0)
  }));

  return (
    <div className="space-y-8 pb-32">
      <InsightChip insight={budgetInsight} />

      <div className="flex flex-col items-center justify-center py-4 space-y-1">
        <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">Available Balance</p>
        <h2 className="text-5xl font-bold dark:text-white tracking-tighter text-indigo-500">
          ${balance.toLocaleString()}
        </h2>
      </div>

      <BudgetProgressBar current={weeklyExpenses} total={weeklyBudget} />

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
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 px-2">Weekly Trends</h3>
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 no-scrollbar">
          {/* Income Sparkline */}
          <Card className="min-w-[280px] p-5 bg-white dark:bg-slate-900/50 border border-white/5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Income Flow</p>
                <p className="text-lg font-bold dark:text-white mt-1">7-Day Trend</p>
              </div>
              <TrendingUp size={16} className="text-emerald-500" />
            </div>
            <div className="h-20 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={incomeTrend}>
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#10b981" 
                    strokeWidth={3} 
                    dot={false} 
                    animationDuration={2000}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Expense Sparkline */}
          <Card className="min-w-[280px] p-5 bg-white dark:bg-slate-900/50 border border-white/5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Expense Flow</p>
                <p className="text-lg font-bold dark:text-white mt-1">7-Day Trend</p>
              </div>
              <TrendingDown size={16} className="text-rose-500" />
            </div>
            <div className="h-20 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={expenseTrend}>
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#f43f5e" 
                    strokeWidth={3} 
                    dot={false} 
                    animationDuration={2000}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center px-2">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Latest</h3>
          <button className="text-indigo-500 text-[10px] font-bold uppercase tracking-widest">View All</button>
        </div>
        <div className="space-y-3">
          {transactions.slice(0, 2).map((t) => (
            <TransactionItem key={t.id} transaction={t} />
          ))}
        </div>
      </div>
    </div>
  );
};

const HistoryPage = ({ transactions, onDelete, deletingId }: { transactions: any[], onDelete: (id: string) => void, deletingId: string | null }) => {
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
              {items.map((t: any) => (
                <TransactionItem 
                  key={t.id} 
                  transaction={t} 
                  onDelete={onDelete} 
                  deletingId={deletingId} 
                />
              ))}
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

const TypewriterMarkdown = ({ content, isLast, onUpdate }: { content: string, isLast: boolean, onUpdate?: () => void }) => {
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
      onUpdate?.();
      if (i > content.length) {
        clearInterval(timer);
      }
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

const AiAssistant = ({ transactions, isOpen, onClose, weeklyBudget }: { transactions: any[], isOpen: boolean, onClose: () => void, weeklyBudget: number }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; content: string }[]>([
    { role: 'ai', content: "Hello! I'm your Expenso AI Assistant. Ask me anything about your finances or your budget!" }
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
    const advice = await getFinancialAdvice(transactions, userMsg, weeklyBudget);
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
                        <TypewriterMarkdown 
                          content={msg.content} 
                          isLast={i === messages.length - 1} 
                          onUpdate={scrollToBottom}
                        />
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

const ProfilePage = ({ transactions }: { transactions: any[] }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const expenses = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const savingsRate = income > 0 ? Math.round(((income - expenses) / income) * 100) : 0;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    triggerHaptic([10, 20, 10]);
    // Simulate sync
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsRefreshing(false);
  };

  const SettingGroup = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="space-y-3">
      <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 px-4">{title}</h3>
      <Card className="overflow-hidden rounded-[24px] bg-white/5 border-white/10 backdrop-blur-md">
        <div className="divide-y divide-white/5">
          {children}
        </div>
      </Card>
    </div>
  );

  const SettingRow = ({ 
    icon: Icon, 
    label, 
    value, 
    onClick, 
    color = "text-slate-400",
    isRed = false,
    rightContent
  }: { 
    icon: any, 
    label: string, 
    value?: string, 
    onClick?: () => void,
    color?: string,
    isRed?: boolean,
    rightContent?: React.ReactNode
  }) => (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={() => { triggerHaptic(5); onClick?.(); }}
      className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors text-left"
    >
      <div className="flex items-center gap-4">
        <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center bg-white/5", isRed ? "text-rose-500" : color)}>
          <Icon size={20} strokeWidth={1.5} />
        </div>
        <div>
          <p className={cn("text-sm font-bold", isRed ? "text-rose-500" : "text-white")}>{label}</p>
          {value && <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">{value}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {rightContent}
        <ChevronRight size={16} className="text-slate-600" />
      </div>
    </motion.button>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-10 pb-32">
      {/* Pull to Refresh Indicator */}
      <motion.div 
        animate={{ height: isRefreshing ? 60 : 0, opacity: isRefreshing ? 1 : 0 }}
        className="flex items-center justify-center overflow-hidden"
      >
        <RefreshCw size={20} className="text-indigo-500 animate-spin" />
      </motion.div>

      {/* Profile Header */}
      <div className="flex flex-col items-center text-center pt-8">
        <motion.div 
          drag="y"
          dragConstraints={{ top: 0, bottom: 100 }}
          onDragEnd={(_, info) => { if (info.offset.y > 50) handleRefresh(); }}
          className="relative group cursor-grab active:cursor-grabbing"
        >
          <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-indigo-500 to-purple-500">
            <div className="w-full h-full rounded-full bg-[#050505] flex items-center justify-center overflow-hidden">
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} 
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -bottom-1 -right-1 w-8 h-8 bg-indigo-600 rounded-full border-4 border-[#050505] flex items-center justify-center text-white"
          >
            <Crown size={14} fill="currentColor" />
          </motion.div>
        </motion.div>

        <div className="mt-6 space-y-2">
          <h3 className="text-2xl font-bold text-white tracking-tight">{user?.email}</h3>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full backdrop-blur-md">
            <Zap size={12} className="text-indigo-500" fill="currentColor" />
            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Premium Member</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-8 w-full mt-10 px-4">
          <div className="text-center space-y-1">
            <p className="text-xl font-bold text-white">{transactions.length}</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Transactions</p>
          </div>
          <div className="text-center space-y-1 border-x border-white/5">
            <p className="text-xl font-bold text-white">{savingsRate}%</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Savings Rate</p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-xl font-bold text-white">128</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">AI Queries</p>
          </div>
        </div>
      </div>

      {/* Settings Groups */}
      <div className="space-y-8 px-2">
        <SettingGroup title="Account">
          <SettingRow icon={SettingsIcon} label="Profile Details" value="Personal Information" />
          <SettingRow icon={CreditCard} label="Connected Bank" value="HDFC Bank •••• 4242" />
          <SettingRow icon={Crown} label="Subscription" value="Premium Plan • Active" color="text-amber-500" />
        </SettingGroup>

        <SettingGroup title="Preferences">
          <SettingRow 
            icon={theme === 'dark' ? Moon : Sun} 
            label="Dark Mode" 
            rightContent={
              <button 
                onClick={(e) => { e.stopPropagation(); triggerHaptic(15); toggleTheme(); }}
                className={cn(
                  "w-10 h-5 rounded-full transition-all relative",
                  theme === 'dark' ? "bg-indigo-600" : "bg-slate-700"
                )}
              >
                <motion.div 
                  animate={{ x: theme === 'dark' ? 22 : 2 }}
                  className="absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm" 
                />
              </button>
            }
          />
          <SettingRow icon={DollarSign} label="Currency" value="USD ($)" />
          <SettingRow icon={Globe} label="Language" value="English" />
        </SettingGroup>

        <SettingGroup title="AI Settings">
          <SettingRow icon={Brain} label="Thinking Level" value="High Reasoning" color="text-purple-500" />
          <SettingRow icon={Mic} label="AI Voice" value="Zephyr (Male)" />
          <SettingRow icon={Trash} label="Clear AI History" isRed />
        </SettingGroup>

        <SettingGroup title="Support & Legal">
          <SettingRow icon={HelpCircle} label="Help Center" />
          <SettingRow icon={Shield} label="Privacy Policy" />
          <SettingRow icon={Info} label="About Expenso" value="v2.4.0" />
        </SettingGroup>

        <div className="pt-4 space-y-2">
          <SettingRow icon={LogOut} label="Sign Out" isRed onClick={logout} />
          <SettingRow icon={Trash} label="Delete Account" isRed />
        </div>
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
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const [weeklyBudget, setWeeklyBudget] = useState(500);
  const [budgetInsight, setBudgetInsight] = useState('');

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
      
      // Fetch budget insight
      const insight = await getBudgetInsight(data, weeklyBudget);
      setBudgetInsight(insight);
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
    setTransactionToDelete(id);
    setIsDeleteModalOpen(true);
    triggerHaptic(10);
  };

  const confirmDelete = async () => {
    if (!transactionToDelete) return;
    
    const id = transactionToDelete;
    setIsDeleteModalOpen(false);
    setDeletingId(id);
    triggerHaptic([10, 30, 10]);

    try {
      await firebaseService.deleteTransaction(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
      setDeletingId(null);
      setTransactionToDelete(null);
    } catch (err) {
      console.error(err);
      setDeletingId(null);
      setTransactionToDelete(null);
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
            {activeTab === 'dashboard' && (
              <Dashboard 
                transactions={transactions} 
                weeklyBudget={weeklyBudget}
                budgetInsight={budgetInsight}
              />
            )}
            {activeTab === 'history' && (
              <HistoryPage 
                transactions={transactions} 
                onDelete={handleDelete} 
                deletingId={deletingId}
              />
            )}
            {activeTab === 'reports' && <ReportsPage transactions={transactions} />}
            {activeTab === 'profile' && <ProfilePage transactions={transactions} />}
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

      <AiAssistant 
        transactions={transactions} 
        isOpen={isAiOpen} 
        onClose={() => setIsAiOpen(false)} 
        weeklyBudget={weeklyBudget}
      />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-[#050505] border border-white/10 rounded-[32px] p-8 z-[101] shadow-2xl"
            >
              <div className="w-16 h-16 bg-rose-500/10 rounded-3xl flex items-center justify-center text-rose-500 mx-auto mb-6">
                <Trash2 size={32} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-2">Delete Transaction?</h3>
              <p className="text-slate-400 text-center text-sm mb-8 leading-relaxed">
                This action cannot be undone. This record will be permanently removed from your history.
              </p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={confirmDelete}
                  className="w-full py-4 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl transition-all active:scale-95"
                >
                  Delete Permanently
                </button>
                <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="w-full py-4 bg-white/5 hover:bg-white/10 text-slate-300 font-bold rounded-2xl transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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

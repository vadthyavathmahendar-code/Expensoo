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
  Crown,
  Edit2,
  Phone,
  Camera,
  Check,
  Cat,
  ShieldCheck,
  Ghost,
  Rocket,
  Star,
  Heart,
  Sparkles,
  BarChart3,
  Download,
  ShieldAlert
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
import { useSettings } from './context/SettingsContext';
import { firebaseService } from './services/firebaseService';
import { 
  getFinancialAdvice, 
  getBudgetInsight,
  getBudgetForecast,
  BudgetForecast
} from './services/aiService';
import { notificationService } from './services/notificationService';
import { cn, triggerHaptic } from './lib/utils';

// --- Components ---

const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const { isDark } = useTheme();
  return (
    <div className={cn(
      "infinite-card rounded-[24px] p-6 transition-all",
      isDark ? "bg-[#1e293b] border-white/5" : "bg-white border-slate-100 shadow-sm",
      className
    )}>
      {children}
    </div>
  );
};

const PrivacyMask = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  const { privacyMode } = useSettings();
  return (
    <div className={cn("relative", className)}>
      <div className={cn(
        "transition-all duration-300",
        privacyMode ? "blur-[12px] select-none pointer-events-none" : "blur-0"
      )}>
        {children}
      </div>
      {privacyMode && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-slate-400/20 rounded-full mx-0.5" />
          <div className="w-2 h-2 bg-slate-400/20 rounded-full mx-0.5" />
          <div className="w-2 h-2 bg-slate-400/20 rounded-full mx-0.5" />
        </div>
      )}
    </div>
  );
};

const PinCodeOverlay = ({ onUnlock }: { onUnlock: () => void }) => {
  const { pinCode, isDark } = useSettings() as any; // Cast as any to avoid TS errors for now
  const { colors } = useTheme();
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  const handleKeypad = (num: string) => {
    triggerHaptic(5);
    if (input.length < 4) {
      const nextInput = input + num;
      setInput(nextInput);
      if (nextInput.length === 4) {
        if (nextInput === pinCode) {
          triggerHaptic([10, 50, 10]);
          onUnlock();
        } else {
          triggerHaptic([50, 50, 50]);
          setError(true);
          setTimeout(() => {
            setInput('');
            setError(false);
          }, 500);
        }
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center p-8"
      style={{ backgroundColor: colors.bg }}
    >
      <div className="mb-12 text-center">
        <div className="w-20 h-20 bg-primary/10 rounded-[32px] flex items-center justify-center text-primary mx-auto mb-6">
          <Lock size={40} strokeWidth={1.5} />
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight mb-2">Security Lock</h2>
        <p className="text-slate-500 text-sm">Enter your 4-digit PIN to continue</p>
      </div>

      <div className="flex gap-4 mb-16">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            animate={error ? { x: [0, -10, 10, -10, 10, 0] } : {}}
            className={cn(
              "w-4 h-4 rounded-full border-2 transition-all duration-300",
              input.length > i 
                ? "bg-primary border-primary scale-125" 
                : "bg-transparent border-slate-700"
            )}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6 max-w-xs w-full">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'].map((key, i) => (
          key === '' ? <div key={i} /> : (
            <motion.button
              key={i}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                if (key === 'del') {
                  setInput(prev => prev.slice(0, -1));
                } else {
                  handleKeypad(key);
                }
              }}
              className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold transition-colors",
                key === 'del' ? "text-slate-500" : "bg-white/5 text-white hover:bg-white/10"
              )}
            >
              {key === 'del' ? <X size={20} /> : key}
            </motion.button>
          )
        ))}
      </div>
    </motion.div>
  );
};

const StickyHeader = ({ title, hasUnreadNotifications }: { title?: string, hasUnreadNotifications?: boolean }) => {
  const { isDark } = useTheme();
  const { privacyMode, setPrivacyMode } = useSettings();
  return (
    <div className={cn(
      "sticky top-0 z-50 w-full glass backdrop-blur-xl border-b px-6 py-4 flex items-center justify-between transition-colors",
      isDark ? "bg-[#050505]/80 border-white/5" : "bg-white/80 border-slate-100"
    )}>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center">
          <Wallet size={18} className="text-white" />
        </div>
        <h1 className="text-xl font-bold tracking-tighter bg-gradient-to-br from-primary to-purple-500 bg-clip-text text-transparent">
          Expenso
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={() => { triggerHaptic(5); setPrivacyMode(!privacyMode); }}
          className={cn(
            "p-2 rounded-full transition-colors",
            isDark ? "bg-white/5 text-slate-400 hover:text-white" : "bg-slate-100 text-slate-500 hover:text-slate-900"
          )}
        >
          {privacyMode ? <EyeOff size={20} strokeWidth={1.5} /> : <Eye size={20} strokeWidth={1.5} />}
        </button>
        <button className={cn(
          "p-2 rounded-full transition-colors relative",
          isDark ? "bg-white/5 text-slate-400 hover:text-white" : "bg-slate-100 text-slate-500 hover:text-slate-900"
        )}>
          <Bell size={20} strokeWidth={1.5} />
          {hasUnreadNotifications && (
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-white dark:border-[#050505]" />
          )}
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
    primary: "bg-primary hover:bg-primary/80 text-white shadow-lg shadow-primary/20",
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
}) => {
  const { colors } = useTheme();
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
      <input 
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        style={{ backgroundColor: colors.inputBg }}
        className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white text-slate-900"
      />
    </div>
  );
};

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
}) => {
  const { colors } = useTheme();
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
      <select 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ backgroundColor: colors.inputBg }}
        className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white text-slate-900"
      >
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </div>
  );
};

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
  const { formatAmount } = useSettings();
  const { isDark } = useTheme();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex items-center justify-between p-4 rounded-[24px] transition-all hover:scale-[1.01] group relative overflow-hidden border",
        isDark ? "bg-slate-900/50 border-white/5" : "bg-white border-slate-100 shadow-sm",
        isDeleting && "opacity-50 pointer-events-none scale-[0.98]"
      )}
    >
      <div className="flex items-center gap-4">
        <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center", config.color)}>
          <config.icon size={20} strokeWidth={1.2} />
        </div>
        <div>
          <p className="font-bold text-sm dark:text-white text-slate-900">{transaction.category}</p>
          <p className="text-[10px] text-slate-500">{format(parseISO(transaction.date), 'MMM dd')}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className={cn(
            "font-bold text-sm tracking-tight",
            isIncome ? "text-indigo-500" : "text-rose-500"
          )}>
            {isIncome ? '+' : ''}{formatAmount(transaction.amount)}
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
  const { isDark, colors } = useTheme();

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
        style={{ backgroundColor: colors.inputBg }}
        className={cn(
          "w-full pl-12 pr-12 py-4 border rounded-[24px] outline-none transition-all placeholder-transparent peer",
          isDark ? "border-white/10 text-white" : "border-slate-200 text-slate-900",
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
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-indigo-500 transition-colors"
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
  const { isDark, colors } = useTheme();

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
    <div 
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden transition-colors"
      style={{ backgroundColor: colors.bg }}
    >
      {/* Ambient Glow Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full" />
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
            <h1 className={cn(
              "text-5xl font-bold tracking-tighter mb-2",
              isDark ? "text-white" : "text-slate-900"
            )}>Expenso</h1>
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
            <Card className={cn(
              "space-y-8 p-10 backdrop-blur-xl",
              isDark ? "bg-white/5 border-white/10" : "bg-white/80 border-slate-100"
            )}>
              <div className="text-center space-y-2">
                <h2 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>
                  {isLogin ? 'Welcome back' : 'Create account'}
                </h2>
                <p className="text-slate-500 text-sm">
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
  const { formatAmount } = useSettings();
  const { isDark } = useTheme();

  return (
    <Card className={cn(
      "p-6 rounded-[24px] transition-all",
      isDark ? "bg-slate-900/50 border-white/5" : "bg-white border-slate-100 shadow-sm"
    )}>
      <div className="flex justify-between items-end mb-4">
        <div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Weekly Budget</p>
          <PrivacyMask>
            <h3 className="text-xl font-bold dark:text-white text-slate-900 tracking-tight">
              {formatAmount(current)} <span className="text-slate-500 text-sm font-medium">/ {formatAmount(total)}</span>
            </h3>
          </PrivacyMask>
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
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{formatAmount(total - current)} Left</p>
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
      className="bg-primary/10 border border-primary/20 p-4 rounded-2xl flex items-start gap-3 mb-6"
    >
      <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center text-white shrink-0">
        <Zap size={16} fill="currentColor" />
      </div>
      <p className="text-xs font-medium text-primary leading-relaxed">
        {insight}
      </p>
    </motion.div>
  );
};

const Dashboard = ({ transactions, weeklyBudget, budgetInsight }: { transactions: any[], weeklyBudget: number, budgetInsight: string }) => {
  const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const expenses = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const balance = income - expenses;
  const { formatAmount } = useSettings();
  const { isDark } = useTheme();

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
        <PrivacyMask>
          <h2 className={cn(
            "text-5xl font-bold tracking-tighter text-primary",
            isDark ? "dark:text-white" : "text-primary"
          )}>
            {formatAmount(balance)}
          </h2>
        </PrivacyMask>
      </div>

      <BudgetProgressBar current={weeklyExpenses} total={weeklyBudget} />

      <div className="grid grid-cols-2 gap-4">
        <Card className={cn(
          "p-5 transition-all",
          isDark ? "bg-emerald-500/10 border-emerald-500/20" : "bg-emerald-50 border-emerald-100"
        )}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <ArrowUpRight size={20} />
            </div>
            <p className="text-emerald-500/80 text-[10px] font-bold uppercase tracking-widest">Income</p>
          </div>
          <PrivacyMask>
            <h2 className="text-2xl font-bold text-emerald-500 tracking-tight">+{formatAmount(income)}</h2>
          </PrivacyMask>
        </Card>

        <Card className={cn(
          "p-5 transition-all",
          isDark ? "bg-rose-500/10 border-rose-500/20" : "bg-rose-50 border-rose-100"
        )}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-rose-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
              <ArrowDownLeft size={20} />
            </div>
            <p className="text-rose-500/80 text-[10px] font-bold uppercase tracking-widest">Expenses</p>
          </div>
          <PrivacyMask>
            <h2 className="text-2xl font-bold text-rose-500 tracking-tight">-{formatAmount(expenses)}</h2>
          </PrivacyMask>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 px-2">Weekly Trends</h3>
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 no-scrollbar">
          {/* Income Sparkline */}
          <Card className="min-w-[280px] p-5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Income Flow</p>
                <p className="text-lg font-bold dark:text-white text-slate-900 mt-1">7-Day Trend</p>
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
          <Card className="min-w-[280px] p-5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Expense Flow</p>
                <p className="text-lg font-bold dark:text-white text-slate-900 mt-1">7-Day Trend</p>
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
  const { isDark } = useTheme();

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
              className={cn(
                "w-full pl-10 pr-4 py-3 border rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm",
                isDark ? "bg-slate-900/50 border-white/5 text-white" : "bg-white border-slate-100 text-slate-900 shadow-sm"
              )}
            />
          </div>
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className={cn(
              "px-3 py-3 border rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-[10px] uppercase tracking-widest",
              isDark ? "bg-slate-900/50 border-white/5 text-white" : "bg-white border-slate-100 text-slate-900 shadow-sm"
            )}
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

const BudgetForecastSection = ({ transactions, weeklyBudget }: { transactions: any[], weeklyBudget: number }) => {
  const [forecast, setForecast] = useState<BudgetForecast | null>(null);
  const [loading, setLoading] = useState(false);
  const { formatAmount, currency } = useSettings();
  const { isDark } = useTheme();

  const fetchForecast = async () => {
    setLoading(true);
    const data = await getBudgetForecast(transactions, weeklyBudget, currency);
    setForecast(data);
    setLoading(false);
  };

  useEffect(() => {
    if (transactions.length > 0 && !forecast) {
      fetchForecast();
    }
  }, [transactions.length > 0]);

  if (loading) {
    return (
      <Card className="p-8 flex flex-col items-center justify-center space-y-4 min-h-[200px]">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-bold text-indigo-500 uppercase tracking-widest animate-pulse">Analyzing patterns...</p>
      </Card>
    );
  }

  if (!forecast) return null;

  return (
    <Card className="overflow-hidden border-indigo-500/20">
      <div className="bg-gradient-to-r from-primary to-purple-600 p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">AI Budget Forecast</h3>
              <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Next 7 Days Prediction</p>
            </div>
          </div>
          <button 
            onClick={fetchForecast}
            disabled={loading}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all disabled:opacity-50"
            title="Refresh Forecast"
          >
            <RefreshCw size={16} className={cn(loading && "animate-spin")} />
          </button>
        </div>
        <div className="text-right">
          <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">Confidence</p>
          <div className="flex items-center gap-2">
            <div className="w-16 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white" 
                style={{ width: `${forecast.confidence * 100}%` }} 
              />
            </div>
            <span className="text-xs font-bold text-white">{Math.round(forecast.confidence * 100)}%</span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Predicted Spending</p>
            <h4 className={cn("text-3xl font-bold tracking-tighter", isDark ? "text-white" : "text-slate-900")}>
              {formatAmount(forecast.predictedTotal)}
            </h4>
          </div>
          <div className={cn(
            "px-4 py-2 rounded-2xl font-bold text-xs uppercase tracking-widest",
            forecast.predictedTotal > weeklyBudget ? "bg-rose-500/10 text-rose-500" : "bg-emerald-500/10 text-emerald-500"
          )}>
            {forecast.predictedTotal > weeklyBudget ? 'Over Budget' : 'Under Budget'}
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Top Predicted Categories</p>
          <div className="grid grid-cols-1 gap-3">
            {forecast.topPredictedCategories.map((cat, i) => (
              <div key={i} className={cn(
                "flex items-center justify-between p-4 rounded-2xl border",
                isDark ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-100"
              )}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500 font-bold text-[10px]">
                    0{i + 1}
                  </div>
                  <span className={cn("font-bold text-sm", isDark ? "text-white" : "text-slate-900")}>{cat.category}</span>
                </div>
                <span className={cn("font-bold text-sm", isDark ? "text-white" : "text-slate-900")}>{formatAmount(cat.predictedAmount)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Actionable Insights</p>
          <div className="space-y-3">
            {forecast.insights.map((insight, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check size={12} className="text-white" />
                </div>
                <p className={cn("text-sm leading-relaxed", isDark ? "text-slate-400" : "text-slate-600")}>{insight}</p>
              </div>
            ))}
          </div>
        </div>

        <button 
          onClick={fetchForecast}
          className={cn(
            "w-full py-4 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95",
            isDark ? "bg-white/5 text-slate-400 hover:bg-white/10" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          )}
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh Forecast
        </button>
      </div>
    </Card>
  );
};

const RecurringTracker = ({ transactions }: { transactions: any[] }) => {
  const { formatAmount } = useSettings();
  const { isDark } = useTheme();
  
  // Detect recurring transactions (same amount and category within 35 days)
  const expenses = transactions.filter(t => t.type === 'expense');
  const recurring = expenses.reduce((acc: any[], t, i) => {
    const match = expenses.slice(i + 1).find(m => 
      m.category === t.category && 
      Math.abs(m.amount - t.amount) < 1 &&
      m.description === t.description
    );
    if (match && !acc.find(r => r.description === t.description)) {
      acc.push(t);
    }
    return acc;
  }, []);

  if (recurring.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">Active Subscriptions</h3>
        <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">{recurring.length} Detected</span>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {recurring.map((sub, i) => (
          <Card key={i} className={cn("p-4 flex items-center justify-between", isDark ? "bg-white/5 border-white/10" : "bg-white border-slate-100 shadow-sm")}>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <RefreshCw size={20} strokeWidth={1.5} />
              </div>
              <div>
                <p className={cn("text-sm font-bold", isDark ? "text-white" : "text-slate-900")}>{sub.description}</p>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">{sub.category}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={cn("text-sm font-bold", isDark ? "text-white" : "text-slate-900")}>{formatAmount(sub.amount)}</p>
              <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Monthly</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const ReportsPage = ({ transactions, weeklyBudget }: { transactions: any[], weeklyBudget: number }) => {
  const { formatAmount } = useSettings();
  const { isDark } = useTheme();
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
        <BudgetForecastSection transactions={transactions} weeklyBudget={weeklyBudget} />
        <RecurringTracker transactions={transactions} />

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
                  <span className="font-bold text-slate-900 dark:text-white tracking-tight">{formatAmount(value)}</span>
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
                    className="bg-primary h-full rounded-full" 
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
  const { currency } = useSettings();
  const symbol = currency === 'INR' ? '₹' : '$';
  const parts = text.split(new RegExp(`(\\d+(?:\\.\\d+)?%?|\\${symbol}\\d+(?:\\.\\d+)?)`, 'g'));
  return (
    <>
      {parts.map((part, i) => {
        if (new RegExp(`^(\\d+(?:\\.\\d+)?%?|\\${symbol}\\d+(?:\\.\\d+)?)$`).test(part)) {
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
  const { isDark } = useTheme();
  const { aiPersonality, currency } = useSettings();

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
    triggerHaptic(5);
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);
    const advice = await getFinancialAdvice(transactions, userMsg, weeklyBudget, aiPersonality, currency);
    setMessages(prev => [...prev, { role: 'ai', content: advice || "I'm sorry, I couldn't process that." }]);
    setIsTyping(false);
    triggerHaptic([10, 30, 10]);
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
            className={cn(
              "fixed bottom-0 left-0 right-0 h-[85vh] glass rounded-t-[40px] z-50 flex flex-col overflow-hidden shadow-2xl border-t transition-colors",
              isDark ? "bg-[#050505]/95 border-white/5" : "bg-white/95 border-slate-200"
            )}
          >
            <div className="w-12 h-1.5 bg-slate-800 rounded-full mx-auto mt-4 mb-2" />
            <div className={cn("px-6 py-4 flex justify-between items-center border-b", isDark ? "border-white/5" : "border-slate-100")}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <MessageSquare size={18} className="text-white" />
                </div>
                <h2 className={cn("text-lg font-bold tracking-tight", isDark ? "text-white" : "text-slate-900")}>AI Assistant</h2>
              </div>
              <button onClick={onClose} className={cn("p-2 rounded-full", isDark ? "bg-white/5 text-slate-400" : "bg-slate-100 text-slate-500")}>
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>
            
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
              {messages.map((msg, i) => (
                <div key={i} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[85%] p-5 rounded-[28px] relative group",
                    msg.role === 'user' 
                      ? "bg-primary text-white rounded-tr-none" 
                      : (isDark ? "bg-white/5 text-slate-200 rounded-tl-none border border-white/5" : "bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200")
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
                    <div className="relative w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white shadow-lg shadow-primary/40">
                      <MessageSquare size={18} strokeWidth={1.2} className="animate-bounce" />
                    </div>
                  </div>
                  <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.2em] animate-pulse">
                    Expenso is thinking...
                  </p>
                </div>
              )}
            </div>

            <div className={cn("p-6 pb-10 border-t transition-colors", isDark ? "bg-[#050505] border-white/5" : "bg-white border-slate-100")}>
              <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-3">
                <input 
                  ref={inputRef}
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything..."
                  className={cn(
                    "flex-1 px-6 py-4 border rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner text-sm transition-all",
                    isDark ? "bg-white/5 border-white/10 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                  )}
                />
                <button 
                  type="submit" 
                  disabled={isTyping}
                  className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/40 active:scale-90 transition-transform disabled:opacity-50"
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
  const { theme, toggleTheme, isDark, colors } = useTheme();
  const { 
    currency, 
    setCurrency, 
    weeklyBudget, 
    setWeeklyBudget, 
    formatAmount,
    securityLockEnabled,
    setSecurityLockEnabled,
    pinCode,
    setPinCode,
    accentColor,
    setAccentColor,
    aiPersonality,
    setAiPersonality
  } = useSettings();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [tempBudget, setTempBudget] = useState(weeklyBudget.toString());
  const [tempPin, setTempPin] = useState(pinCode);
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    notificationService.getPermissionStatus() === 'granted' || notificationService.isFallbackEnabled()
  );
  const [profile, setProfile] = useState({
    displayName: '',
    phoneNumber: '',
    bio: '',
    avatar: ''
  });
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const handleToggleNotifications = async () => {
    if (!notificationsEnabled) {
      // Try native first
      if (typeof window !== 'undefined' && 'Notification' in window) {
        const granted = await notificationService.requestPermission();
        if (granted) {
          setNotificationsEnabled(true);
          notificationService.setFallbackEnabled(false);
          if (user) {
            await firebaseService.updatePushToken(user.id, 'web-push-token-' + Math.random().toString(36).substr(2, 9));
          }
          return;
        }
      }

      // If native fails or is not supported, enable fallback
      notificationService.setFallbackEnabled(true);
      setNotificationsEnabled(true);
      alert('Native browser notifications are unavailable in this environment. Expenso will use in-app alerts instead.');
      triggerHaptic(20);
    } else {
      setNotificationsEnabled(false);
      notificationService.setFallbackEnabled(false);
    }
  };

  const loadProfile = async () => {
    if (!user) return;
    try {
      const data = await firebaseService.getUserProfile(user.id);
      if (data) {
        setProfile({
          displayName: data.displayName || '',
          phoneNumber: data.phoneNumber || '',
          bio: data.bio || '',
          avatar: data.avatar || ''
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSavingProfile(true);
    try {
      await firebaseService.updateUserProfile(user.id, profile);
      setIsEditing(false);
      triggerHaptic([10, 30, 10]);
      alert('Profile updated successfully!');
    } catch (err: any) {
      console.error(err);
      alert('Failed to update profile: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAvatarSelect = async (avatarName: string) => {
    if (!user) return;
    try {
      setProfile(prev => ({ ...prev, avatar: avatarName }));
      await firebaseService.updateUserProfile(user.id, { avatar: avatarName });
      setIsAvatarModalOpen(false);
      triggerHaptic(20);
    } catch (err) {
      console.error(err);
    }
  };

  const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const expenses = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const savingsRate = income > 0 ? Math.round(((income - expenses) / income) * 100) : 0;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    triggerHaptic([10, 20, 10]);
    await loadProfile();
    setIsRefreshing(false);
  };

  const handleExportData = () => {
    triggerHaptic([10, 50, 10]);
    const headers = ['Date', 'Description', 'Category', 'Type', 'Amount'];
    const csvContent = [
      headers.join(','),
      ...transactions.map(t => [
        t.date,
        `"${t.description.replace(/"/g, '""')}"`,
        t.category,
        t.type,
        t.amount
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `expenso_export_${format(new Date(), 'yyyy_MM_dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const avatars = [
    { name: 'User', icon: User, color: 'text-indigo-500' },
    { name: 'Cat', icon: Cat, color: 'text-orange-500' },
    { name: 'Zap', icon: Zap, color: 'text-yellow-500' },
    { name: 'Shield', icon: ShieldCheck, color: 'text-emerald-500' },
    { name: 'Ghost', icon: Ghost, color: 'text-purple-500' },
    { name: 'Rocket', icon: Rocket, color: 'text-blue-500' },
    { name: 'Star', icon: Star, color: 'text-amber-500' },
    { name: 'Heart', icon: Heart, color: 'text-rose-500' },
  ];

  const CurrentAvatarIcon = avatars.find(a => a.name === profile.avatar)?.icon || User;

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
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={() => { triggerHaptic(5); onClick?.(); }}
      className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors text-left cursor-pointer"
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
    </motion.div>
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
        <div className="relative">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAvatarModalOpen(true)}
            className="relative group"
          >
            <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-indigo-500 to-purple-500">
              <div className="w-full h-full rounded-full bg-[#050505] flex items-center justify-center overflow-hidden">
                <CurrentAvatarIcon size={56} strokeWidth={1} className="text-white" />
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={24} className="text-white" />
            </div>
          </motion.button>
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-full border-4 border-[#050505] flex items-center justify-center text-white"
          >
            <Crown size={14} fill="currentColor" />
          </motion.div>
        </div>

        <div className="mt-6 space-y-2 w-full px-6">
          {isEditing ? (
            <div className="space-y-4 max-w-sm mx-auto">
              <input 
                type="text"
                value={profile.displayName}
                onChange={(e) => setProfile(prev => ({ ...prev, displayName: e.target.value }))}
                placeholder="Display Name"
                className={cn(
                  "w-full bg-white/5 border rounded-2xl px-4 py-3 text-white text-center outline-none transition-all",
                  isDark ? "border-primary/30 focus:border-primary" : "border-slate-200 focus:border-primary"
                )}
              />
              <input 
                type="text"
                value={profile.phoneNumber}
                onChange={(e) => setProfile(prev => ({ ...prev, phoneNumber: e.target.value }))}
                placeholder="Phone Number"
                className={cn(
                  "w-full bg-white/5 border rounded-2xl px-4 py-3 text-white text-center outline-none transition-all",
                  isDark ? "border-primary/30 focus:border-primary" : "border-slate-200 focus:border-primary"
                )}
              />
              <textarea 
                value={profile.bio}
                onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Add a short bio..."
                className={cn(
                  "w-full bg-white/5 border rounded-2xl px-4 py-3 text-white text-center outline-none transition-all resize-none h-20",
                  isDark ? "border-primary/30 focus:border-primary" : "border-slate-200 focus:border-primary"
                )}
              />
                <div className="flex gap-3">
                  <Button variant="ghost" className="flex-1" onClick={() => setIsEditing(false)} disabled={isSavingProfile}>Cancel</Button>
                  <Button variant="gradient" className="flex-1" onClick={handleSaveProfile} disabled={isSavingProfile}>
                    {isSavingProfile ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
            </div>
          ) : (
            <>
              <h3 className="text-2xl font-bold text-white tracking-tight">
                {profile.displayName || user?.email?.split('@')[0]}
              </h3>
              {profile.bio && <p className="text-slate-400 text-sm max-w-xs mx-auto">{profile.bio}</p>}
              <div className="flex flex-col items-center justify-center gap-4 pt-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full backdrop-blur-md">
                  <Zap size={12} className="text-primary" fill="currentColor" />
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Premium Member</span>
                </div>
                <button 
                  onClick={() => { triggerHaptic(10); setIsEditing(true); }}
                  className={cn(
                    "flex items-center gap-2 px-6 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all active:scale-95",
                    isDark ? "bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5" : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200"
                  )}
                >
                  <Edit2 size={14} />
                  Edit Profile
                </button>
              </div>
            </>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-8 w-full mt-10 px-4">
          <div className="text-center space-y-1">
            <p className={cn("text-xl font-bold", isDark ? "text-white" : "text-slate-900")}>{transactions.length}</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Transactions</p>
          </div>
          <div className={cn("text-center space-y-1 border-x", isDark ? "border-white/5" : "border-slate-100")}>
            <PrivacyMask>
              <p className={cn("text-xl font-bold", isDark ? "text-white" : "text-slate-900")}>{formatAmount(income - expenses)}</p>
            </PrivacyMask>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Net Worth</p>
          </div>
          <div className="text-center space-y-1">
            <p className={cn("text-xl font-bold", isDark ? "text-white" : "text-slate-900")}>{savingsRate}%</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Savings Rate</p>
          </div>
        </div>
      </div>

      {/* Settings Groups */}
      <div className="space-y-8 px-2">
        <SettingGroup title="Account">
          <SettingRow 
            icon={SettingsIcon} 
            label="Profile Details" 
            value={profile.phoneNumber || "Add phone number"} 
            onClick={() => setIsEditing(true)}
          />
          <SettingRow icon={CreditCard} label="Connected Bank" value="HDFC Bank •••• 4242" />
          <SettingRow icon={Crown} label="Subscription" value="Premium Plan • Active" color="text-amber-500" />
          <SettingRow icon={Download} label="Export Data" value="CSV Format" onClick={handleExportData} />
        </SettingGroup>

        <SettingGroup title="Security">
          <SettingRow 
            icon={Lock} 
            label="Security Lock" 
            value={securityLockEnabled ? "Enabled" : "Disabled"}
            rightContent={
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  triggerHaptic(15); 
                  if (!securityLockEnabled && !pinCode) {
                    setIsPinModalOpen(true);
                  } else {
                    setSecurityLockEnabled(!securityLockEnabled);
                  }
                }}
                className={cn(
                  "w-10 h-5 rounded-full transition-all relative",
                  securityLockEnabled ? "bg-primary" : "bg-slate-700"
                )}
              >
                <motion.div 
                  animate={{ x: securityLockEnabled ? 22 : 2 }}
                  className="absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm" 
                />
              </button>
            }
          />
          {securityLockEnabled && (
            <SettingRow 
              icon={ShieldAlert} 
              label="Change PIN" 
              value="4-digit code" 
              onClick={() => setIsPinModalOpen(true)} 
            />
          )}
        </SettingGroup>

        <SettingGroup title="Appearance Lab">
          <div className="p-4 space-y-4">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Accent Color</p>
            <div className="flex gap-4">
              {(['indigo', 'emerald', 'rose'] as const).map((color) => (
                <button
                  key={color}
                  onClick={() => { triggerHaptic(10); setAccentColor(color); }}
                  className={cn(
                    "w-12 h-12 rounded-2xl transition-all flex items-center justify-center",
                    accentColor === color ? "ring-2 ring-white ring-offset-2 ring-offset-[#050505]" : "opacity-50"
                  )}
                  style={{ backgroundColor: color === 'indigo' ? '#6366f1' : color === 'emerald' ? '#10b981' : '#f43f5e' }}
                >
                  {accentColor === color && <Check size={20} className="text-white" />}
                </button>
              ))}
            </div>
          </div>
          <SettingRow 
            icon={theme === 'dark' ? Moon : Sun} 
            label="Dark Mode" 
            rightContent={
              <button 
                onClick={(e) => { e.stopPropagation(); triggerHaptic(15); toggleTheme(); }}
                className={cn(
                  "w-10 h-5 rounded-full transition-all relative",
                  theme === 'dark' ? "bg-primary" : "bg-slate-700"
                )}
              >
                <motion.div 
                  animate={{ x: theme === 'dark' ? 22 : 2 }}
                  className="absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm" 
                />
              </button>
            }
          />
        </SettingGroup>

        <SettingGroup title="Preferences">
          <SettingRow 
            icon={DollarSign} 
            label="Currency" 
            value={currency === 'INR' ? 'Indian Rupee (₹)' : 'US Dollar ($)'} 
            onClick={() => setCurrency(currency === 'INR' ? 'USD' : 'INR')}
          />
          <SettingRow icon={Globe} label="Language" value="English" />
          <SettingRow 
            icon={DollarSign} 
            label="Weekly Budget" 
            value={formatAmount(weeklyBudget)} 
            onClick={() => {
              setTempBudget(weeklyBudget.toString());
              setIsBudgetModalOpen(true);
            }}
          />
          <SettingRow 
            icon={Bell} 
            label="Push Notifications" 
            rightContent={
              <button 
                onClick={(e) => { e.stopPropagation(); handleToggleNotifications(); }}
                className={cn(
                  "w-10 h-5 rounded-full transition-all relative",
                  notificationsEnabled ? "bg-primary" : "bg-slate-700"
                )}
              >
                <motion.div 
                  animate={{ x: notificationsEnabled ? 22 : 2 }}
                  className="absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm" 
                />
              </button>
            }
          />
        </SettingGroup>

        <SettingGroup title="AI Settings">
          <div className="p-4 space-y-4">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">AI Personality</p>
            <div className="flex flex-wrap gap-2">
              {(['Professional', 'Strict Coach', 'Sarcastic Friend'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => { triggerHaptic(10); setAiPersonality(p); }}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                    aiPersonality === p 
                      ? "bg-primary border-primary text-white" 
                      : "bg-white/5 border-white/10 text-slate-400"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
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
          <SettingRow icon={LogOut} label="Sign Out" isRed onClick={() => setIsLogoutModalOpen(true)} />
          <SettingRow icon={Trash} label="Delete Account" isRed />
        </div>
      </div>

      {/* Budget Selection Modal */}
      <AnimatePresence>
        {isBudgetModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBudgetModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={cn(
                "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm border rounded-[32px] p-8 z-[101] shadow-2xl transition-colors",
                isDark ? "bg-[#050505] border-white/10" : "bg-white border-slate-200"
              )}
            >
              <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mx-auto mb-6">
                <DollarSign size={32} strokeWidth={1.5} />
              </div>
              <h3 className={cn("text-xl font-bold text-center mb-2", isDark ? "text-white" : "text-slate-900")}>Weekly Budget</h3>
              <p className="text-slate-500 text-center text-sm mb-8 leading-relaxed">
                Set your target weekly spending limit. We'll help you stay on track.
              </p>
              
              <div className="relative mb-8">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                  {currency === 'INR' ? '₹' : '$'}
                </span>
                <input 
                  type="number"
                  value={tempBudget}
                  onChange={(e) => setTempBudget(e.target.value)}
                  className={cn(
                    "w-full pl-10 pr-4 py-4 rounded-2xl border font-bold text-lg outline-none focus:ring-2 focus:ring-primary transition-all",
                    isDark ? "bg-white/5 border-white/10 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                  )}
                  placeholder="Enter amount"
                />
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => {
                    const val = parseInt(tempBudget, 10);
                    if (!isNaN(val) && val > 0) {
                      setWeeklyBudget(val);
                      setIsBudgetModalOpen(false);
                    }
                  }}
                  className="w-full py-4 bg-primary hover:bg-primary/80 text-white font-bold rounded-2xl transition-all active:scale-95"
                >
                  Save Budget
                </button>
                <button 
                  onClick={() => setIsBudgetModalOpen(false)}
                  className={cn(
                    "w-full py-4 font-bold rounded-2xl transition-all",
                    isDark ? "bg-white/5 text-slate-300 hover:bg-white/10" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* PIN Setup Modal */}
      <AnimatePresence>
        {isPinModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPinModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={cn(
                "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm border rounded-[32px] p-8 z-[101] shadow-2xl transition-colors",
                isDark ? "bg-[#050505] border-white/10" : "bg-white border-slate-200"
              )}
            >
              <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mx-auto mb-6">
                <Lock size={32} strokeWidth={1.5} />
              </div>
              <h3 className={cn("text-xl font-bold text-center mb-2", isDark ? "text-white" : "text-slate-900")}>Set Security PIN</h3>
              <p className="text-slate-500 text-center text-sm mb-8 leading-relaxed">
                Enter a 4-digit PIN to secure your financial data.
              </p>
              
              <div className="relative mb-8">
                <input 
                  type="text"
                  maxLength={4}
                  value={tempPin}
                  onChange={(e) => setTempPin(e.target.value.replace(/\D/g, ''))}
                  className={cn(
                    "w-full px-4 py-4 rounded-2xl border font-bold text-2xl text-center tracking-[1em] outline-none focus:ring-2 focus:ring-primary transition-all",
                    isDark ? "bg-white/5 border-white/10 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                  )}
                  placeholder="••••"
                />
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => {
                    if (tempPin.length === 4) {
                      setPinCode(tempPin);
                      setSecurityLockEnabled(true);
                      setIsPinModalOpen(false);
                      triggerHaptic([10, 50, 10]);
                    }
                  }}
                  className="w-full py-4 bg-primary hover:bg-primary/80 text-white font-bold rounded-2xl transition-all active:scale-95"
                >
                  Save PIN
                </button>
                <button 
                  onClick={() => setIsPinModalOpen(false)}
                  className={cn(
                    "w-full py-4 font-bold rounded-2xl transition-all",
                    isDark ? "bg-white/5 text-slate-300 hover:bg-white/10" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {isLogoutModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLogoutModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={cn(
                "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm border rounded-[32px] p-8 z-[101] shadow-2xl transition-colors",
                isDark ? "bg-[#050505] border-white/10" : "bg-white border-slate-200"
              )}
            >
              <div className="w-16 h-16 bg-rose-500/10 rounded-3xl flex items-center justify-center text-rose-500 mx-auto mb-6">
                <LogOut size={32} strokeWidth={1.5} />
              </div>
              <h3 className={cn("text-xl font-bold text-center mb-2", isDark ? "text-white" : "text-slate-900")}>Sign Out?</h3>
              <p className="text-slate-500 text-center text-sm mb-8 leading-relaxed">
                Are you sure you want to sign out of your account? You'll need to log back in to access your data.
              </p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => {
                    setIsLogoutModalOpen(false);
                    logout();
                  }}
                  className="w-full py-4 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl transition-all active:scale-95"
                >
                  Sign Out
                </button>
                <button 
                  onClick={() => setIsLogoutModalOpen(false)}
                  className={cn(
                    "w-full py-4 font-bold rounded-2xl transition-all",
                    isDark ? "bg-white/5 text-slate-300 hover:bg-white/10" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Avatar Selection Modal */}
      <AnimatePresence>
        {isAvatarModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAvatarModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xl z-[100]"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 max-h-[70vh] bg-[#050505] border-t border-white/10 rounded-t-[40px] z-[101] p-8 overflow-y-auto"
            >
              <div className="w-12 h-1.5 bg-slate-800 rounded-full mx-auto mb-8" />
              <h3 className="text-xl font-bold text-white text-center mb-8">Choose Your Avatar</h3>
              
              <div className="grid grid-cols-4 gap-6">
                {avatars.map((avatar) => (
                  <motion.button
                    key={avatar.name}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleAvatarSelect(avatar.name)}
                    className={cn(
                      "aspect-square rounded-3xl flex flex-col items-center justify-center gap-2 transition-all",
                      profile.avatar === avatar.name ? "bg-primary/20 border-2 border-primary" : "bg-white/5 border border-white/5"
                    )}
                  >
                    <avatar.icon size={28} className={avatar.color} />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{avatar.name}</span>
                    {profile.avatar === avatar.name && (
                      <div className="absolute top-2 right-2 w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center">
                        <Check size={10} className="text-white" />
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>

              <div className="mt-10">
                <Button variant="ghost" className="w-full" onClick={() => setIsAvatarModalOpen(false)}>Close</Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const { user, isLoading } = useAuth();
  const { isDark, colors } = useTheme();
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [activeToast, setActiveToast] = useState<{ title: string, body: string } | null>(null);
  const [isLocked, setIsLocked] = useState(true);
  const { securityLockEnabled, aiPersonality, weeklyBudget, formatAmount, currency } = useSettings();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const [budgetInsight, setBudgetInsight] = useState('');
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);

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
      notificationService.scheduleDailyReminder();
    }
  }, [user, weeklyBudget]);

  useEffect(() => {
    const handleNotificationEvent = (e: any) => {
      setActiveToast(e.detail);
      setTimeout(() => setActiveToast(null), 4000);
    };
    window.addEventListener('expenso-notification', handleNotificationEvent);
    return () => window.removeEventListener('expenso-notification', handleNotificationEvent);
  }, []);

  useEffect(() => {
    if (budgetInsight && (budgetInsight.includes('Heads up') || budgetInsight.includes('warning'))) {
      setHasUnreadNotifications(true);
      notificationService.sendLocalNotification('⚠️ Budget Alert', budgetInsight);
    }
  }, [budgetInsight]);

  const loadTransactions = async () => {
    if (!user) return;
    try {
      const data = await firebaseService.getTransactions(user.id);
      setTransactions(data);
      
      // Fetch budget insight
      const insight = await getBudgetInsight(data, weeklyBudget, aiPersonality, currency);
      setBudgetInsight(insight);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    triggerHaptic([10, 50, 10]);
    try {
      await firebaseService.addTransaction(user.id, {
        amount: parseFloat(amount),
        category,
        type,
        date,
        description
      });
      
      notificationService.sendLocalNotification('Transaction Added', `Successfully added ${category} ${type} of ${formatAmount(parseFloat(amount))}`);
      
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
    <div 
      className="min-h-screen flex flex-col transition-colors duration-300"
      style={{ backgroundColor: colors.bg }}
    >
      <AnimatePresence>
        {securityLockEnabled && isLocked && (
          <PinCodeOverlay onUnlock={() => setIsLocked(false)} />
        )}
      </AnimatePresence>

      <StickyHeader hasUnreadNotifications={hasUnreadNotifications} />
      
      {/* Toast Notification */}
      <AnimatePresence>
        {activeToast && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 20, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-20 left-6 right-6 z-[100] flex justify-center pointer-events-none"
          >
            <div className={cn(
              "max-w-md w-full glass p-4 rounded-2xl border shadow-2xl flex items-start gap-4 pointer-events-auto",
              isDark ? "bg-primary/20 border-primary/30" : "bg-white border-primary/10"
            )}>
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shrink-0">
                <Bell size={20} fill="currentColor" />
              </div>
              <div className="flex-1">
                <h4 className={cn("text-sm font-bold", isDark ? "text-white" : "text-slate-900")}>{activeToast.title}</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{activeToast.body}</p>
              </div>
              <button onClick={() => setActiveToast(null)} className="text-slate-400 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
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
            {activeTab === 'reports' && <ReportsPage transactions={transactions} weeklyBudget={weeklyBudget} />}
            {activeTab === 'profile' && <ProfilePage transactions={transactions} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating AI Trigger */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsAiOpen(true)}
        className="fixed bottom-28 right-6 w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-primary/40 z-40"
      >
        <MessageSquare size={24} strokeWidth={1.2} />
      </motion.button>

      {/* Bottom Tab Bar */}
      <nav className={cn(
        "fixed bottom-6 left-6 right-6 h-20 backdrop-blur-[25px] rounded-[32px] flex items-center justify-around px-4 z-50 shadow-2xl border transition-all",
        isDark ? "bg-black/80 border-white/10" : "bg-white/80 border-slate-200"
      )}>
        {tabs.map(tab => (
          tab.special ? (
            <button
              key={tab.id}
              onClick={() => setIsAddModalOpen(true)}
              className="w-16 h-16 -mt-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/40 active:scale-90 transition-transform"
            >
              <Plus size={32} strokeWidth={1.5} />
            </button>
          ) : (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.9 }}
              animate={{ 
                scale: activeTab === tab.id ? 1.1 : 1,
                filter: activeTab === tab.id ? "grayscale(0%)" : "grayscale(80%)",
                opacity: activeTab === tab.id ? 1 : 0.6
              }}
              onClick={() => {
                triggerHaptic(5);
                setActiveTab(tab.id);
              }}
              className={cn(
                "flex flex-col items-center gap-1 transition-colors",
                activeTab === tab.id ? "text-indigo-500" : "text-slate-400"
              )}
            >
              <tab.icon size={22} strokeWidth={1.2} color={!isDark && activeTab !== tab.id ? "#0f172a" : undefined} />
              <span className="text-[10px] font-bold uppercase tracking-tighter">{tab.label}</span>
            </motion.button>
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
              className={cn(
                "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm border rounded-[32px] p-8 z-[101] shadow-2xl transition-colors",
                isDark ? "bg-[#050505] border-white/10" : "bg-white border-slate-200"
              )}
            >
              <div className="w-16 h-16 bg-rose-500/10 rounded-3xl flex items-center justify-center text-rose-500 mx-auto mb-6">
                <Trash2 size={32} strokeWidth={1.5} />
              </div>
              <h3 className={cn("text-xl font-bold text-center mb-2", isDark ? "text-white" : "text-slate-900")}>Delete Transaction?</h3>
              <p className="text-slate-500 text-center text-sm mb-8 leading-relaxed">
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
                  className={cn(
                    "w-full py-4 font-bold rounded-2xl transition-all",
                    isDark ? "bg-white/5 text-slate-300 hover:bg-white/10" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
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
              className={cn(
                "relative w-full max-w-lg rounded-t-[40px] sm:rounded-[40px] overflow-hidden shadow-2xl transition-colors",
                isDark ? "bg-[#050505]" : "bg-white"
              )}
            >
              <div className={cn("w-12 h-1.5 rounded-full mx-auto mt-4 mb-2 sm:hidden", isDark ? "bg-slate-800" : "bg-slate-200")} />
              <div className="p-8 sm:p-10">
                <div className="flex justify-between items-center mb-8">
                  <h2 className={cn("text-3xl font-bold tracking-tight", isDark ? "text-white" : "text-slate-900")}>New Entry</h2>
                  <button onClick={() => setIsAddModalOpen(false)} className={cn("p-2 rounded-full transition-colors", isDark ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-900")}>
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

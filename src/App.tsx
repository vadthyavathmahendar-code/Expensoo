import React, { useState, useEffect } from 'react';
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
  Filter
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

// --- Components ---

const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6", className)}>
    {children}
  </div>
);

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
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white",
    secondary: "bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-100",
    danger: "bg-rose-500 hover:bg-rose-600 text-white",
    ghost: "bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
  };

  return (
    <button 
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "px-4 py-2 rounded-xl font-medium transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100",
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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">SecretPay</h1>
            <p className="text-slate-500 dark:text-slate-400">
              {isLogin ? 'Welcome back! Please login to your account.' : 'Create an account to start tracking.'}
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-sm rounded-xl border border-rose-100 dark:border-rose-900/30">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Email" type="email" value={email} onChange={setEmail} placeholder="name@example.com" required />
            <Input label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" required />
            <Button type="submit" className="w-full py-3">
              {isLogin ? 'Login' : 'Register'}
            </Button>
          </form>

          <div className="text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-indigo-600 dark:bg-indigo-600 text-white border-none">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-indigo-100 text-sm font-medium">Total Balance</p>
              <h2 className="text-3xl font-bold mt-1">${balance.toLocaleString()}</h2>
            </div>
            <div className="p-2 bg-white/20 rounded-xl">
              <Wallet className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Income</p>
              <h2 className="text-3xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">+${income.toLocaleString()}</h2>
            </div>
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Expenses</p>
              <h2 className="text-3xl font-bold mt-1 text-rose-600 dark:text-rose-400">-${expenses.toLocaleString()}</h2>
            </div>
            <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-xl text-rose-600 dark:text-rose-400">
              <TrendingDown className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="h-[400px]">
          <h3 className="text-lg font-bold mb-4 dark:text-white">Recent Transactions</h3>
          <div className="space-y-4 overflow-y-auto h-[300px] pr-2">
            {transactions.slice(0, 5).map((t) => (
              <div key={t.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    t.type === 'income' ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                  )}>
                    {t.type === 'income' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{t.category}</p>
                    <p className="text-xs text-slate-500">{format(parseISO(t.date), 'MMM dd, yyyy')}</p>
                  </div>
                </div>
                <p className={cn(
                  "font-bold",
                  t.type === 'income' ? "text-emerald-600" : "text-rose-600"
                )}>
                  {t.type === 'income' ? '+' : '-'}${t.amount}
                </p>
              </div>
            ))}
            {transactions.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <History className="w-12 h-12 mb-2 opacity-20" />
                <p>No transactions yet</p>
              </div>
            )}
          </div>
        </Card>

        <Card className="h-[400px]">
          <h3 className="text-lg font-bold mb-4 dark:text-white">Spending by Category</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={Object.entries(
                  transactions
                    .filter(t => t.type === 'expense')
                    .reduce((acc: any, t) => {
                      acc[t.category] = (acc[t.category] || 0) + t.amount;
                      return acc;
                    }, {})
                ).map(([name, value]) => ({ name, value }))}
                cx="50%"
                cy="45%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6'].map((color, index) => (
                  <Cell key={`cell-${index}`} fill={color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </Card>
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <h2 className="text-2xl font-bold dark:text-white">Transaction History</h2>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
            />
          </div>
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
          >
            <option value="all">All</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-sm uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Description</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold text-right">Amount</th>
                <th className="px-6 py-4 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{format(parseISO(t.date), 'MMM dd, yyyy')}</td>
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{t.category}</td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{t.description || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-1 rounded-md text-xs font-bold uppercase",
                      t.type === 'income' ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                    )}>
                      {t.type}
                    </span>
                  </td>
                  <td className={cn(
                    "px-6 py-4 font-bold text-right",
                    t.type === 'income' ? "text-emerald-600" : "text-rose-600"
                  )}>
                    {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => onDelete(t.id)}
                      className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No transactions found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold dark:text-white">Financial Reports</h2>
      
      <div className="grid grid-cols-1 gap-6">
        <Card className="h-[450px]">
          <h3 className="text-lg font-bold mb-6 dark:text-white">Monthly Trends</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend />
              <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-bold mb-4 dark:text-white">Top Expense Categories</h3>
            <div className="space-y-4">
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
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-bold">
                      {i + 1}
                    </div>
                    <span className="font-medium dark:text-white">{name}</span>
                  </div>
                  <span className="font-bold text-rose-600">-${value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-bold mb-4 dark:text-white">Financial Health</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-slate-500">Savings Rate</span>
                  <span className="text-sm font-bold dark:text-white">
                    {transactions.length > 0 ? Math.round(((transactions.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0) - transactions.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0)) / (transactions.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0) || 1)) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.max(0, Math.min(100, (transactions.length > 0 ? ((transactions.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0) - transactions.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0)) / (transactions.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0) || 1)) * 100 : 0)))}%` }}
                  />
                </div>
              </div>
              <p className="text-sm text-slate-500 italic">
                "A high savings rate is the fastest path to financial freedom. Aim for 20% or more!"
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const AiAssistant = ({ transactions }: { transactions: any[] }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; content: string }[]>([
    { role: 'ai', content: "Hello! I'm your SecretPay AI Assistant. Ask me anything about your finances or for some savings tips!" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

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
    <div className="h-[calc(100vh-12rem)] flex flex-col gap-4">
      <h2 className="text-2xl font-bold dark:text-white">AI Financial Assistant</h2>
      
      <Card className="flex-1 flex flex-col p-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={cn(
              "flex",
              msg.role === 'user' ? "justify-end" : "justify-start"
            )}>
              <div className={cn(
                "max-w-[80%] p-4 rounded-2xl",
                msg.role === 'user' 
                  ? "bg-indigo-600 text-white rounded-tr-none" 
                  : "bg-slate-100 dark:bg-slate-900 dark:text-slate-200 rounded-tl-none"
              )}>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <Markdown>{msg.content}</Markdown>
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-2xl rounded-tl-none">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-top border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
            />
            <Button type="submit" disabled={isTyping}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
};

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold dark:text-white">Profile Settings</h2>
      
      <Card className="flex flex-col items-center text-center py-10">
        <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 mb-4">
          <User className="w-12 h-12" />
        </div>
        <h3 className="text-xl font-bold dark:text-white">{user?.email}</h3>
        <p className="text-slate-500">Member since Feb 2026</p>
      </Card>

      <Card className="space-y-4">
        <div className="flex items-center justify-between p-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 dark:bg-slate-900 rounded-lg dark:text-white">
              {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </div>
            <div>
              <p className="font-medium dark:text-white">Dark Mode</p>
              <p className="text-xs text-slate-500">Toggle application theme</p>
            </div>
          </div>
          <button 
            onClick={toggleTheme}
            className={cn(
              "w-12 h-6 rounded-full transition-colors relative",
              theme === 'dark' ? "bg-indigo-600" : "bg-slate-300"
            )}
          >
            <div className={cn(
              "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
              theme === 'dark' ? "right-1" : "left-1"
            )} />
          </button>
        </div>

        <div className="h-px bg-slate-100 dark:bg-slate-700" />

        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-xl transition-colors"
        >
          <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-lg">
            <LogOut className="w-5 h-5" />
          </div>
          <span className="font-medium">Logout</span>
        </button>
      </Card>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);

  // Form state
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [type, setType] = useState('expense');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');

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

  if (isLoading) return null;
  if (!user) return <AuthPage />;

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'history', label: 'History', icon: History },
    { id: 'reports', label: 'Reports', icon: PieChartIcon },
    { id: 'ai', label: 'AI Assistant', icon: MessageSquare },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row">
      {/* Sidebar */}
      <nav className="w-full md:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-2 z-10">
        <div className="px-4 py-6 mb-4">
          <h1 className="text-2xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400">SecretPay</h1>
        </div>
        
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all",
              activeTab === tab.id 
                ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400" 
                : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50"
            )}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </button>
        ))}

        <div className="mt-auto pt-4">
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-3"
          >
            <Plus className="w-5 h-5" />
            Add Transaction
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'dashboard' && <Dashboard transactions={transactions} />}
            {activeTab === 'history' && <HistoryPage transactions={transactions} onDelete={handleDelete} />}
            {activeTab === 'reports' && <ReportsPage transactions={transactions} />}
            {activeTab === 'ai' && <AiAssistant transactions={transactions} />}
            {activeTab === 'profile' && <ProfilePage />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Add Transaction Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg"
            >
              <Card className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold dark:text-white">Add Transaction</h2>
                  <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors dark:text-white">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleAddTransaction} className="space-y-4">
                  <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
                    <button 
                      type="button"
                      onClick={() => setType('expense')}
                      className={cn(
                        "flex-1 py-2 rounded-lg font-bold text-sm transition-all",
                        type === 'expense' ? "bg-white dark:bg-slate-800 text-rose-600 shadow-sm" : "text-slate-500"
                      )}
                    >
                      Expense
                    </button>
                    <button 
                      type="button"
                      onClick={() => setType('income')}
                      className={cn(
                        "flex-1 py-2 rounded-lg font-bold text-sm transition-all",
                        type === 'income' ? "bg-white dark:bg-slate-800 text-emerald-600 shadow-sm" : "text-slate-500"
                      )}
                    >
                      Income
                    </button>
                  </div>

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
                  <Input label="Description (Optional)" value={description} onChange={setDescription} placeholder="What was this for?" />

                  <div className="pt-4 flex gap-3">
                    <Button variant="secondary" onClick={() => setIsAddModalOpen(false)} className="flex-1">Cancel</Button>
                    <Button type="submit" className="flex-1">Save Transaction</Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

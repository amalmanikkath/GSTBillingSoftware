"use client";

import { 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign, 
  Users, 
  Package, 
  TrendingUp,
  Receipt,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { formatCurrency } from "@/lib/utils/tax-utils";

const data = [
  { name: "Apr", sales: 4000, expenses: 2400 },
  { name: "May", sales: 3000, expenses: 1398 },
  { name: "Jun", sales: 2000, expenses: 9800 },
  { name: "Jul", sales: 2780, expenses: 3908 },
  { name: "Aug", sales: 1890, expenses: 4800 },
  { name: "Sep", sales: 2390, expenses: 3800 },
  { name: "Oct", sales: 3490, expenses: 4300 },
];

const stats = [
  {
    name: "Total Revenue",
    value: 128430.00,
    change: "+12.5%",
    trend: "up",
    icon: DollarSign,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10"
  },
  {
    name: "GST Collected",
    value: 23117.40,
    change: "+8.2%",
    trend: "up",
    icon: Receipt,
    color: "text-indigo-500",
    bg: "bg-indigo-500/10"
  },
  {
    name: "Outstanding",
    value: 45200.00,
    change: "-4.1%",
    trend: "down",
    icon: Clock,
    color: "text-amber-500",
    bg: "bg-amber-500/10"
  },
  {
    name: "Total Customers",
    value: 342,
    change: "+18",
    trend: "up",
    icon: Users,
    color: "text-blue-500",
    bg: "bg-blue-500/10"
  }
];

const recentInvoices = [
  { id: "INV-2024-001", customer: "Reliance Retail", date: "2024-03-24", amount: 15400, status: "Paid" },
  { id: "INV-2024-002", customer: "Tata Motors", date: "2024-03-23", amount: 42000, status: "Pending" },
  { id: "INV-2024-003", customer: "Adani Gas", date: "2024-03-22", amount: 8900, status: "Overdue" },
  { id: "INV-2024-004", customer: "Infosys Ltd", date: "2024-03-21", amount: 23500, status: "Paid" },
];

export default function Dashboard() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Financial Overview</h1>
        <p className="text-muted-foreground">Welcome back, Admin. Here's what's happening with your business today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div key={stat.name} className="glass-card rounded-2xl p-6 transition-all hover:translate-y-[-4px] hover:shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${
                stat.trend === 'up' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
              }`}>
                {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                {stat.change}
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">{stat.name}</p>
              <h3 className="text-2xl font-bold mt-1 tracking-tight">
                {typeof stat.value === 'number' ? formatCurrency(stat.value) : stat.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-7">
        {/* Sales Chart */}
        <div className="lg:col-span-4 glass-card rounded-3xl p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold">Revenue Growth</h3>
              <p className="text-sm text-muted-foreground">Monthly revenue vs expenses</p>
            </div>
            <select className="bg-secondary/50 border border-border/40 rounded-lg px-3 py-1.5 text-xs focus:outline-none">
              <option>Last 6 months</option>
              <option>Last year</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(23, 23, 26, 0.9)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    backdropFilter: 'blur(8px)'
                  }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="var(--color-primary)" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="lg:col-span-3 glass-card rounded-3xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold">Recent Invoices</h3>
            <button className="text-xs text-primary font-medium hover:underline">View All</button>
          </div>
          <div className="space-y-6">
            {recentInvoices.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-xl border border-border/40 bg-secondary/30 transition-colors group-hover:bg-primary/10 group-hover:border-primary/20`}>
                    <FileText className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{inv.customer}</p>
                    <p className="text-xs text-muted-foreground">{inv.id} • {inv.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{formatCurrency(inv.amount)}</p>
                  <div className={`flex items-center justify-end text-[10px] mt-1 ${
                    inv.status === 'Paid' ? 'text-emerald-500' : 
                    inv.status === 'Pending' ? 'text-amber-500' : 'text-red-500'
                  }`}>
                    {inv.status === 'Paid' ? <CheckCircle2 className="w-3 h-3 mr-1" /> : 
                     inv.status === 'Pending' ? <Clock className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
                    {inv.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-10 p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
             <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-indigo-400" />
                <span className="text-sm font-bold">Growth Tip</span>
             </div>
             <p className="text-xs text-muted-foreground leading-relaxed">
               You have 3 invoices pending for more than 30 days. Sending a WhatsApp reminder could speed up your cash flow by 24%.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}

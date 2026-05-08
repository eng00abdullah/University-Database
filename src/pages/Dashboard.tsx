import { useState, useEffect } from 'react';
import { 
  Users, 
  GraduationCap, 
  Building2, 
  BookOpen, 
  DollarSign, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import { motion } from 'motion/react';
import axios from 'axios';

const chartData = [
  { name: 'Jan', revenue: 4000, expenses: 2400 },
  { name: 'Feb', revenue: 3000, expenses: 1398 },
  { name: 'Mar', revenue: 2000, expenses: 9800 },
  { name: 'Apr', revenue: 2780, expenses: 3908 },
  { name: 'May', revenue: 1890, expenses: 4800 },
  { name: 'Jun', revenue: 2390, expenses: 3800 },
];

const courseDistribution = [
  { name: 'Humanities', value: 62, color: '#3b82f6' },
  { name: 'Science', value: 48, color: '#1d4ed8' },
  { name: 'Technology', value: 39, color: '#f472b6' },
  { name: 'Other', value: 16, color: '#94a3b8' },
];

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/api/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-full">Loading...</div>;

  const statCards = [
    { title: 'Total Enrollment', value: stats?.totalStudents?.toLocaleString() || 0, trend: '+3.2% vs last semester', color: 'text-emerald-500' },
    { title: 'Average GPA', value: '3.64', trend: '+0.12 pts trend', color: 'text-emerald-500' },
    { title: 'Revenue Collected', value: `$${(stats?.totalRevenue / 1000000).toFixed(1)}M`, trend: '88% of target reached', color: 'text-ui-muted' },
    { title: 'Active Courses', value: stats?.activeCourses || 0, trend: `${stats?.totalDepartments} Departments`, color: 'text-ui-muted' },
  ];

  return (
    <div className="space-y-6 pb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-5 rounded-2xl border border-ui-border shadow-[0_4px_6px_-1px_rgba(0,0,0,0.02)]"
          >
            <h3 className="text-ui-muted text-[13px] mb-1 font-medium">{card.title}</h3>
            <p className="text-2xl font-bold text-slate-900">{card.value}</p>
            <p className={`text-[11px] mt-1 font-medium ${card.color}`}>
              {card.trend}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-ui-border flex flex-col overflow-hidden shadow-[0_4px_6px_-1px_rgba(0,0,0,0.02)]">
          <div className="px-6 py-4 border-b border-ui-border flex justify-between items-center">
            <h3 className="text-base font-semibold text-ui-text">Student Activity</h3>
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-ui-muted">This Semester</span>
              <select className="text-[11px] p-1 border border-ui-border rounded focus:ring-1 focus:ring-brand-blue/20 outline-none pr-4">
                <option>Jan - Jun</option>
              </select>
            </div>
          </div>
          <div className="h-[280px] px-4 py-8">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3B82F6" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-ui-border flex flex-col overflow-hidden shadow-[0_4px_6px_-1px_rgba(0,0,0,0.02)]">
          <div className="px-6 py-4 border-b border-ui-border flex justify-between items-center">
            <h3 className="text-base font-semibold text-ui-text">Course Distribution</h3>
            <button className="text-ui-muted hover:text-ui-text">
              <BookOpen className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 flex flex-col p-6">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative w-1/2 h-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={courseDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={0}
                      dataKey="value"
                    >
                      {courseDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-bold text-slate-900 leading-none">165</span>
                  <span className="text-[8px] text-ui-muted font-bold uppercase mt-1">Total</span>
                </div>
              </div>
              
              <div className="w-1/2 space-y-3">
                {courseDistribution.map((item, i) => (
                  <div key={i} className="flex items-center justify-between group">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-[11px] text-ui-text font-medium">{item.name}</span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <span className="text-[10px] text-ui-muted font-bold">
                        {((item.value / 165) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-ui-border">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] text-ui-muted font-bold uppercase tracking-wider">Top Rated</p>
                  <p className="text-[13px] font-bold text-ui-text">Computer Science</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-ui-muted font-bold uppercase tracking-wider">New Enrollment</p>
                  <p className="text-[13px] font-bold text-teal-500">+12.5% this week</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-ui-border overflow-hidden">
        <div className="px-6 py-4 border-b border-ui-border flex justify-between items-center">
          <h3 className="text-base font-semibold text-ui-text">Recent Financial Transactions</h3>
          <button className="text-[12px] text-brand-blue font-bold hover:underline">View All Payments</button>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-ui-bg">
              <th className="px-6 py-3 text-[12px] text-ui-muted font-semibold uppercase tracking-wider border-b border-ui-border">Student Name</th>
              <th className="px-6 py-3 text-[12px] text-ui-muted font-semibold uppercase tracking-wider border-b border-ui-border">Transaction ID</th>
              <th className="px-6 py-3 text-[12px] text-ui-muted font-semibold uppercase tracking-wider border-b border-ui-border">Amount</th>
              <th className="px-6 py-3 text-[12px] text-ui-muted font-semibold uppercase tracking-wider border-b border-ui-border">Status</th>
              <th className="px-6 py-3 text-[12px] text-ui-muted font-semibold uppercase tracking-wider border-b border-ui-border">Date</th>
            </tr>
          </thead>
          <tbody className="text-[13px]">
            {[
              { name: 'Alexander Wright', id: 'TXN-92842', amount: '$2,450.00', status: 'Paid Full', statusClass: 'bg-[#DCFCE7] text-[#166534]' },
              { name: 'Elena Rodriguez', id: 'TXN-92843', amount: '$1,125.00', status: 'Pending', statusClass: 'bg-[#FEE2E2] text-[#991B1B]' },
              { name: 'Marcus Thorne', id: 'TXN-92845', amount: '$4,800.00', status: 'Paid Full', statusClass: 'bg-[#DCFCE7] text-[#166534]' }
            ].map((txn, i) => (
              <tr key={i} className="border-b border-[#F1F5F9] last:border-0">
                <td className="px-6 py-4.5 font-medium">{txn.name}</td>
                <td className="px-6 py-4.5 text-ui-muted">{txn.id}</td>
                <td className="px-6 py-4.5 font-semibold">{txn.amount}</td>
                <td className="px-6 py-4.5">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${txn.statusClass}`}>{txn.status}</span>
                </td>
                <td className="px-6 py-4.5 text-ui-muted">Oct 12, 2023</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

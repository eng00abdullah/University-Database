import { useState, useEffect } from 'react';
import { 
  Users, 
  GraduationCap, 
  Building2, 
  BookOpen, 
  DollarSign, 
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { motion } from 'motion/react';
import axios from 'axios';

interface DashboardProps {
  user: any;
}

export default function Dashboard({ user }: DashboardProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await axios.get('/api/dashboard/summary');
        setData(response.data);
      } catch (err: any) {
        console.error('Dashboard fetch error:', err);
        setError(err.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
        <Clock className="text-brand-blue" />
      </motion.div>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <AlertCircle className="text-red-500 w-12 h-12" />
      <p className="text-ui-text font-bold">{error}</p>
      <button onClick={() => window.location.reload()} className="bg-brand-blue text-white px-4 py-2 rounded-lg font-bold">Retry</button>
    </div>
  );

  // --- Admin/Dean/Admission View ---
  if (["ADMIN", "DEAN", "ADMISSION"].includes(user?.role)) {
    const overview = data?.overview;
    const cards = [
      { title: 'Total Enrollment', value: overview?.totalStudents?.toLocaleString(), icon: GraduationCap, color: 'brand-blue' },
      { title: 'Faculty Members', value: overview?.totalEmployees?.toLocaleString(), icon: Users, color: 'brand-pink' },
      { title: 'Active Courses', value: overview?.activeCourses, icon: BookOpen, color: 'brand-navy' },
      { title: 'Revenue (EGP)', value: overview?.totalRevenue?.toLocaleString(), icon: DollarSign, color: 'teal-500' },
    ];

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {cards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-6 rounded-2xl border border-ui-border shadow-sm flex items-center gap-4"
            >
              <div className={`w-12 h-12 rounded-xl bg-${card.color}/10 flex items-center justify-center text-${card.color}`}>
                <card.icon size={24} />
              </div>
              <div>
                <p className="text-ui-muted text-xs font-bold uppercase tracking-wider">{card.title}</p>
                <p className="text-2xl font-bold text-ui-text">{card.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-ui-border shadow-sm">
            <h3 className="text-lg font-bold text-ui-text mb-6">Departmental Overview</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                  <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-ui-border shadow-sm">
            <h3 className="text-lg font-bold text-ui-text mb-6">Quick Stats</h3>
            <div className="space-y-4">
              <div className="p-4 bg-ui-bg rounded-xl">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-ui-muted">System Uptime</span>
                  <span className="text-teal-500 font-bold">99.9%</span>
                </div>
                <div className="w-full bg-ui-border h-1.5 rounded-full overflow-hidden">
                  <div className="bg-teal-500 h-full w-[99.9%]"></div>
                </div>
              </div>
              <div className="p-4 bg-ui-bg rounded-xl">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-ui-muted">Storage Usage</span>
                  <span className="text-brand-pink font-bold">42%</span>
                </div>
                <div className="w-full bg-ui-border h-1.5 rounded-full overflow-hidden">
                  <div className="bg-brand-pink h-full w-[42%]"></div>
                </div>
              </div>
              <div className="p-4 bg-ui-bg rounded-xl">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-ui-muted">Pending Requests</span>
                  <span className="text-brand-blue font-bold">8</span>
                </div>
                <div className="flex gap-1 mt-2">
                  {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="flex-1 h-1.5 rounded-full bg-brand-blue"></div>)}
                  <div className="flex-1 h-1.5 rounded-full bg-ui-border"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Teacher View ---
  if (user?.role === "TEACHER") {
    const teacher = data?.teacher;
    return (
      <div className="space-y-6">
        <div className="bg-white p-8 rounded-3xl border border-ui-border shadow-sm flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-ui-text">Welcome back, Prof. {teacher?.name.split(' ')[1]}</h2>
            <p className="text-ui-muted font-medium mt-1">You have {teacher?.coursesCount} scheduled lectures for this semester.</p>
          </div>
          <CheckCircle2 className="text-teal-500 w-12 h-12" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-ui-border shadow-sm">
            <h3 className="text-lg font-bold text-ui-text mb-4">Upcoming Classes</h3>
            <div className="space-y-3">
              {teacher?.upcomingClasses.map((sch: any, i: number) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-ui-bg rounded-xl border border-transparent hover:border-brand-blue/20 transition-all">
                  <div className="w-12 h-12 rounded-lg bg-brand-blue/10 flex flex-col items-center justify-center text-brand-blue">
                    <span className="text-[10px] font-bold uppercase">{sch.dayOfWeek.slice(0, 3)}</span>
                    <span className="text-xs font-bold leading-none">{sch.startTime.split(':')[0]}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm text-ui-text">{sch.course.name}</h4>
                    <p className="text-xs text-ui-muted font-medium">Room {sch.room.roomNumber} • {sch.startTime} - {sch.endTime}</p>
                  </div>
                  <button className="text-[11px] font-bold text-brand-blue uppercase hover:underline">Attendance</button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-ui-border shadow-sm">
            <h3 className="text-lg font-bold text-ui-text mb-4">Class Distribution</h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Lectures', value: 70, color: '#3b82f6' },
                      { name: 'Labs', value: 30, color: '#f472b6' }
                    ]}
                    cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value"
                  >
                    <Cell fill="#3b82f6" /><Cell fill="#f472b6" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Student View ---
  if (user?.role === "STUDENT") {
    const student = data?.student;
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-brand-blue p-8 rounded-3xl text-white relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-3xl font-bold">Academic Status</h2>
                <div className="mt-6 flex items-end gap-6">
                  <div>
                    <label className="text-xs font-bold text-white/60 uppercase tracking-widest">Current GPA</label>
                    <p className="text-5xl font-black mt-1">{student?.gpa || 'N/A'}</p>
                  </div>
                  <div className="h-12 w-px bg-white/20"></div>
                  <div>
                    <label className="text-xs font-bold text-white/60 uppercase tracking-widest">Financial Status</label>
                    <p className="text-xl font-bold mt-1 uppercase tracking-tighter">{student?.financialStatus}</p>
                  </div>
                </div>
              </div>
              <GraduationCap className="absolute -bottom-6 -right-6 w-48 h-48 text-white/10" />
            </div>

            <div className="bg-white p-6 rounded-2xl border border-ui-border shadow-sm">
              <h3 className="text-lg font-bold text-ui-text mb-4">Registered Courses</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {student?.courses.map((c: any, i: number) => (
                  <div key={i} className="p-4 border border-ui-border rounded-xl hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-ui-text leading-tight">{c.name}</h4>
                      <span className="text-[10px] font-bold bg-brand-pink/10 text-brand-pink px-2 py-0.5 rounded uppercase">Active</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-ui-muted font-medium flex items-center gap-2">
                        <Users size={12} /> {c.teacher}
                      </p>
                      <p className="text-xs text-ui-muted font-medium flex items-center gap-2">
                        <Building2 size={12} /> Room {c.room}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-ui-border shadow-sm">
              <h3 className="text-lg font-bold text-ui-text mb-4">Recent Grades</h3>
              <div className="space-y-4">
                {student?.courses.filter((c: any) => c.grade).map((c: any, i: number) => (
                  <div key={i} className="flex justify-between items-center group">
                    <span className="text-xs font-bold text-ui-muted group-hover:text-ui-text transition-colors">{c.name}</span>
                    <span className="text-sm font-black text-brand-blue">{c.grade}</span>
                  </div>
                ))}
              </div>
              <button className="w-full mt-6 py-2 rounded-xl bg-ui-bg text-ui-muted text-xs font-bold hover:bg-ui-border transition-colors">Transcript</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <div className="text-center font-bold text-ui-muted mt-20">No dashboard data available for your role.</div>;
}

const chartData = [
  { name: 'Week 1', revenue: 420 },
  { name: 'Week 2', revenue: 680 },
  { name: 'Week 3', revenue: 550 },
  { name: 'Week 4', revenue: 920 },
  { name: 'Week 5', revenue: 780 },
  { name: 'Week 6', revenue: 1100 },
];


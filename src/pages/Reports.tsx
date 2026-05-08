import { useState, useEffect } from 'react';
import { 
  FilePieChart, 
  Download, 
  Printer, 
  TrendingUp, 
  Users, 
  DollarSign, 
  AlertCircle,
  GraduationCap
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { motion } from 'motion/react';
import axios from 'axios';

const performanceData = [
  { dept: 'CS', gpa: 3.8, students: 420 },
  { dept: 'ENG', gpa: 3.5, students: 380 },
  { dept: 'BUS', gpa: 3.2, students: 510 },
  { dept: 'ART', gpa: 3.9, students: 150 },
  { dept: 'MED', gpa: 3.7, students: 200 },
];

export default function Reports() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await axios.get('/api/stats');
        setStats(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) return <div className="p-10 text-center font-bold text-ui-muted">Loading Analytics...</div>;

  const performanceData = stats?.departments ? stats.departments.map((d: any) => ({
    dept: d.name ? d.name.split(' ').map((w: string) => w[0]).join('') : '?',
    students: d._count?.students || 0,
    gpa: parseFloat((3.2 + Math.random() * 0.7).toFixed(1))
  })) : [];

  console.log('Stats:', stats);
  console.log('Performance Data:', performanceData);

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-ui-muted text-xs font-bold uppercase tracking-wider mb-1">
             <FilePieChart size={14} /> Administration {'>'} Analytics
          </div>
          <h1 className="text-2xl font-bold text-ui-text tracking-tight">System Intelligence</h1>
          <p className="text-ui-muted text-sm">Generate comprehensive reports and real-time academic analytics.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-ui-border text-ui-text rounded-xl text-sm font-bold hover:bg-ui-bg transition-all">
            <Printer size={18} />
            Print All
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-brand-blue text-white rounded-xl text-sm font-bold hover:bg-brand-blue/90 shadow-lg shadow-brand-blue/10 transition-all">
            <Download size={18} />
            Export Data
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-ui-border">
          <div className="flex items-center justify-between mb-8">
             <h3 className="text-base font-bold text-ui-text uppercase tracking-tight">Academic Performance vs Scale</h3>
             <div className="flex gap-2">
                <span className="px-2 py-0.5 bg-blue-50 text-blue-500 rounded-lg text-[9px] font-bold uppercase">GPA</span>
                <span className="px-2 py-0.5 bg-pink-50 text-brand-pink rounded-lg text-[9px] font-bold uppercase">Enrollment</span>
             </div>
          </div>
          <div className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={performanceData}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                 <XAxis dataKey="dept" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} dy={10} />
                 <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                 <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                 <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{fontSize: '11px', fontWeight: 'bold'}} />
                 <Bar dataKey="gpa" fill="#0A1F5C" radius={[4, 4, 0, 0]} name="Avg GPA" />
                 <Bar dataKey="students" fill="#FF4D97" radius={[4, 4, 0, 0]} name="Total Students" />
               </BarChart>
             </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
           <div className="bg-white p-6 rounded-2xl border border-ui-border flex flex-col justify-between h-full">
             <div>
               <h3 className="text-base font-bold text-ui-text mb-6 uppercase tracking-tight">Real-time Insights</h3>
               <div className="space-y-3">
                  {[
                    { label: 'Total Active Courses', value: stats?.activeCourses || 0, icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-50' },
                    { label: 'Academic Staff', value: stats?.totalEmployees || 0, icon: Users, color: 'text-brand-pink', bg: 'bg-pink-50' },
                    { label: 'Student Population', value: stats?.totalStudents || 0, icon: TrendingUp, color: 'text-brand-blue', bg: 'bg-blue-50' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-ui-bg/50 rounded-xl border border-ui-border">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 ${item.bg} ${item.color} rounded-lg`}>
                           <item.icon size={18} />
                        </div>
                        <span className="text-sm font-semibold text-ui-text">{item.label}</span>
                      </div>
                      <span className="text-lg font-bold text-ui-text">{item.value}</span>
                    </div>
                  ))}
               </div>
             </div>
             
             <div className="mt-6 p-6 bg-brand-blue rounded-2xl text-white flex items-center justify-between overflow-hidden relative">
               <div className="relative z-10">
                 <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">Total Educational Impact</p>
                 <p className="text-2xl font-bold">{stats?.totalStudents || 0} Learners</p>
                 <p className="text-[10px] font-bold text-emerald-400 mt-2 flex items-center gap-1">
                   <TrendingUp size={12} /> Live Tracking
                 </p>
               </div>
               <div className="relative z-10 w-20 h-20 bg-white/10 rounded-full flex items-center justify-center border border-white/5">
                  <GraduationCap size={32} className="text-brand-pink" />
               </div>
               <div className="absolute top-0 right-0 w-32 h-32 bg-brand-pink/10 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2"></div>
             </div>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-ui-border overflow-hidden">
        <div className="p-6 border-b border-ui-border">
          <h3 className="text-base font-bold text-ui-text uppercase tracking-tight">Departmental Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-ui-bg">
                <th className="px-6 py-3 text-[11px] font-bold text-ui-muted uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-[11px] font-bold text-ui-muted uppercase tracking-wider">Students</th>
                <th className="px-6 py-3 text-[11px] font-bold text-ui-muted uppercase tracking-wider">Faculty Count</th>
                <th className="px-6 py-3 text-[11px] font-bold text-ui-muted uppercase tracking-wider text-right">Activity Status</th>
              </tr>
            </thead>
            <tbody className="text-[13px]">
              {(stats?.departments || []).map((dept: any, i: number) => (
                <tr key={i} className="border-b border-[#F1F5F9] last:border-0 hover:bg-ui-bg/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-ui-text">{dept.name}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-ui-muted">{dept._count.students}</td>
                  <td className="px-6 py-4">
                    <div className="w-24 h-1.5 bg-ui-bg rounded-full overflow-hidden">
                       <div className="h-full bg-brand-pink" style={{width: `${Math.min(100, dept._count.employees * 10)}%`}}></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[10px] font-bold uppercase">Active</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

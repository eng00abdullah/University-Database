import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  UserSquare, 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  Building2, 
  LogOut,
  Settings,
  CreditCard,
  ClipboardCheck,
  Trophy,
  FilePieChart
} from 'lucide-react';
import { motion } from 'motion/react';

interface SidebarProps {
  user: any;
  onLogout: () => void;
}

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/students', icon: GraduationCap, label: 'Students' },
  { path: '/employees', icon: Users, label: 'Employees' },
  { path: '/departments', icon: Building2, label: 'Departments' },
  { path: '/courses', icon: BookOpen, label: 'Courses' },
  { path: '/schedules', icon: Calendar, label: 'Schedules' },
  { path: '/attendance', icon: ClipboardCheck, label: 'Attendance' },
  { path: '/fees', icon: CreditCard, label: 'Finance' },
  { path: '/scholarships', icon: Trophy, label: 'Scholarships' },
  { path: '/reports', icon: FilePieChart, label: 'Reports' },
];

export default function Sidebar({ user, onLogout }: SidebarProps) {
  return (
    <aside className="w-60 bg-brand-navy text-white flex flex-col shrink-0 z-20 overflow-y-auto">
      <div className="px-6 py-8 flex items-center gap-3">
        <div className="w-8 h-8 bg-brand-pink rounded-lg flex items-center justify-center font-black text-lg">
          U
        </div>
        <span className="text-xl font-extrabold tracking-tight">EDU-CORE</span>
      </div>

      <nav className="flex-1 space-y-6 pb-8">
        <div className="space-y-1">
          <p className="px-6 mb-2 text-[10px] uppercase tracking-widest text-white/50 font-bold">Main Menu</p>
          {navItems.slice(0, 3).map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-6 py-3 text-sm font-medium transition-all group border-l-3
                ${isActive 
                  ? 'bg-white/5 text-white border-brand-pink' 
                  : 'text-white/70 border-transparent hover:bg-white/10 hover:text-white'}
              `}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>

        <div className="space-y-1">
          <p className="px-6 mb-2 text-[10px] uppercase tracking-widest text-white/50 font-bold">Academic</p>
          {navItems.slice(3, 6).map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-6 py-3 text-sm font-medium transition-all group border-l-3
                ${isActive 
                  ? 'bg-white/5 text-white border-brand-pink' 
                  : 'text-white/70 border-transparent hover:bg-white/10 hover:text-white'}
              `}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>

        <div className="space-y-1">
          <p className="px-6 mb-2 text-[10px] uppercase tracking-widest text-white/50 font-bold">Administration</p>
          {navItems.slice(6).map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-6 py-3 text-sm font-medium transition-all group border-l-3
                ${isActive 
                  ? 'bg-white/5 text-white border-brand-pink' 
                  : 'text-white/70 border-transparent hover:bg-white/10 hover:text-white'}
              `}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="p-4 border-t border-white/10 mt-auto">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-6 py-3 w-full text-white/60 hover:text-red-400 hover:bg-red-400/5 rounded-xl transition-all font-medium text-sm"
        >
          <LogOut size={18} />
          <span>Logout Session</span>
        </button>
      </div>
    </aside>
  );
}

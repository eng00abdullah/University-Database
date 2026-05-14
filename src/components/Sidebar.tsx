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
  FilePieChart,
  ShoppingBag
} from 'lucide-react';
import { motion } from 'motion/react';

interface SidebarProps {
  user: any;
  onLogout: () => void;
}

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['ADMIN', 'DEAN', 'TEACHER', 'ADMISSION', 'STUDENT'] },
  { path: '/students', icon: GraduationCap, label: 'Students', roles: ['ADMIN', 'DEAN', 'ADMISSION'] },
  { path: '/employees', icon: Users, label: 'Employees', roles: ['ADMIN', 'DEAN'] },
  { path: '/departments', icon: Building2, label: 'Departments', roles: ['ADMIN', 'DEAN'] },
  { path: '/courses', icon: BookOpen, label: 'Courses', roles: ['ADMIN', 'DEAN', 'TEACHER'] },
  { path: '/schedules', icon: Calendar, label: 'Schedules', roles: ['ADMIN', 'DEAN', 'TEACHER', 'ADMISSION', 'STUDENT'] },
  { path: '/attendance', icon: ClipboardCheck, label: 'Attendance', roles: ['ADMIN', 'DEAN', 'TEACHER', 'STUDENT'] },
  { path: '/fees', icon: CreditCard, label: 'Finance', roles: ['ADMIN', 'ADMISSION', 'STUDENT'] },
  { path: '/scholarships', icon: Trophy, label: 'Scholarships', roles: ['ADMIN', 'ADMISSION', 'DEAN'] },
  { path: '/reports', icon: FilePieChart, label: 'Reports', roles: ['ADMIN', 'DEAN', 'ADMISSION'] },
  { path: '/checkout', icon: ShoppingBag, label: 'Shop Checkout', roles: ['ADMIN', 'STUDENT', 'ADMISSION', 'DEAN', 'TEACHER'] },
];

export default function Sidebar({ user, onLogout }: SidebarProps) {
  const filteredNavItems = navItems.filter(item => item.roles.includes(user?.role));

  const mainItems = filteredNavItems.filter(item => ['/', '/students', '/employees'].includes(item.path));
  const academicItems = filteredNavItems.filter(item => ['/departments', '/courses', '/schedules'].includes(item.path));
  const adminItems = filteredNavItems.filter(item => ['/attendance', '/fees', '/scholarships', '/reports', '/checkout'].includes(item.path));

  return (
    <aside className="w-60 bg-brand-navy text-white flex flex-col shrink-0 z-20 overflow-y-auto">
      <div className="px-6 py-8 flex items-center gap-3">
        <div className="w-8 h-8 bg-brand-pink rounded-lg flex items-center justify-center font-black text-lg">
          U
        </div>
        <span className="text-xl font-extrabold tracking-tight">EDU-CORE</span>
      </div>

      <nav className="flex-1 space-y-6 pb-8">
        {mainItems.length > 0 && (
          <div className="space-y-1">
            <p className="px-6 mb-2 text-[10px] uppercase tracking-widest text-white/50 font-bold">Main Menu</p>
            {mainItems.map((item) => (
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
        )}

        {academicItems.length > 0 && (
          <div className="space-y-1">
            <p className="px-6 mb-2 text-[10px] uppercase tracking-widest text-white/50 font-bold">Academic</p>
            {academicItems.map((item) => (
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
        )}

        {adminItems.length > 0 && (
          <div className="space-y-1">
            <p className="px-6 mb-2 text-[10px] uppercase tracking-widest text-white/50 font-bold">Administration</p>
            {adminItems.map((item) => (
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
        )}
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

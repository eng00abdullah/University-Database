import { Bell, Search, User, ChevronDown } from 'lucide-react';

interface HeaderProps {
  user: any;
}

export default function Header({ user }: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-ui-border flex items-center justify-between px-8 z-10 shrink-0">
      <div className="flex-1 max-w-md">
        <div className="relative group">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ui-muted group-focus-within:text-brand-pink transition-colors" />
          <input 
            type="text" 
            placeholder="Search dashboard..."
            className="w-full pl-10 pr-4 py-2 bg-ui-bg border border-ui-border rounded-xl text-sm focus:ring-2 focus:ring-brand-pink/10 focus:bg-white transition-all outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-5">
        <button className="relative p-2 text-ui-muted hover:text-brand-pink hover:bg-brand-pink/5 rounded-lg transition-all">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-brand-pink rounded-full border-2 border-white"></span>
        </button>

        <div className="h-6 w-px bg-ui-border"></div>

        <div className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full hover:bg-ui-bg cursor-pointer transition-all group border border-transparent hover:border-ui-border">
          <div className="flex flex-col items-end">
            <span className="text-[13px] font-semibold text-ui-text group-hover:text-brand-pink transition-colors">{user?.email?.split('@')[0]}</span>
            <span className="text-[10px] text-ui-muted font-medium tracking-wider uppercase">{user?.role}</span>
          </div>
          <div className="w-9 h-9 rounded-full overflow-hidden border border-ui-border ring-2 ring-transparent group-hover:ring-brand-pink/5 transition-all">
            <img src={`https://ui-avatars.com/api/?name=${user?.email}&background=random`} alt="user" className="w-full h-full object-cover" />
          </div>
          <ChevronDown size={14} className="text-ui-muted group-hover:text-brand-pink transition-all" />
        </div>
      </div>
    </header>
  );
}


import React from 'react';
import { LayoutDashboard, FolderKanban, Users, LogOut, ShieldCheck, ChevronLeft, ChevronRight, Phone } from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User;
  onLogout?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, currentUser, onLogout, collapsed = false, onToggleCollapse }) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Tổng quan' },
    { id: 'projects', icon: FolderKanban, label: 'Dự án' },
    { id: 'transactions', icon: Users, label: 'Giao dịch' },
    { id: 'admin', icon: ShieldCheck, label: 'Admin' },
  ];

  const availableItems = menuItems.filter(item => {
    const isElevated = currentUser.role === 'Admin' || currentUser.role === 'SuperAdmin';
    if (item.id === 'admin') return isElevated;
    if (isElevated) return true;
    return currentUser.permissions.includes(item.id);
  });

  return (
    <div
      className="h-screen fixed left-0 top-0 flex flex-col z-40 transition-all duration-300"
      style={{
        width: collapsed ? 72 : 256,
        background: 'linear-gradient(180deg, #005992 0%, #004070 35%, #5c2a4a 65%, #D71049 100%)',
      }}
    >
      {/* Logo + chi nhánh */}
      <div
        className={`pt-5 pb-5 flex border-b border-white/10 ${collapsed ? 'px-3' : 'px-5'} justify-center ${collapsed ? 'items-center' : 'flex-col items-center gap-2'}`}
        title={collapsed ? 'Chi Nhánh Đông Anh' : undefined}
      >
        {collapsed ? (
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">VTB</span>
          </div>
        ) : (
          <>
            <img
              src="/vietinbank-sidebar-logo.png"
              alt="VietinBank"
              className="h-11 w-auto object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                if (target.parentElement) {
                  const fallback = document.createElement('div');
                  fallback.className = 'flex items-center gap-1';
                  fallback.innerHTML = '<span style="color:white;font-weight:700;font-size:20px;letter-spacing:-0.5px">VietinBank eFAST</span>';
                  target.parentElement.insertBefore(fallback, target.nextSibling);
                }
              }}
            />
            <p className="text-center text-[11px] font-semibold text-white/95 leading-snug tracking-wide px-1">
              Chi Nhánh Đông Anh
            </p>
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className={`flex-1 space-y-0.5 mt-4 overflow-y-auto ${collapsed ? 'px-2' : 'px-3'}`}>
        {availableItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            title={collapsed ? item.label : undefined}
            className={`
              w-full flex items-center gap-3 rounded-lg text-[13px] font-medium transition-all duration-200
              ${collapsed ? 'justify-center px-0 py-2.5' : 'px-4 py-2.5'}
              ${activeTab === item.id
                ? 'bg-white/15 text-white shadow-sm shadow-black/10'
                : 'text-white/60 hover:bg-white/8 hover:text-white/90'}
            `}
          >
            <item.icon size={18} strokeWidth={1.8} className="flex-shrink-0" />
            {!collapsed && item.label}
          </button>
        ))}
      </nav>

      {/* Hotline */}
      {!collapsed && (
        <div className="px-5 py-3 border-t border-white/10 flex flex-col items-center text-center">
          <div className="flex items-center gap-2 text-white/40">
            <Phone size={13} strokeWidth={1.8} />
            <span className="text-[10px] font-medium">Hotline hỗ trợ</span>
          </div>
          <p className="text-white font-bold text-sm mt-0.5 tracking-wide">
            A Đức Huy - SĐT: 0866565689
          </p>
        </div>
      )}
      {collapsed && (
        <div className="px-2 py-3 border-t border-white/10 flex justify-center">
          <Phone size={16} className="text-white/40" strokeWidth={1.8} />
        </div>
      )}

      {/* User section */}
      <div className={`border-t border-white/10 ${collapsed ? 'p-2' : 'p-3 mx-2'}`}>
        <div
          onClick={onLogout}
          className={`flex items-center rounded-lg hover:bg-white/10 transition-all cursor-pointer group ${collapsed ? 'justify-center p-2' : 'gap-3 p-2'}`}
          title={collapsed ? `${currentUser.name} — Đăng xuất` : undefined}
        >
          <img src={currentUser.avatar} alt="User" className="w-9 h-9 rounded-full object-cover border-2 border-white/20 flex-shrink-0" />
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{currentUser.name}</p>
                <p className="text-[10px] text-white/50 truncate">{currentUser.role}</p>
              </div>
              <LogOut size={16} className="text-white/40 group-hover:text-red-400 transition-colors flex-shrink-0" strokeWidth={1.8} />
            </>
          )}
        </div>
      </div>

      {/* Collapse toggle — bottom */}
      <div className="border-t border-white/10">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center gap-2 py-3 text-white/50 hover:text-white hover:bg-white/8 transition-all duration-200"
          title={collapsed ? 'Mở rộng' : 'Thu gọn'}
        >
          {collapsed ? (
            <ChevronRight size={18} strokeWidth={2} />
          ) : (
            <>
              <ChevronLeft size={18} strokeWidth={2} />
              <span className="text-xs font-medium">Thu gọn</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

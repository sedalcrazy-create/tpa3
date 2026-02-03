import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useUIStore } from '../../store/uiStore';
import { MENU_ITEMS, type MenuItem } from '../../utils/constants';

function SidebarItem({ item, collapsed }: { item: MenuItem; collapsed: boolean }) {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  const isActive =
    location.pathname === item.path ||
    (item.path !== '/' && location.pathname.startsWith(item.path)) ||
    item.children?.some((c) => location.pathname === c.path || location.pathname.startsWith(c.path + '/'));

  if (hasChildren && !collapsed) {
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
            isActive
              ? 'bg-sidebar-active text-white'
              : 'text-gray-300 hover:bg-sidebar-hover hover:text-white'
          }`}
        >
          <item.icon className="w-5 h-5 shrink-0" />
          <span className="flex-1 text-start">{item.title}</span>
          <ChevronDownIcon
            className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </button>
        {open && (
          <div className="me-4 mt-1 space-y-1 border-e border-gray-600 pe-2">
            {item.children!.map((child) => (
              <NavLink
                key={child.path}
                to={child.path}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-sidebar-active text-white'
                      : 'text-gray-400 hover:bg-sidebar-hover hover:text-white'
                  }`
                }
              >
                {child.title}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={item.path}
      end={item.path === '/'}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
          isActive
            ? 'bg-sidebar-active text-white'
            : 'text-gray-300 hover:bg-sidebar-hover hover:text-white'
        }`
      }
      title={collapsed ? item.title : undefined}
    >
      <item.icon className="w-5 h-5 shrink-0" />
      {!collapsed && <span>{item.title}</span>}
    </NavLink>
  );
}

export default function Sidebar() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const mobileOpen = useUIStore((s) => s.sidebarMobileOpen);
  const closeMobile = useUIStore((s) => s.closeMobileSidebar);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <img src="/logo.jpg" alt="TPA3" className="h-8 w-8 rounded" />
            <span className="font-bold text-white text-sm">TPA3</span>
          </div>
        )}
        {collapsed && <img src="/logo.jpg" alt="TPA3" className="h-8 w-8 mx-auto rounded" />}
        <button onClick={closeMobile} className="lg:hidden text-gray-400 hover:text-white">
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {MENU_ITEMS.map((item) => (
          <SidebarItem key={item.path} item={item} collapsed={collapsed} />
        ))}
      </nav>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:block bg-sidebar shrink-0 transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-60'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={closeMobile} />
          <aside className="fixed inset-y-0 start-0 w-64 bg-sidebar z-50">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}

// Sidebar.txt
import { useState } from 'react';
import { Home, Package, LogOut, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  onLogout: () => void;
  onNavigate: (view: 'home' | 'products') => void;
  currentView: 'home' | 'products';
}

export function Sidebar({ onLogout, onNavigate, currentView }: SidebarProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div
      className={cn(
        'w-64 bg-white border-r h-full transition-all duration-300', // Keep fixed width on larger screens
        isSidebarOpen ? 'w-64' : 'w-0', // Full width when open, 0 when closed
        'sm:w-64' // Always full width on small and larger screens
      )}
      dir="rtl"
      lang="ar"
    >
      {/* Toggle Button (Visible on Small Screens) */}
      <Button
        variant="ghost"
        className="absolute top-2 right-2 sm:hidden" // Hide on small and larger screens
        onClick={toggleSidebar}
        size="icon"
      >
        <Menu className="h-6 w-6" />
      </Button>

      <div className={cn(
        "p-6",
        isSidebarOpen ? 'block' : 'hidden',
        'sm:block' // Always show on small screens and above
        )}>
        <h2 className="text-lg font-semibold text-gray-900 text-right">
          {`نظام تكامل قيود-المدفوعات`}
        </h2>
      </div>
      <nav className={cn(
        "space-y-2 px-4",
        isSidebarOpen ? 'block' : 'hidden',
        'sm:block' // Always show on small screens and above
        )}>
        <SidebarItem
          icon={Home}
          onClick={() => {
            onNavigate('home');
            setIsSidebarOpen(false); // Close sidebar on navigation (mobile)
          }}
          active={currentView === 'home'}
        >
          {`الرئيسية`}
        </SidebarItem>
        <SidebarItem
          icon={Package}
          onClick={() => {
            onNavigate('products');
            setIsSidebarOpen(false); // Close sidebar on navigation (mobile)
          }}
          active={currentView === 'products'}
        >
          {`حسابات المنتجات`}
        </SidebarItem>
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-50 flex-row-reverse"
          onClick={onLogout}
        >
          <LogOut className="ml-2 h-4 w-4" />
          {`تسجيل الخروج`}
        </Button>
      </nav>
    </div>
  );
}

interface SidebarItemProps {
  icon: React.ElementType;
  children: React.ReactNode;
  active?: boolean;
  onClick: () => void;
}

function SidebarItem({
  icon: Icon,
  children,
  active,
  onClick,
}: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center w-full px-4 py-2 text-sm font-medium rounded-md flex-row-reverse',
        active
          ? 'bg-gray-100 text-gray-900'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      )}
    >
      <Icon className="ml-3 h-4 w-4" />
      {children}
    </button>
  );
}
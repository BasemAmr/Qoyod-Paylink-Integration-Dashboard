import { Home, Package, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  onLogout: () => void;
  onNavigate: (view: 'home' | 'products') => void;
  currentView: 'home' | 'products';
}

export function Sidebar({ onLogout, onNavigate, currentView }: SidebarProps) {
  return (
    <div className="w-64 bg-white border-r h-full" dir="rtl" lang="ar"> {/* RTL and lang attributes */}
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 text-right">{`نظام تكامل قيود-المدفوعات`}</h2> {/* Arabic title */}
      </div>
      <nav className="space-y-2 px-4">
        <SidebarItem
          icon={Home}
          onClick={() => onNavigate('home')}
          active={currentView === 'home'}
        >
          {`الرئيسية`} {/* Arabic: Home */}
        </SidebarItem>
        <SidebarItem
          icon={Package}
          onClick={() => onNavigate('products')}
          active={currentView === 'products'}
        >
          {`حسابات المنتجات`} {/* Arabic: Product Accounts */}
        </SidebarItem>
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-50 flex-row-reverse" // Reversed flex direction for icon on left
          onClick={onLogout}
        >
          <LogOut className="ml-2 h-4 w-4" /> {/* Moved icon to the left using ml-2 */}
          {`تسجيل الخروج`} {/* Arabic: Logout */}
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

function SidebarItem({ icon: Icon, children, active, onClick }: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center w-full px-4 py-2 text-sm font-medium rounded-md flex-row-reverse', // Reversed flex direction for items
        active
          ? 'bg-gray-100 text-gray-900'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      )}
    >
      <Icon className="ml-3 h-4 w-4" /> {/* Adjusted margin for icon on the left */}
      {children}
    </button>
  );
}
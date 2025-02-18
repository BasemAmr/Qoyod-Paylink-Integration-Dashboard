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
    <div className="w-64 bg-white border-r h-full">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900">Qoyod-Payment Integration</h2>
      </div>
      <nav className="space-y-2 px-4">
        <SidebarItem 
          icon={Home} 
          onClick={() => onNavigate('home')} 
          active={currentView === 'home'}
        >
          Home
        </SidebarItem>
        <SidebarItem 
          icon={Package} 
          onClick={() => onNavigate('products')}
          active={currentView === 'products'}
        >
          Product Accounts
        </SidebarItem>
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          onClick={onLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
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
        'flex items-center w-full px-4 py-2 text-sm font-medium rounded-md',
        active
          ? 'bg-gray-100 text-gray-900'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      )}
    >
      <Icon className="mr-3 h-4 w-4" />
      {children}
    </button>
  );
}
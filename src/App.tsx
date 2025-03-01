// App.txt
import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ProductForm } from './components/ProductForm';
import { Login } from './components/Login';
import { cn } from './lib/utils';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'products'>('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Add sidebar state

  const toggleSidebar = () => {
      setIsSidebarOpen(!isSidebarOpen);
  };

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="flex h-screen bg-gray-100" dir="rtl" lang="ar">
      <Sidebar
        onLogout={() => setIsAuthenticated(false)}
        onNavigate={setCurrentView}
        currentView={currentView}
      />
      <div
        className={cn(
          'flex-1 transition-all duration-300', // Smooth transition
          isSidebarOpen ? 'sm:ml-64' : 'sm:ml-0', // Adjust margin based on sidebar
           // Apply margin on small and larger screens when sidebar is expanded
        )}
      >
        {currentView === 'home' ? <Dashboard /> : <ProductForm />}
      </div>
    </div>
  );
}

export default App;
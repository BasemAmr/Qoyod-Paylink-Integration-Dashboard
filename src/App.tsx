import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ProductForm } from './components/ProductForm';
import { Login } from './components/Login';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'products'>('home');

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="flex h-screen bg-gray-100" dir="rtl" lang="ar"> {/* Arabic and RTL added to the container */}
      <Sidebar
        onLogout={() => setIsAuthenticated(false)}
        onNavigate={setCurrentView}
        currentView={currentView}
      />
      {currentView === 'home' ? <Dashboard /> : <ProductForm />}
    </div>
  );
}

export default App;
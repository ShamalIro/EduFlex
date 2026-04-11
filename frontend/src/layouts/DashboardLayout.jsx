import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/ui/Sidebar';
import { TopBar } from '../components/ui/TopBar';

export function DashboardLayout({
  children,
  title = 'Dashboard'
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [cart, setCart] = useState([]);

  const addToCart = (course) => {
    if (!cart.find(c => c._id === course._id)) {
      setCart(prev => [...prev, course]);
    }
  };

  const removeFromCart = (courseId) => {
    setCart(prev => prev.filter(c => c._id !== courseId));
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar
          title={title}
          onMenuClick={() => setIsSidebarOpen(true)}
          cart={cart}
          onRemoveFromCart={removeFromCart}
        />

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children || (
              <Outlet context={{ cart, addToCart, removeFromCart }} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
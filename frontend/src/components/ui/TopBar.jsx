import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, Search, ShoppingCart, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Avatar } from './Avatar';
import client from '../../api/client';

export function TopBar({ title, onMenuClick, cart = [], onRemoveFromCart }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showCart, setShowCart] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await client.get('/notifications');
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await client.get('/notifications/unread-count');
      setUnreadCount(res.data.count || 0);
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const markAsRead = async (id) => {
    try {
      await client.put(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await client.put('/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await client.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
      fetchUnreadCount();
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const handleBellClick = () => {
    setShowNotifications(!showNotifications);
    setShowCart(false);
    if (!showNotifications) {
      fetchNotifications();
    }
  };

  // ✅ Added - Handle notification click
  const handleNotificationClick = (n) => {
    if (!n.is_read) markAsRead(n._id);
    if (n.link) {
      navigate(n.link);
      setShowNotifications(false);
    }
  };

  const handleCheckout = (course) => {
    setShowCart(false);
    navigate(`/student/payment/${course._id}`, {
      state: {
        courseTitle: course.title,
        amount: course.price || 49.99,
        thumbnail: course.thumbnail
      }
    });
  };

  const getTimeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
      <div className="flex items-center">
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 mr-2 text-slate-500 hover:bg-slate-100 rounded-lg lg:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-semibold text-slate-800">{title}</h1>
      </div>

      <div className="flex items-center space-x-4">
        <div className="hidden md:flex relative">
          <input
            type="text"
            placeholder="Search..."
            className="w-64 pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
        </div>

        {/* ✅ Cart Icon */}
        <div className="relative">
          <button
            onClick={() => { setShowCart(!showCart); setShowNotifications(false); }}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative"
          >
            <ShoppingCart className="h-5 w-5" />
            {cart.length > 0 && (
              <span className="absolute top-0.5 right-0.5 h-4 w-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </button>

          {showCart && (
            <div className="absolute right-0 top-12 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50">
              <div className="p-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-800 text-sm">
                  My Cart ({cart.length} {cart.length === 1 ? 'course' : 'courses'})
                </h3>
              </div>

              {cart.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-sm">
                  Your cart is empty
                </div>
              ) : (
                <>
                  <div className="max-h-64 overflow-y-auto">
                    {cart.map((course) => (
                      <div key={course._id} className="p-3 border-b border-slate-50 flex items-start gap-3">
                        <div className="w-12 h-10 bg-blue-600 rounded flex-shrink-0 flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-800 truncate">{course.title}</p>
                          <p className="text-xs text-blue-600 font-semibold mt-0.5">${course.price || '49.99'}</p>
                          <button
                            onClick={() => onRemoveFromCart && onRemoveFromCart(course._id)}
                            className="text-xs text-blue-500 hover:text-blue-700 hover:underline mt-0.5"
                          >
                            Remove from cart
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-slate-100">
                    <div className="flex justify-between text-sm font-semibold text-slate-800 mb-3">
                      <span>Total</span>
                      <span>${cart.reduce((sum, c) => sum + (c.price || 49.99), 0).toFixed(2)}</span>
                    </div>
                    <button
                      onClick={() => handleCheckout(cart[0])}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg text-sm transition"
                    >
                      Checkout
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* ✅ Notification Bell Icon */}
        <div className="relative">
          <button
            onClick={handleBellClick}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 h-4 w-4 bg-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-12 w-96 bg-white border border-slate-200 rounded-xl shadow-xl z-50">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-semibold text-slate-800">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm">No notifications yet</p>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n._id}
                      className={`p-4 border-b border-slate-50 flex items-start gap-3 hover:bg-slate-50 transition ${
                        !n.is_read ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-lg">
                        {n.icon || '🔔'}
                      </div>

                      {/* ✅ Updated - click → navigate */}
                      <div
                        className={`flex-1 min-w-0 ${n.link ? 'cursor-pointer' : ''}`}
                        onClick={() => handleNotificationClick(n)}
                      >
                        <p className={`text-sm font-medium text-slate-800 ${!n.is_read ? 'font-semibold' : ''}`}>
                          {n.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                        <p className="text-xs text-slate-400 mt-1">{getTimeAgo(n.createdAt)}</p>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        {!n.is_read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(n._id);
                          }}
                          className="text-slate-300 hover:text-red-400 transition"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="p-3 border-t border-slate-100 text-center">
                <button className="text-xs text-blue-600 hover:underline">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="h-8 w-px bg-slate-200 mx-2"></div>

        {user && (
          <div className="flex items-center">
            <div
              className="cursor-pointer hover:opacity-80"
              onClick={() => navigate('/profile')}
            >
              <Avatar name={`${user.first_name} ${user.last_name}`} src={user.avatar} size="sm" />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
import logo from '../../assets/logo.png';
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, LayoutDashboard, ChevronDown, Bell, Settings, MessageCircle, Globe } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import API from '../../Api';
import socket from '../../socket/Socket';
import { useTranslation } from 'react-i18next'; 

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout } = useAuth(); 
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(nextLang);
  };

  const navLinks = [
    { name: t('nav.home', 'Home'), path: '/' },
    { name: t('nav.howItWorks', 'How It Works'), path: '/how-it-works' },
    { name: t('nav.symptoms', 'Symptoms'), path: '/symptoms' },
    { name: t('nav.awareness', 'Awareness'), path: '/awareness' },
    { name: t('nav.about', 'About'), path: '/about' }
  ];

  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      setUnreadMessages(0);
      return;
    }

    const fetchUnreadCount = async () => {
      try {
        const res = await API.get("/api/v1/notifications/unread-count");
        setUnreadCount(res.data?.data?.unreadCount || 0);
      } catch (error) {
        console.error("Failed to load unread notifications:", error);
      }
    };

    const fetchUnreadMessages = async () => {
      try {
        const res = await API.get("/api/v1/chat/unread-count");
        setUnreadMessages(res.data?.data?.unreadCount || 0);
      } catch (error) {
        console.error("Failed to load unread messages:", error);
      }
    };

    const handleNewNotification = (notification: any) => {
      console.log("📢 New notification received:", notification);
      setUnreadCount((count) => count + 1);
    };

    const handleNotificationCountChanged = (event: Event) => {
      const nextCount = (event as CustomEvent<number>).detail;
      if (typeof nextCount === "number") {
        setUnreadCount(nextCount);
      } else {
        fetchUnreadCount();
      }
    };

    fetchUnreadCount();
    fetchUnreadMessages();
    socket.on("notification:new", handleNewNotification);
    socket.on("receiveMessage", fetchUnreadMessages);
    socket.on("message:unread", fetchUnreadMessages);
    window.addEventListener("notifications:count-changed", handleNotificationCountChanged);

    const interval = window.setInterval(fetchUnreadMessages, 60000);

    return () => {
      socket.off("notification:new", handleNewNotification);
      socket.off("receiveMessage", fetchUnreadMessages);
      socket.off("message:unread", fetchUnreadMessages);
      window.removeEventListener("notifications:count-changed", handleNotificationCountChanged);
      window.clearInterval(interval);
    };
  }, [user]);

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-16 h-16 bg-gradient-to-br rounded-xl flex items-center justify-center overflow-hidden">
              <img src={logo} alt="OralScan AI Logo" className="w-[60px] h-[60px] object-cover" />
            </div>
            <span className="font-bold text-2xl text-slate-900 hidden sm:block">OralScan AI</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(link.path) ? 'text-teal-600 bg-teal-50' : 'text-slate-600 hover:text-teal-600 hover:bg-slate-50'
                  }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth/Profile & Language Button */}
          <div className="hidden md:flex items-center gap-3">
            
            {/* 4. زرار تغيير اللغة لنسخة شاشات الكمبيوتر */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:text-teal-600 hover:bg-slate-50 border border-slate-200 transition-colors"
            >
              <Globe className="w-4 h-4" />
              <span>{i18n.language === 'en' ? 'العربية' : 'English'}</span>
            </button>

            {user ? (
              <>
                {/* Messages Button */}
                <Link
                  to={user.role === "doctor" ? "/doctor/messages" : "/patient/chat"}
                  className="relative p-2 rounded-lg hover:bg-slate-50 transition-colors"
                  aria-label="Messages"
                >
                  <MessageCircle className="w-5 h-5 text-slate-600" />
                  {unreadMessages > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unreadMessages > 99 ? "99+" : unreadMessages}
                    </span>
                  )}
                </Link>

                {/* Notifications Button */}
                <Link
                  to={`/${user.role}/notifications`}
                  className="relative p-2 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <Bell className="w-5 h-5 text-slate-600" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                      <span className="text-teal-700 font-semibold text-sm">
                        {user.fullName?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-slate-700">{user.fullName}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {isProfileOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="px-4 py-3 border-b border-slate-100">
                          <p className="text-sm font-medium text-slate-900">{user.fullName}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                          <p className="text-xs text-teal-600 mt-1 capitalize">{user.role}</p>
                        </div>

                        <Link
                          to={
                            user.role === 'doctor' ? '/doctor/dashboard' :
                              user.role === 'admin' ? '/admin/dashboard' :
                                '/patient/dashboard'
                          }
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4" /> Dashboard
                        </Link>

                        <Link
                          to={`/${user.role}/settings`}
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <Settings className="w-4 h-4" /> Settings
                        </Link>

                        <button
                          onClick={() => logout()}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation & Profile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white animate-in slide-in-from-top duration-200">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-base font-medium transition-colors ${isActive(link.path) ? 'text-teal-600 bg-teal-50' : 'text-slate-600 hover:text-teal-600 hover:bg-slate-50'
                  }`}
              >
                {link.name}
              </Link>
            ))}

            {/* 5. زرار تغيير اللغة لنسخة شاشات الموبايل */}
            <button
              onClick={() => {
                toggleLanguage();
                setIsMenuOpen(false);
              }}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-base font-medium text-slate-600 hover:text-teal-600 hover:bg-slate-50 border border-slate-100 transition-colors"
            >
              <Globe className="w-5 h-5 text-slate-500" />
              <span>{i18n.language === 'en' ? 'العربية' : 'English'}</span>
            </button>
          </div>

          <div className="px-4 py-3 border-t border-slate-100">
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                    <span className="text-teal-700 font-semibold">{user.fullName?.charAt(0).toUpperCase() || 'U'}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{user.fullName}</p>
                    <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                  </div>
                  {unreadCount > 0 && <Badge variant="danger" className="ml-auto">{unreadCount}</Badge>}
                </div>

                <Link
                  to={user.role === "doctor" ? "/doctor/messages" : "/patient/chat"}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <span className="relative inline-flex">
                    <MessageCircle className="w-4 h-4" />
                    {unreadMessages > 0 && (
                      <span className="absolute -right-2 -top-2 min-w-4 h-4 rounded-full bg-red-500 px-1 text-[9px] font-bold leading-4 text-white text-center">
                        {unreadMessages > 99 ? "99+" : unreadMessages}
                      </span>
                    )}
                  </span>
                  Messages
                </Link>

                <Link
                  to={`/${user.role}/notifications`}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <Bell className="w-4 h-4" /> Notifications
                </Link>

                <Link
                  to={user.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard'}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>

                <Link
                  to={`/${user.role}/settings`}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <Settings className="w-4 h-4" /> Settings
                </Link>

                <button
                  onClick={logout}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full text-left"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" fullWidth>Sign In</Button>
                </Link>
                <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                  <Button fullWidth>Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
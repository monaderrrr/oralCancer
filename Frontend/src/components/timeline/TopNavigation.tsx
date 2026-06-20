import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home,
  History,
  Upload,
  MessageCircle,
  Bell,
  Settings,
  CheckSquare
} from 'lucide-react';

import { Badge } from '../ui/Badge';
import API from '../../Api';
import socket from '../../socket/Socket'; 

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  badge?: number;
}

/* ================= LOCAL STORAGE ================= */
const getSeenAlerts = (): string[] => {
  return JSON.parse(localStorage.getItem('seen_alerts') || '[]');
};

const saveSeenAlerts = (ids: string[]) => {
  localStorage.setItem('seen_alerts', JSON.stringify(ids));
};

export function TopNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const [counts, setCounts] = useState({
    messages: 0,
    alerts: 0,
    actions: 0
  });

  /* ================= FETCH COUNTS ================= */
  const fetchBadgeCounts = async () => {
    try {
      /* ===== CHAT ===== */
      const chatRes = await API.get('/api/v1/chat/unread-count');
      const totalUnread = chatRes.data?.data?.unreadCount || 0;

      /* ===== SCANS / ALERTS ===== */
      const scanRes = await API.get('/api/v1/patient/scans/history?limit=100');
      const scans = scanRes.data?.data?.scans || [];

      const seen = getSeenAlerts();

      const unreadAlerts = scans.filter(
        (s: any) =>
          (s.riskLevel === 'high' || s.riskLevel === 'medium') &&
          !seen.includes(s._id)
      );

      /* ===== ACTIONS ===== */
     const actionRes = await API.get('/api/v1/patient/recommendations');

const actionsData = actionRes.data?.data;

const actions = Array.isArray(actionsData)
  ? actionsData
  : actionsData?.recommendations || [];

const pendingActions = actions.filter(
  (a: any) => a.status !== 'completed'
).length;

      setCounts({
        messages: totalUnread,
        alerts: unreadAlerts.length,
        actions: pendingActions
      });

    } catch (err) {
      console.error('Navigation badge error:', err);
    }
  };

  /* ================= INITIAL + SOCKET ================= */
  useEffect(() => {
    fetchBadgeCounts();

    /* 🔥 REAL-TIME SOCKET EVENTS */
    socket.on('new_message', fetchBadgeCounts);
    socket.on('new_alert', fetchBadgeCounts);
    socket.on('new_action', fetchBadgeCounts);

    const interval = setInterval(fetchBadgeCounts, 60000);

    return () => {
      clearInterval(interval);

      socket.off('new_message', fetchBadgeCounts);
      socket.off('new_alert', fetchBadgeCounts);
      socket.off('new_action', fetchBadgeCounts);
    };
  }, []);

  /* ================= MARK AS SEEN ================= */
  useEffect(() => {
    if (location.pathname === '/patient/notifications') {
      API.get('/api/v1/patient/scans/history?limit=100').then(res => {
        const scans = res.data?.data?.scans || [];

        const ids = scans
          .filter((s: any) => s.riskLevel === 'high' || s.riskLevel === 'medium')
          .map((s: any) => s._id);

        const prev = getSeenAlerts();
        const updated = Array.from(new Set([...prev, ...ids]));

        saveSeenAlerts(updated);

        setCounts(prev => ({ ...prev, alerts: 0 }));
      });
    }

    if (location.pathname === '/patient/chat') {
      setCounts(prev => ({ ...prev, messages: 0 }));
    }
  }, [location.pathname]);

  /* ================= NAV ITEMS ================= */
  const navItems: NavItem[] = [
    { icon: Home, label: 'Dashboard', path: '/patient/dashboard' },
    { icon: Upload, label: 'New Scan', path: '/patient/upload' },
    { icon: History, label: 'History', path: '/patient/medical-history' },

    {
      icon: CheckSquare,
      label: 'Actions',
      path: '/patient/recommendations',
      badge: counts.actions
    },

    {
      icon: MessageCircle,
      label: 'Messages',
      path: '/patient/chat',
      badge: counts.messages
    },

    {
      icon: Bell,
      label: 'Alerts',
      path: '/patient/notifications',
      badge: counts.alerts
    },

    { icon: Settings, label: 'Settings', path: '/patient/settings' }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* LOGO */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">OC</span>
            </div>
            <span className="font-bold text-slate-900 hidden sm:inline">
              Health Journey
            </span>
          </div>

          {/* NAV ITEMS */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`
                    relative px-3 py-2 rounded-lg flex items-center gap-2 transition-all
                    ${active
                      ? 'bg-teal-50 text-teal-700'
                      : 'text-slate-600 hover:bg-slate-50'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />

                  <span className="text-sm font-medium hidden lg:inline">
                    {item.label}
                  </span>

                  {item.badge ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 lg:relative"
                    >
                      <Badge variant="danger">
                        {item.badge > 9 ? '9+' : item.badge}
                      </Badge>
                    </motion.div>
                  ) : null}

                  {active && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600"
                      transition={{
                        type: 'spring',
                        stiffness: 380,
                        damping: 30
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>

        </div>
      </div>
    </motion.nav>
  );
}

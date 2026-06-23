import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useTranslation } from "react-i18next";
import { CheckCircle2, Calendar, MessageCircle, AlertCircle, ChevronRight } from 'lucide-react';

interface ActionItem {
  id: string;
  type: 'task' | 'appointment' | 'message';
  title: string;
  time?: string;
  urgent?: boolean;
}
interface TodaysActionsProps {
  tasks: ActionItem[];
  onActionClick?: (item: ActionItem) => void;
}

export function TodaysActions({
  tasks,
  onActionClick
}: TodaysActionsProps) {
  const { t } = useTranslation(); 
  const urgentCount = tasks.filter(t => t.urgent).length;
  
  const getIcon = (type: ActionItem['type']) => {
    switch (type) {
      case 'task': return CheckCircle2;
      case 'appointment': return Calendar;
      case 'message': return MessageCircle;
    }
  };
  const getIconColor = (type: ActionItem['type']) => {
    switch (type) {
      case 'task': return 'text-emerald-600';
      case 'appointment': return 'text-blue-600';
      case 'message': return 'text-violet-600';
    }
  };
  const getBgColor = (type: ActionItem['type']) => {
    switch (type) {
      case 'task': return 'bg-emerald-50';
      case 'appointment': return 'bg-blue-50';
      case 'message': return 'bg-violet-50';
    }
  };

  if (tasks.length === 0) {
    return <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Card className="p-6 bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-100 text-left">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">
                {t('todaysActions.empty.title', 'All Caught Up!')}
              </h3>
              <p className="text-sm text-slate-600">
                {t('todaysActions.empty.desc', 'No pending actions for today. Great job staying on top of your health.')}
              </p>
            </div>
          </div>
        </Card>
      </motion.div>;
  }

  return <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card className="p-6 border-2 border-slate-200 shadow-lg text-left">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {t('todaysActions.header', "Today's Actions")}
              </h2>
              <p className="text-sm text-slate-600">
                {tasks.length} {tasks.length === 1 ? t('todaysActions.item', 'item') : t('todaysActions.items', 'items')} {t('todaysActions.needAttention', 'need your attention')}
              </p>
            </div>
          </div>

          {urgentCount > 0 && <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}>
              <Badge variant="danger" className="gap-1">
                <AlertCircle className="w-3 h-3" />
                {urgentCount} {t('priority.high', 'Urgent')}
              </Badge>
            </motion.div>}
        </div>

        {/* Action Items */}
        <div className="space-y-3">
          {tasks.map((item, index) => {
          const Icon = getIcon(item.type);
          return <motion.div key={item.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: index * 0.05 }}>
                <button onClick={() => onActionClick?.(item)} className="w-full p-4 rounded-xl border-2 border-slate-100 hover:border-teal-200 hover:bg-slate-50 transition-all duration-200 text-left group">
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-lg ${getBgColor(item.type)} flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${getIconColor(item.type)}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-slate-900">
                          {item.title}
                        </h4>
                        {item.urgent && <Badge variant="danger" className="text-xs">
                            {t('priority.high', 'Urgent')}
                          </Badge>}
                      </div>
                      {item.time && <p className="text-sm text-slate-500">{item.time}</p>}
                    </div>

                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-teal-600 transition-colors flex-shrink-0" />
                  </div>
                </button>
              </motion.div>;
        })}
        </div>
      </Card>
    </motion.div>;
}
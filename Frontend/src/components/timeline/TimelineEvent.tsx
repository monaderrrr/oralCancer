import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { 
  Camera, 
  AlertCircle, 
  Calendar, 
  CheckSquare, 
  MessageCircle, 
  ChevronRight, 
  User 
} from 'lucide-react';

export type EventType = 'scan' | 'symptom' | 'appointment' | 'recommendation' | 'message';

export interface TimelineEventData {
  id: string;
  type: EventType;
  title: string;
  description: string;
  date: Date;
  status?: string;
  urgency?: 'low' | 'medium' | 'high';
  metadata?: {
    doctorName?: string;
    doctorImage?: string;
    scanId?: string;
    riskLevel?: string;
    diagnosis?: string;
    messageId?: string;
  };
}

interface TimelineEventProps {
  event: TimelineEventData;
  index: number;
  isLast?: boolean;
  onClick?: () => void;
}

const eventConfig = {
  scan: {
    icon: Camera,
    color: 'teal',
    bgColor: 'bg-teal-50',
    iconColor: 'text-teal-600',
    borderColor: 'border-teal-200',
    dotColor: 'bg-teal-500'
  },
  symptom: {
    icon: AlertCircle,
    color: 'amber',
    bgColor: 'bg-amber-50',
    iconColor: 'text-amber-600',
    borderColor: 'border-amber-200',
    dotColor: 'bg-amber-500'
  },
  appointment: {
    icon: Calendar,
    color: 'blue',
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600',
    borderColor: 'border-blue-200',
    dotColor: 'bg-blue-500'
  },
  recommendation: {
    icon: CheckSquare,
    color: 'emerald',
    bgColor: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    borderColor: 'border-emerald-200',
    dotColor: 'bg-emerald-500'
  },
  message: {
    icon: MessageCircle,
    color: 'violet',
    bgColor: 'bg-violet-50',
    iconColor: 'text-violet-600',
    borderColor: 'border-violet-200',
    dotColor: 'bg-violet-500'
  }
};

export function TimelineEvent({
  event,
  index,
  isLast = false,
  onClick
}: TimelineEventProps) {
  const config = eventConfig[event.type] || eventConfig.scan;
  const Icon = config.icon;

  const formatDate = (date: Date) => {
    const now = new Date();
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Recent';
    
    const diffTime = Math.abs(now.getTime() - d.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }} 
      whileInView={{ opacity: 1, x: 0 }} 
      viewport={{ once: true, margin: '-50px' }} 
      transition={{ duration: 0.4, delay: index * 0.05 }} 
      className="relative flex gap-6"
    >
      {/* Timeline Connector */}
      <div className="flex flex-col items-center flex-shrink-0">
        <motion.div 
          initial={{ scale: 0 }} 
          whileInView={{ scale: 1 }} 
          viewport={{ once: true }} 
          transition={{ duration: 0.3, delay: index * 0.05 + 0.2 }} 
          className={`w-4 h-4 rounded-full ${config.dotColor} ring-4 ring-white shadow-sm z-10`} 
        />
        {!isLast && (
          <motion.div 
            initial={{ height: 0 }} 
            whileInView={{ height: '100%' }} 
            viewport={{ once: true }} 
            transition={{ duration: 0.4, delay: index * 0.05 + 0.3 }} 
            className="w-0.5 bg-slate-200 flex-1 mt-2" 
          />
        )}
      </div>

      {/* Event Card */}
      <motion.div whileHover={onClick ? { y: -2 } : undefined} className="flex-1 pb-8">
        <Card 
          className={`p-5 border-l-4 ${config.borderColor} ${onClick ? 'cursor-pointer hover:shadow-md' : ''} transition-all`} 
          onClick={onClick}
        >
          <div className="flex items-start gap-4">
            {/* Icon Box */}
            <div className={`p-3 rounded-xl ${config.bgColor} flex-shrink-0`}>
              <Icon className={`w-5 h-5 ${config.iconColor}`} />
            </div>

            {/* Content Area */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 mb-1">
                <h3 className="font-bold text-slate-900 text-lg leading-tight">
                  {event.title}
                </h3>
                <span className="text-xs font-medium text-slate-400 whitespace-nowrap bg-slate-50 px-2 py-1 rounded">
                  {formatDate(event.date)}
                </span>
              </div>

              {/* --- Doctor Info Integration --- */}
              {event.metadata?.doctorName && (
                <div className="flex items-center gap-2 mb-2 bg-teal-50/50 w-fit px-2 py-1 rounded-md border border-teal-100">
                  <div className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center overflow-hidden">
                    {event.metadata.doctorImage ? (
                      <img src={event.metadata.doctorImage} alt="Dr" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-3 h-3 text-teal-600" />
                    )}
                  </div>
                  <span className="text-xs font-bold text-teal-700">
                    Dr. {event.metadata.doctorName}
                  </span>
                </div>
              )}

              <p className="text-slate-600 text-sm mb-3 line-clamp-2">
                {event.description}
              </p>

              {/* Status & Badges */}
              <div className="flex items-center gap-3 flex-wrap">
                {event.status && (
                  <Badge variant="secondary" className="text-[10px] uppercase tracking-wider px-2 py-0">
                    {event.status}
                  </Badge>
                )}

                {event.urgency && (
                  <Badge 
                    variant={event.urgency === 'high' ? 'destructive' : event.urgency === 'medium' ? 'warning' : 'secondary'} 
                    className="text-[10px] uppercase tracking-wider px-2 py-0"
                  >
                    {event.urgency} Risk
                  </Badge>
                )}

                {onClick && (
                  <button className="ml-auto text-xs text-teal-600 hover:text-teal-700 font-bold flex items-center gap-1 group">
                    View Details
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
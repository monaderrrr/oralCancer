import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  Camera,
  FileText
} from 'lucide-react';

/**
 * Backend Model
 * dashboard.service.js
 */
export interface Recommendation {
  _id: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  recommendationType: 'specialist-visit' | 'follow-up-scan' | 'routine-check';
  status: 'pending' | 'completed';
  createdAt: string;
}

interface RecommendationItemProps {
  recommendation: Recommendation;
  index?: number;
  onComplete?: (id: string) => void;
}

/**
 * Priority UI mapping
 */
const priorityConfig = {
  high: {
    icon: AlertTriangle,
    label: 'Urgent',
    badgeVariant: 'danger' as const,
    bg: 'bg-red-50',
    iconColor: 'text-red-600',
    border: 'border-red-200'
  },
  medium: {
    icon: Clock,
    label: 'Important',
    badgeVariant: 'warning' as const,
    bg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    border: 'border-amber-200'
  },
  low: {
    icon: CheckCircle2,
    label: 'Routine',
    badgeVariant: 'success' as const,
    bg: 'bg-slate-50',
    iconColor: 'text-slate-600',
    border: 'border-slate-200'
  }
};

/**
 * Type mapping (backend only — no booking logic)
 */
const typeConfig = {
  'specialist-visit': {
    label: 'Specialist Visit',
    icon: Calendar
  },
  'follow-up-scan': {
    label: 'Follow-up Scan',
    icon: Camera
  },
  'routine-check': {
    label: 'Routine Check',
    icon: FileText
  }
};

export function RecommendationItem({
  recommendation,
  index = 0,
  onComplete
}: RecommendationItemProps) {

  const priority = priorityConfig[recommendation.priority] || priorityConfig.low;
  const type = typeConfig[recommendation.recommendationType] || typeConfig['routine-check'];

  const PriorityIcon = priority.icon;
  const TypeIcon = type.icon;

  const date = new Date(recommendation.createdAt);
  const formattedDate = isNaN(date.getTime())
    ? recommendation.createdAt
    : date.toLocaleDateString();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card
        className={`p-5 border-l-4 ${priority.border} ${
          recommendation.status === 'completed' ? 'opacity-60' : ''
        }`}
      >

        <div className="flex items-start gap-4">

          {/* Priority Icon */}
          <div className={`p-3 rounded-xl ${priority.bg}`}>
            <PriorityIcon className={`w-5 h-5 ${priority.iconColor}`} />
          </div>

          <div className="flex-1">

            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-slate-900">
                {type.label}
              </h3>

              <Badge variant={priority.badgeVariant}>
                {priority.label}
              </Badge>
            </div>

            <p className="text-slate-600 mb-3">
              {recommendation.message}
            </p>

            <div className="flex items-center gap-3 text-sm text-slate-500 mb-4">

              <div className="flex items-center gap-1.5">
                <TypeIcon className="w-4 h-4" />
                {type.label}
              </div>

              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {formattedDate}
              </div>

            </div>

            {recommendation.status === 'pending' && onComplete && (
              <Button
                size="sm"
                onClick={() => onComplete(recommendation._id)}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                Mark Complete
              </Button>
            )}

            {recommendation.status === 'completed' && (
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm font-medium">Completed</span>
              </div>
            )}

          </div>
        </div>
      </Card>
    </motion.div>
  );
}
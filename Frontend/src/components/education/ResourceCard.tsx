import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Bookmark, PlayCircle, FileText, Image as ImageIcon } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { useTranslation } from "react-i18next";

/**
 * Backend-mapped Resource interface
 * (replace mockEducationData dependency)
 */
export interface Resource {
  _id: string;
  title: string;
  description: string;
  type: 'video' | 'article' | 'infographic';
  category: string;
  thumbnail: string;
  readTime: string;
  author: string;
  createdAt: string; // ISO from backend
  isBookmarked?: boolean;
}

interface ResourceCardProps {
  resource: Resource;
  onClick: () => void;
}

/**
 * Education Resource Card (Backend Driven)
 * No booking / appointment logic included
 */
export function ResourceCard({ resource, onClick }: ResourceCardProps) {
  const { t } = useTranslation();
  const getIcon = () => {
    switch (resource.type) {
      case 'video':
        return <PlayCircle className="w-5 h-5" />;
      case 'infographic':
        return <ImageIcon className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };
  const getResourceLabel = (type: string) => {
    switch (type) {
      case 'video':
        return t('resources.types.video', 'Video');
      case 'infographic':
        return t('resources.types.infographic', 'Infographic');
      default:
        return t('resources.types.article', 'Article');
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className="overflow-hidden cursor-pointer h-full flex flex-col group"
        onClick={onClick}
      >
        {/* Thumbnail */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={resource.thumbnail}
            alt={resource.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />

          {/* Bookmark (UI only — backend can later toggle) */}
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-sm">
            <Bookmark
              className={`w-4 h-4 transition-colors ${
                resource.isBookmarked ? 'text-teal-600' : 'text-slate-400'
              }`}
            />
          </div>

          {/* Category */}
          <div className="absolute bottom-3 left-3">
            <Badge variant="default" className="bg-white/90 text-slate-800">
              {resource.category}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-grow">
          
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-3 uppercase tracking-wider font-medium">
            <span className="flex items-center gap-1 text-teal-600">
              {getIcon()}
              {getResourceLabel(resource.type)}
            </span>

            <span>•</span>

            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {resource.readTime}
            </span>
          </div>

          <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-teal-600">
            {resource.title}
          </h3>

          <p className="text-slate-600 text-sm line-clamp-2 mb-4 flex-grow">
            {resource.description}
          </p>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
            <span className="text-xs text-slate-500">
              {t('resources.by', 'By')} {resource.author}
            </span>
            <span className="text-xs text-slate-400">
              {new Date(resource.createdAt).toLocaleDateString()}
            </span>
          </div>

        </div>
      </Card>
    </motion.div>
  );
}
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, BookOpen } from 'lucide-react';
import { TopNavigation } from '../../components/timeline/TopNavigation';
import { CategoryFilter } from '../../components/education/CategoryFilter';
import { ResourceCard } from '../../components/education/ResourceCard';
import { mockResources, categories } from '../../utils/mockEducationData';
import { Input } from '../../components/ui/Input';
import { useTranslation } from "react-i18next"; 

export function EducationPage() {
  const { t } = useTranslation(); 
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredResources = mockResources.filter(resource => {
    const matchesCategory = activeCategory === 'All' || resource.category === activeCategory;
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) || resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-12 text-left">
      <TopNavigation />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-teal-100 rounded-full mb-4">
            <BookOpen className="w-8 h-8 text-teal-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-3">
            {t("education.libraryTitle", "Health Education Library")}
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg leading-relaxed">
            {t("education.libraryDesc", "Empower yourself with knowledge. Explore our curated collection of articles, videos, and guides about oral health.")}
          </p>
        </motion.div>

        <div className="mb-8 max-w-xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input placeholder={t("education.searchPlaceholder", "Search for topics, symptoms, or treatments...")} className="pl-10 py-3 text-lg rounded-full shadow-sm border-slate-200 focus:border-teal-500 focus:ring-teal-500" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
        </div>

        <CategoryFilter categories={categories} activeCategory={activeCategory} onSelect={setActiveCategory} />

        <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6" initial="hidden" animate="visible" variants={{
        visible: {
          transition: {
            staggerChildren: 0.05
          }
        }
      }}>
          {filteredResources.length > 0 ? filteredResources.map(resource => <ResourceCard key={resource.id} resource={resource} onClick={() => {}} />) : <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-slate-500 text-lg font-medium">
                {t("education.noResources", "No resources found matching your criteria.")}
              </p>
            </div>}
        </motion.div>
      </div>
    </div>
  );
}
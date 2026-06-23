import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { TopNavigation } from '../../components/timeline/TopNavigation';
import { RecommendationItem } from '../../components/timeline/RecommendationItem';
import API from '../../Api';
import { useTranslation } from 'react-i18next'; // إضافة الترجمة

export function RecommendationsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation(); // تفعيل الترجمة

  const [items, setItems] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'symptom'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // ================= FETCH & PROCESS DATA =================
  const fetchHealthInsights = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await API.get('/api/v1/patient/recommendations');
      const { pending = [], completed = [] } = res.data?.data || {};

      // 1. Map Recommendations
      const recommendations = [...pending, ...completed].map((r: any) => ({
        ...r,
        _id: r._id || r.id,
        itemType: 'recommendation',
        isCompleted: completed.some((c: any) => c._id === (r._id || r.id)),
        urgency: (r.urgency || r.priority || 'low').toLowerCase(),
        sortDate: new Date(r.createdAt).getTime(),
      }));

      //  Extract Unique Symptoms from Scans
      const symptomsMap = new Map();
      recommendations.forEach((rec) => {
        const scan = rec.scanId;
        if (scan && (scan.lesionType || scan.aiResult?.diagnosis)) {
          const symptomId = `symp_${scan._id}`;
          
          if (!symptomsMap.has(symptomId)) {
            let displayTitle = "Routine Check"; 
            if (scan.riskLevel === "high") displayTitle = "Urgent Finding";
            else if (scan.riskLevel === "medium") displayTitle = "Important Finding";

            symptomsMap.set(symptomId, {
              _id: symptomId,
              itemType: 'symptom',
              title: displayTitle, 
              message: `Finding: ${scan.lesionType || 'Detected abnormality'} identified during oral scan.`,
              urgency: scan.riskLevel === 'high' ? 'high' : (scan.riskLevel === 'medium' ? 'medium' : 'low'),
              createdAt: scan.createdAt,
              sortDate: new Date(scan.createdAt).getTime(),
              isCompleted: false,
              metadata: scan
            });
          }
        }
      });

      const allItems = [...recommendations, ...Array.from(symptomsMap.values())];
      
      // Sort: Highest Urgency first, then by Date (Newest)
      allItems.sort((a, b) => {
        const priority: any = { high: 0, medium: 1, low: 2 };
        if (priority[a.urgency] !== priority[b.urgency]) {
          return priority[a.urgency] - priority[b.urgency];
        }
        return b.sortDate - a.sortDate;
      });

      setItems(allItems);
    } catch (err) {
      console.error("Error fetching health data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealthInsights();
  }, [fetchHealthInsights]);

  // ================= ACTION HANDLER =================
  const handleComplete = async (id: string) => {
    try {
      setActionLoadingId(id);
      await API.patch(`/api/v1/patient/recommendations/${id}/complete`);
      
      setItems((prev) =>
        prev.map((item) => {
          if (item._id === id) {
            return {
              ...item,
              isCompleted: true,
              itemType: 'symptom', // Transfer to Symptoms tab
              title: 'Resolved Recommendation',
              message: `Action taken for: ${item.message}`,
              urgency: 'low' // Reduce priority once resolved
            };
          }
          return item;
        })
      );
    } catch (err) {
      console.error("Failed to complete action:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // ================= COMPUTED DATA =================
  const filteredItems = items.filter((item) => {
    if (filter === 'active') return item.itemType === 'recommendation' && !item.isCompleted;
    if (filter === 'symptom') return item.itemType === 'symptom';
    return true;
  });

  const stats = {
    active: items.filter(i => i.itemType === 'recommendation' && !i.isCompleted).length,
    symptoms: items.filter(i => i.itemType === 'symptom').length,
    urgent: items.filter(i => i.urgency === 'high' && !i.isCompleted).length,
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <TopNavigation />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* HEADER */}
        <header className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/patient/dashboard')}
            className="mb-4 -ml-2 text-slate-500 hover:text-teal-600"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> {t('common.back', 'Back')}
          </Button>
          
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{t('recommendations.title', 'Health Insights')}</h1>
          <p className="text-slate-500 mt-1">{t('recommendations.subtitle', 'Personalized findings from your latest scans')}</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            <StatCard label={t('recommendations.activeTasks', 'Active Tasks')} value={stats.active} color="teal" />
            <StatCard label={t('recommendations.detectedSigns', 'Detected Signs')} value={stats.symptoms} color="amber" />
            <StatCard label={t('recommendations.criticalAlerts', 'Critical Alerts')} value={stats.urgent} color="rose" />
          </div>
        </header>

        {/* NAVIGATION TABS */}
        <nav className="flex p-1 bg-slate-200/50 rounded-2xl w-fit mb-8">
          {['all', 'active', 'symptom'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab as any)}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                filter === tab 
                ? 'bg-white text-teal-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {t(`recommendations.tabs.${tab}`, tab.charAt(0).toUpperCase() + tab.slice(1))}
            </button>
          ))}
        </nav>

        {/* LIST SECTION */}
        <section className="min-h-[400px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 opacity-50">
              <Loader2 className="w-8 h-8 animate-spin text-teal-600 mb-4" />
              <p className="text-sm font-medium text-slate-500">{t('recommendations.syncing', 'Syncing with AI records...')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {filteredItems.map((item, index) => (
                  <motion.div
                    key={item._id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <RecommendationItem
                      recommendation={item}
                      index={index}
                      isLoading={actionLoadingId === item._id}
                      onComplete={item.itemType === 'recommendation' ? handleComplete : undefined}
                      onViewDetails={(id) => navigate(`/patient/recommendations/${id}`)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>

              {filteredItems.length === 0 && <EmptyState filter={filter} onReset={() => setFilter('all')} />}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

// ================= SUB-COMPONENTS =================

function StatCard({ label, value, color }: any) {
  const colors: any = {
    teal: 'text-teal-600 bg-teal-50',
    amber: 'text-amber-600 bg-amber-50',
    rose: 'text-rose-600 bg-rose-50'
  };
  return (
    <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
      <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${colors[color].split(' ')[0]}`}>{value}</p>
    </div>
  );
}

function EmptyState({ filter, onReset }: any) {
  const { t } = useTranslation();
  return (
    <div className="text-center py-20 bg-white border border-dashed border-slate-300 rounded-3xl">
      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
        {filter === 'symptom' ? <AlertCircle className="w-8 h-8 text-slate-300" /> : <CheckCircle2 className="w-8 h-8 text-slate-300" />}
      </div>
      <h3 className="text-lg font-bold text-slate-900">{t('recommendations.allClear', 'All clear here!')}</h3>
      <p className="text-slate-500 max-w-xs mx-auto mb-6">{t('recommendations.noItemsFound', 'No items found in your history.')}</p>
      {filter !== 'all' && <Button onClick={onReset} variant="outline">{t('recommendations.viewAll', 'View All History')}</Button>}
    </div>
  );
}
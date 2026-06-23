import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  AlertCircleIcon,
  CircleDotIcon,
  ShieldIcon,
  StethoscopeIcon,
  ArrowRightIcon,
  TrendingUpIcon,
  UsersIcon,
  ClockIcon,
  CigaretteIcon,
  WineIcon,
  SunIcon,
  HeartIcon,
  AppleIcon,
  SmileIcon,
  CalendarIcon,
  BoxIcon
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { SymptomCard } from '../components/medical/SymptomCard';
import { useTranslation } from 'react-i18next';

export function AwarenessPage() {
  const { t } = useTranslation();

  const symptoms = [
    {
      icon: CircleDotIcon,
      title: 'Persistent Sores',
      description: 'Mouth sores that do not heal within 2-3 weeks',
      severity: 'warning' as const
    },
    {
      icon: AlertCircleIcon,
      title: 'White or Red Patches',
      description:
        'Unusual white (leukoplakia) or red (erythroplakia) patches on gums, tongue, or mouth lining',
      severity: 'warning' as const
    },
    {
      icon: CircleDotIcon,
      title: 'Lumps or Thickening',
      description: 'Unexplained lumps, bumps, or thickening of tissue in the mouth or neck',
      severity: 'warning' as const
    },
    {
      icon: AlertCircleIcon,
      title: 'Difficulty Swallowing',
      description: 'Persistent difficulty or pain when swallowing, chewing, or moving the jaw',
      severity: 'urgent' as const
    },
    {
      icon: CircleDotIcon,
      title: 'Numbness',
      description: 'Numbness or loss of feeling in the mouth, lips, or face',
      severity: 'urgent' as const
    },
    {
      icon: AlertCircleIcon,
      title: 'Voice Changes',
      description: 'Persistent hoarseness or changes in voice quality',
      severity: 'info' as const
    }
  ];

  const riskFactors = [
    {
      icon: CigaretteIcon,
      title: 'Tobacco Use',
      description: 'Smoking and smokeless tobacco significantly increase risk'
    },
    {
      icon: WineIcon,
      title: 'Alcohol Consumption',
      description: 'Heavy alcohol use, especially combined with tobacco'
    },
    {
      icon: BoxIcon,
      title: 'HPV Infection',
      description: 'Human papillomavirus (HPV) linked to oropharyngeal cancers'
    },
    {
      icon: SunIcon,
      title: 'Sun Exposure',
      description: 'Excessive sun exposure increases lip cancer risk'
    }
  ];

  const preventionTips = [
    {
      icon: CigaretteIcon,
      title: 'Quit Tobacco',
      description: 'Stop smoking and avoid all tobacco products'
    },
    {
      icon: WineIcon,
      title: 'Limit Alcohol',
      description: 'Reduce alcohol consumption or avoid entirely'
    },
    {
      icon: AppleIcon,
      title: 'Healthy Diet',
      description: 'Eat plenty of fruits and vegetables rich in antioxidants'
    },
    {
      icon: SunIcon,
      title: 'Sun Protection',
      description: 'Use lip balm with SPF and limit sun exposure'
    },
    {
      icon: SmileIcon,
      title: 'Oral Hygiene',
      description: 'Maintain good oral hygiene and dental care'
    },
    {
      icon: CalendarIcon,
      title: 'Regular Screenings',
      description: 'Get regular dental check-ups and oral cancer screenings'
    }
  ];

  const stats = [
    { value: '54,000+', label: 'New cases annually in the US' },
    { value: '65%', label: 'Survival rate when caught early' },
    { value: '2x', label: 'Higher risk with tobacco use' },
    { value: '50+', label: 'Age group most affected' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-right" dir="rtl">

      {/* HERO */}
      <section className="relative overflow-hidden py-20 lg:py-28">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-cyan-50 to-white" />
        <div className="relative max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-100 rounded-full text-teal-700 text-sm font-medium mb-6">
              <HeartIcon className="w-4 h-4" />
              {t('awareness.healthEdu', 'Health Education')}
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6">
              {t('awareness.heroTitle', 'Understanding Oral Cancer')}
            </h1>

            <p className="text-xl text-slate-600 leading-relaxed">
              {t(
                'awareness.heroSubtitle',
                'Knowledge is your first line of defense. Learn about the signs, risk factors, and prevention strategies for oral cancer.'
              )}
            </p>
          </motion.div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-12 bg-gradient-to-r from-teal-600 to-cyan-600">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div className="text-3xl sm:text-4xl font-bold mb-2">
                  {stat.value}
                </div>
                <div className="text-teal-100 text-sm">
                  {t(`awareness.stats.${index}.label`, stat.label)}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SYMPTOMS */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">

          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">
              {t('awareness.symptomsTitle', 'Symptoms to Watch For')}
            </h2>
            <p className="text-slate-600 mt-2">
              {t(
                'awareness.symptomsDesc',
                'Early detection significantly improves treatment outcomes. Be aware of these common symptoms.'
              )}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {symptoms.map((symptom, index) => (
              <SymptomCard
                key={index}
                {...symptom}
                title={t(`awareness.symptomsList.${index}.title`, symptom.title)}
                description={t(
                  `awareness.symptomsList.${index}.description`,
                  symptom.description
                )}
              />
            ))}
          </div>
        </div>
      </section>

      {/* RISK FACTORS */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-10">
            {t('awareness.riskFactors', 'Risk Factors')}
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {riskFactors.map((factor, index) => (
              <div key={index} className="bg-white p-6 rounded-xl">
                <h3 className="font-semibold">
                  {t(`awareness.riskList.${index}.title`, factor.title)}
                </h3>
                <p className="text-sm text-slate-600">
                  {t(`awareness.riskList.${index}.description`, factor.description)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PREVENTION */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-10">
            {t('awareness.preventionTips', 'Prevention Tips')}
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {preventionTips.map((tip, index) => (
              <div key={index} className="bg-emerald-50 p-5 rounded-xl">
                <h4 className="font-semibold">
                  {t(`awareness.preventionList.${index}.title`, tip.title)}
                </h4>
                <p className="text-sm text-slate-600">
                  {t(`awareness.preventionList.${index}.description`, tip.description)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-slate-50">
        <div className="text-center">
          <Link to="/upload">
            <Button>
              {t('awareness.getScreened', 'Get Screened Now')}
              <ArrowRightIcon className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* WHEN TO SEE DOCTOR */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100"
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center flex-shrink-0">
                <StethoscopeIcon className="w-6 h-6 text-teal-600" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  {t('awareness.whenToSeeDoctor', 'When to See a Doctor')}
                </h2>

                <p className="text-slate-600">
                  {t(
                    'awareness.doctorDesc',
                    "Don't wait if you notice any concerning symptoms. Early consultation can make a significant difference."
                  )}
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              {[1, 2, 3, 4, 5, 6].map((num, index) => (
                <motion.div
                  key={num}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-teal-600 text-sm font-medium">
                      {index + 1}
                    </span>
                  </div>

                  <span className="text-slate-700">
                    {t(`awareness.doctorPoints.${index}`, '')}
                  </span>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {/* ✅ FIXED HERE */}
              <Link to="/patient/doctors" className="flex-1">
                <Button className="w-full px-6 py-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl shadow-lg">
                  {t('awareness.findSpecialist', 'Find a Specialist')}
                  <UsersIcon className="w-5 h-5 ml-2" />
                </Button>
              </Link>

              <Link to="/upload" className="flex-1">
                <Button
                  variant="secondary"
                  className="w-full px-6 py-4 border-2 border-slate-200 rounded-xl"
                >
                  <ArrowRightIcon className="w-5 h-5 mr-2" />
                  {t('awareness.getScreened', 'Get Screened Now')}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
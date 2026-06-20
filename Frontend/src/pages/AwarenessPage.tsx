import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AlertCircleIcon, CircleDotIcon, ShieldIcon, StethoscopeIcon, ArrowRightIcon, TrendingUpIcon, UsersIcon, ClockIcon, CigaretteIcon, WineIcon, SunIcon, HeartIcon, AppleIcon, SmileIcon, CalendarIcon, BoxIcon } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { SymptomCard } from '../components/medical/SymptomCard';
export function AwarenessPage() {
  const symptoms = [{
    icon: CircleDotIcon,
    title: 'Persistent Sores',
    description: 'Mouth sores that do not heal within 2-3 weeks',
    severity: 'warning' as const
  }, {
    icon: AlertCircleIcon,
    title: 'White or Red Patches',
    description: 'Unusual white (leukoplakia) or red (erythroplakia) patches on gums, tongue, or mouth lining',
    severity: 'warning' as const
  }, {
    icon: CircleDotIcon,
    title: 'Lumps or Thickening',
    description: 'Unexplained lumps, bumps, or thickening of tissue in the mouth or neck',
    severity: 'warning' as const
  }, {
    icon: AlertCircleIcon,
    title: 'Difficulty Swallowing',
    description: 'Persistent difficulty or pain when swallowing, chewing, or moving the jaw',
    severity: 'urgent' as const
  }, {
    icon: CircleDotIcon,
    title: 'Numbness',
    description: 'Numbness or loss of feeling in the mouth, lips, or face',
    severity: 'urgent' as const
  }, {
    icon: AlertCircleIcon,
    title: 'Voice Changes',
    description: 'Persistent hoarseness or changes in voice quality',
    severity: 'info' as const
  }];
  const riskFactors = [{
    icon: CigaretteIcon,
    title: 'Tobacco Use',
    description: 'Smoking and smokeless tobacco significantly increase risk'
  }, {
    icon: WineIcon,
    title: 'Alcohol Consumption',
    description: 'Heavy alcohol use, especially combined with tobacco'
  }, {
    icon: BoxIcon,
    title: 'HPV Infection',
    description: 'Human papillomavirus (HPV) linked to oropharyngeal cancers'
  }, {
    icon: SunIcon,
    title: 'Sun Exposure',
    description: 'Excessive sun exposure increases lip cancer risk'
  }];
  const preventionTips = [{
    icon: CigaretteIcon,
    title: 'Quit Tobacco',
    description: 'Stop smoking and avoid all tobacco products'
  }, {
    icon: WineIcon,
    title: 'Limit Alcohol',
    description: 'Reduce alcohol consumption or avoid entirely'
  }, {
    icon: AppleIcon,
    title: 'Healthy Diet',
    description: 'Eat plenty of fruits and vegetables rich in antioxidants'
  }, {
    icon: SunIcon,
    title: 'Sun Protection',
    description: 'Use lip balm with SPF and limit sun exposure'
  }, {
    icon: SmileIcon,
    title: 'Oral Hygiene',
    description: 'Maintain good oral hygiene and dental care'
  }, {
    icon: CalendarIcon,
    title: 'Regular Screenings',
    description: 'Get regular dental check-ups and oral cancer screenings'
  }];
  const stats = [{
    value: '54,000+',
    label: 'New cases annually in the US'
  }, {
    value: '65%',
    label: 'Survival rate when caught early'
  }, {
    value: '2x',
    label: 'Higher risk with tobacco use'
  }, {
    value: '50+',
    label: 'Age group most affected'
  }];
  return <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 lg:py-28">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-cyan-50 to-white" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-100 rounded-full text-teal-700 text-sm font-medium mb-6">
              <HeartIcon className="w-4 h-4" />
              Health Education
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6">
              Understanding Oral Cancer
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed">
              Knowledge is your first line of defense. Learn about the signs,
              risk factors, and prevention strategies for oral cancer.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-12 bg-gradient-to-r from-teal-600 to-cyan-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            {stats.map((stat, index) => <motion.div key={stat.label} initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            delay: index * 0.1
          }}>
                <div className="text-3xl sm:text-4xl font-bold mb-2">
                  {stat.value}
                </div>
                <div className="text-teal-100 text-sm">{stat.label}</div>
              </motion.div>)}
          </div>
        </div>
      </section>

      {/* Symptoms Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 rounded-full text-amber-700 text-sm font-medium mb-4">
              <AlertCircleIcon className="w-4 h-4" />
              Warning Signs
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Symptoms to Watch For
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Early detection significantly improves treatment outcomes. Be
              aware of these common symptoms.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {symptoms.map((symptom, index) => <SymptomCard key={symptom.title} {...symptom} index={index} />)}
          </div>

          <motion.div initial={{
          opacity: 0
        }} whileInView={{
          opacity: 1
        }} viewport={{
          once: true
        }} className="mt-8 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800">
                <strong>Important:</strong> If you experience any of these
                symptoms for more than 2-3 weeks, consult a healthcare
                professional immediately. Early detection is crucial for
                successful treatment.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Risk Factors */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-200 rounded-full text-slate-700 text-sm font-medium mb-4">
              <TrendingUpIcon className="w-4 h-4" />
              Risk Assessment
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Risk Factors
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Understanding your risk factors can help you make informed
              decisions about your health.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {riskFactors.map((factor, index) => <motion.div key={factor.title} initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            delay: index * 0.1
          }} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-4">
                  <factor.icon className="w-6 h-6 text-slate-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">
                  {factor.title}
                </h3>
                <p className="text-sm text-slate-600">{factor.description}</p>
              </motion.div>)}
          </div>
        </div>
      </section>

      {/* Prevention */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 rounded-full text-emerald-700 text-sm font-medium mb-4">
              <ShieldIcon className="w-4 h-4" />
              Prevention
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Prevention Tips
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Many oral cancers can be prevented through lifestyle changes and
              regular screenings.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {preventionTips.map((tip, index) => <motion.div key={tip.title} initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            delay: index * 0.1
          }} className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <tip.icon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">
                      {tip.title}
                    </h4>
                    <p className="text-sm text-slate-600">{tip.description}</p>
                  </div>
                </div>
              </motion.div>)}
          </div>
        </div>
      </section>

      {/* When to See a Doctor */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center flex-shrink-0">
                <StethoscopeIcon className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  When to See a Doctor
                </h2>
                <p className="text-slate-600">
                  Don't wait if you notice any concerning symptoms. Early
                  consultation can make a significant difference.
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              {["Any mouth sore that doesn't heal within 2-3 weeks", 'Unexplained bleeding in the mouth', 'Difficulty swallowing or persistent sore throat', 'A lump or thickening in the cheek or neck', 'Numbness in the tongue or other areas of the mouth', 'White or red patches on the gums, tongue, or mouth lining'].map((item, index) => <motion.div key={index} initial={{
              opacity: 0,
              x: -10
            }} whileInView={{
              opacity: 1,
              x: 0
            }} viewport={{
              once: true
            }} transition={{
              delay: index * 0.1
            }} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-teal-600 text-sm font-medium">
                      {index + 1}
                    </span>
                  </div>
                  <span className="text-slate-700">{item}</span>
                </motion.div>)}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/upload" className="flex-1">
                <Button className="w-full px-6 py-4 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white rounded-xl shadow-lg shadow-teal-500/25">
                  Get Screened Now
                  <ArrowRightIcon className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/contact" className="flex-1">
                <Button variant="secondary" className="w-full px-6 py-4 border-2 border-slate-200 rounded-xl">
                  <UsersIcon className="w-5 h-5 mr-2" />
                  Find a Specialist
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>;
}
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HeartIcon, ShieldCheckIcon, BrainIcon, LockIcon, UsersIcon, AwardIcon, GlobeIcon, ArrowRightIcon, CheckCircleIcon, ServerIcon, EyeOffIcon, TrashIcon } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useTranslation } from 'react-i18next'; 

export function AboutPage() {
  const { t } = useTranslation(); 

  const values = [{
    icon: HeartIcon,
    title: 'Patient-First Approach',
    description: 'Every decision we make prioritizes the health and well-being of our users.'
  }, {
    icon: ShieldCheckIcon,
    title: 'Clinical Accuracy',
    description: 'Our AI is rigorously validated against expert diagnoses to ensure reliability.'
  }, {
    icon: LockIcon,
    title: 'Privacy & Security',
    description: 'Your health data is protected with enterprise-grade security and encryption.'
  }, {
    icon: GlobeIcon,
    title: 'Accessibility',
    description: 'Making early detection available to everyone, regardless of location or resources.'
  }];
  const team = [{
    name: 'Dr. Sarah Chen',
    role: 'Chief Medical Officer',
    specialty: 'Oral Oncology'
  }, {
    name: 'Dr. Michael Roberts',
    role: 'Head of AI Research',
    specialty: 'Machine Learning'
  }, {
    name: 'Dr. Emily Watson',
    role: 'Clinical Director',
    specialty: 'Pathology'
  }, {
    name: 'James Liu',
    role: 'Chief Technology Officer',
    specialty: 'Healthcare Tech'
  }];
  const partners = ['Stanford Medical Center', 'Mayo Clinic', 'Johns Hopkins Medicine', 'Cleveland Clinic', 'MD Anderson Cancer Center', 'Memorial Sloan Kettering'];
  const privacyFeatures = [{
    icon: ServerIcon,
    title: 'No Data Storage',
    description: 'Images are processed in real-time and immediately deleted. We never store your photos.'
  }, {
    icon: LockIcon,
    title: 'End-to-End Encryption',
    description: 'All data transmission is encrypted using industry-standard TLS 1.3 protocols.'
  }, {
    icon: EyeOffIcon,
    title: 'Anonymous Processing',
    description: 'No personal identifiers are attached to your scans. Complete anonymity guaranteed.'
  }, {
    icon: TrashIcon,
    title: 'Right to Delete',
    description: 'Request deletion of any data at any time. Full compliance with GDPR and CCPA.'
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
            {t('about.mission', 'Our Mission')}
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6">
            {t('about.heroTitle', 'Saving Lives Through Early Detection')}
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed">
            {t('about.heroDescription', "We're on a mission to make oral cancer screening accessible to everyone. By combining cutting-edge AI with medical expertise, we're empowering people to take control of their health.")}
          </p>
        </motion.div>
      </div>
    </section>

    {/* Mission Statement */}
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{
            opacity: 0,
            x: -20
          }} whileInView={{
            opacity: 1,
            x: 0
          }} viewport={{
            once: true
          }}>
            <h2 className="text-3xl font-bold text-slate-900 mb-6">
              {t('about.whyTitle', 'Why We Built This')}
            </h2>
            <div className="space-y-4 text-lg text-slate-600 leading-relaxed">
              <p>
                {t('about.whyText1', 'Oral cancer affects over 50,000 people in the Egypt alone each year. When detected early, the survival rate exceeds 80%. Yet many cases go undiagnosed until advanced stages due to limited access to regular screenings.')}
              </p>
              <p>
                {t('about.whyText2', 'We believe that everyone deserves access to early detection tools, regardless of their location, income, or access to healthcare. Our AI-powered screening platform bridges this gap, providing instant, accurate risk assessments from the comfort of your home.')}
              </p>
              <p>
                {t('about.whyText3', "Our technology doesn't replace professional medical care—it complements it by helping identify potential concerns early, when treatment is most effective.")}
              </p>
            </div>
          </motion.div>

          <motion.div initial={{
            opacity: 0,
            x: 20
          }} whileInView={{
            opacity: 1,
            x: 0
          }} viewport={{
            once: true
          }} className="grid grid-cols-2 gap-4">
            {values.map((value, index) => <motion.div key={value.title} initial={{
              opacity: 0,
              y: 20
            }} whileInView={{
              opacity: 1,
              y: 0
            }} viewport={{
              once: true
            }} transition={{
              delay: index * 0.1
            }} className="bg-slate-50 rounded-2xl p-6">
              <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center mb-4">
                <value.icon className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">
                {t(`about.values.${index}.title`, value.title)}
              </h3>
              <p className="text-sm text-slate-600">{t(`about.values.${index}.description`, value.description)}</p>
            </motion.div>)}
          </motion.div>
        </div>
      </div>
    </section>

    {/* Privacy & Security */}
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
            <LockIcon className="w-4 h-4" />
            {t('about.privacyFirst', 'Privacy First')}
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            {t('about.dataProtected', 'Your Data, Protected')}
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            {t('about.privacyDesc', "We take your privacy seriously. Here's how we protect your information.")}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {privacyFeatures.map((feature, index) => <motion.div key={feature.title} initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            delay: index * 0.1
          }} className="bg-slate-50 rounded-2xl p-6">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-4">
              <feature.icon className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">
              {t(`about.privacyFeatures.${index}.title`, feature.title)}
            </h3>
            <p className="text-sm text-slate-600">{t(`about.privacyFeatures.${index}.description`, feature.description)}</p>
          </motion.div>)}
        </div>

        <motion.div initial={{
          opacity: 0
        }} whileInView={{
          opacity: 1
        }} viewport={{
          once: true
        }} className="mt-8 flex flex-wrap justify-center gap-4">
          {['HIPAA Compliant', 'GDPR Compliant', 'SOC 2 Type II', 'ISO 27001'].map(cert => <div key={cert} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full">
            <AwardIcon className="w-4 h-4 text-teal-600" />
            <span className="text-sm font-medium text-slate-700">
              {cert}
            </span>
          </div>)}
        </motion.div>
      </div>
    </section>

    {/* Team */}
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
            <UsersIcon className="w-4 h-4" />
            {t('about.ourTeam', 'Our Team')}
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            {t('about.ledByExperts', 'Led by Experts')}
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            {t('about.teamDesc', 'Our team combines decades of experience in medicine, AI research, and healthcare technology.')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((member, index) => <motion.div key={member.name} initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            delay: index * 0.1
          }} className="bg-white rounded-2xl p-6 text-center shadow-sm border border-slate-100">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-100 to-cyan-100 flex items-center justify-center mx-auto mb-4">
              <UsersIcon className="w-8 h-8 text-teal-600" />
            </div>
            <h3 className="font-semibold text-slate-900">{member.name}</h3>
            <p className="text-teal-600 text-sm mb-1">{t(`about.team.${index}.role`, member.role)}</p>
            <p className="text-slate-500 text-xs">{t(`about.team.${index}.specialty`, member.specialty)}</p>
          </motion.div>)}
        </div>
      </div>
    </section>

    {/* Partners */}
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
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            {t('about.partners', 'Trusted Partners')}
          </h2>
          <p className="text-lg text-slate-600">
            {t('about.partnersDesc', 'Collaborating with leading medical institutions worldwide')}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {partners.map((partner, index) => <motion.div key={partner} initial={{
            opacity: 0
          }} whileInView={{
            opacity: 1
          }} viewport={{
            once: true
          }} transition={{
            delay: index * 0.05
          }} className="bg-slate-50 rounded-xl p-4 text-center">
            <p className="text-sm font-medium text-slate-700">{partner}</p>
          </motion.div>)}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="py-20 bg-gradient-to-r from-teal-600 to-cyan-600">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
        <motion.div initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }}>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            {t('about.ctaTitle', 'Join Us in the Fight Against Oral Cancer')}
          </h2>
          <p className="text-xl text-teal-100 mb-8 max-w-2xl mx-auto">
            {t('about.ctaSubtitle', 'Take the first step towards better oral health. Get your free screening today.')}
          </p>
          <Link to="/upload">
            <Button className="group px-10 py-4 text-lg bg-white !text-teal-700 hover:bg-teal-300 hover:!text-white rounded-xl shadow-lg">
              {t('about.ctaButton', 'Start Your Free Scan')}
              <ArrowRightIcon className="w-5 h-5 ml-2 group-text-teal-700" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  </div>;
}
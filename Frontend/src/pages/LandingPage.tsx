import React from 'react';
import logo from '../assets/logo.png';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ShieldCheckIcon,
  ZapIcon,
  UsersIcon,
  CameraIcon,
  BrainIcon,
  FileTextIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  LockIcon,
  AwardIcon
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useState } from "react";
import { ChevronDownIcon } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { FeatureCard } from '../components/medical/FeatureCard';
import { useTranslation } from "react-i18next";

export function LandingPage() {
  const { t } = useTranslation();

  const features = [{
    icon: BrainIcon,
    title: t("landing.features.1.title", 'AI-Powered Analysis'),
    description: t("landing.features.1.desc", 'Advanced machine learning algorithms trained on thousands of clinical images for accurate early detection.')
  }, {
    icon: ZapIcon,
    title: t("landing.features.2.title", 'Results in Seconds'),
    description: t("landing.features.2.desc", 'Get your risk assessment within moments. No waiting, no appointments needed for initial screening.')
  }, {
    icon: ShieldCheckIcon,
    title: t("landing.features.3.title", 'Expert Guidance'),
    description: t("landing.features.3.desc", 'Receive personalized recommendations and connect with healthcare professionals when needed.')
  }];

  const steps = [{
    icon: CameraIcon,
    title: t("landing.steps.1.title", 'Take a Photo'),
    description: t("landing.steps.1.desc", 'Capture a clear image of your oral cavity')
  }, {
    icon: BrainIcon,
    title: t("landing.steps.2.title", 'AI Analysis'),
    description: t("landing.steps.2.desc", 'Our AI examines the image for indicators')
  }, {
    icon: FileTextIcon,
    title: t("landing.steps.3.title", 'Get Results'),
    description: t("landing.steps.3.desc", 'Receive your risk assessment and guidance')
  }];

  const trustBadges = [{
    icon: LockIcon,
    label: t("landing.trust.1", 'HIPAA Compliant')
  }, {
    icon: ShieldCheckIcon,
    label: t("landing.trust.2", 'Data Encrypted')
  }, {
    icon: AwardIcon,
    label: t("landing.trust.3", 'Clinically Validated')
  }];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-cyan-50 to-white" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-teal-100/50 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-32 lg:pb-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-100 rounded-full text-teal-700 text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
                {t("landing.heroBadge", "AI-Powered Early Detection")}
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
                {t("landing.heroTitle1", "Early Detection")}
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600">
                  {t("landing.heroTitle2", "Saves Lives")}
                </span>
              </h1>

              <p className="text-xl text-slate-600 mb-8 leading-relaxed max-w-lg">
                {t(
                  "landing.heroDesc",
                  "Screen for oral cancer risk in seconds using our advanced AI technology. Fast, private, and designed to help you take control of your health."
                )}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link to="/upload">
                  <Button className="w-full sm:w-auto px-8 py-4 text-lg bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white rounded-xl shadow-lg shadow-teal-500/25">
                    {t("landing.startScan", "Start Free Scan")}
                    <ArrowRightIcon className="w-5 h-5 ml-2" />
                  </Button>
                </Link>

                <Link to="/how-it-works">
                  <Button variant="secondary" className="w-full sm:w-auto px-8 py-4 text-lg border-2 border-slate-200 hover:border-teal-300 rounded-xl">
                    {t("landing.howItWorks", "Learn How It Works")}
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap gap-4">
                {trustBadges.map((badge) => (
                  <div key={badge.label} className="flex items-center gap-2 text-sm text-slate-600">
                    <badge.icon className="w-4 h-4 text-teal-600" />
                    <span>{badge.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative w-full aspect-square max-w-lg mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-3xl rotate-6 opacity-20" />
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-3xl -rotate-3 opacity-30" />
                <div className="relative bg-white rounded-3xl shadow-2xl p-8 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-64 h-64 mx-auto mb-6 rounded-full flex items-center justify-center overflow-hidden">
                      <img src={logo} alt="OralScan AI Logo" className="w-full h-full object-cover scale-90" />
                    </div>

                    <h3 className="text-2xl font-bold text-slate-900 mb-2">
                      {t("landing.aiScreening", "AI Screening")}
                    </h3>
                    <p className="text-slate-600">
                      {t("landing.aiPowered", "Powered by advanced machine learning")}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              {t("landing.featuresTitle", "Why Choose Our Platform")}
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              {t(
                "landing.featuresDesc",
                "Combining cutting-edge AI technology with medical expertise to provide reliable early detection screening."
              )}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={feature.title} {...feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FAQAccordion />
    </div>
  );
}

function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { t } = useTranslation();

  const faqs = [
    {
      q: t("landing.faq.1.q", "Is this a medical diagnosis?"),
      a: t("landing.faq.1.a", "No. This tool provides a risk assessment only and should not replace professional medical advice.")
    },
    {
      q: t("landing.faq.2.q", "How accurate is the AI analysis?"),
      a: t("landing.faq.2.a", "Our AI is trained on thousands of clinical images and provides high accuracy for early screening.")
    }
  ];

  return (
    <div className="space-y-4 max-w-4xl mx-auto px-4 py-20">
      <h2 className="text-3xl font-bold text-center">
        {t("landing.faqTitle", "Frequently Asked Questions")}
      </h2>

      {faqs.map((item, i) => {
        const isOpen = openIndex === i;

        return (
          <div key={i} className="border rounded-xl bg-slate-50 overflow-hidden">
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="w-full flex justify-between p-6"
            >
              {item.q}

              <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
                <ChevronDownIcon className="w-5 h-5" />
              </motion.div>
            </button>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-6 pb-6"
                >
                  <p>{item.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
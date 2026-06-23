import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  CameraIcon,
  UploadCloudIcon,
  BrainIcon,
  FileTextIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  LockIcon,
  ServerIcon,
  CheckCircleIcon,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { StepCard } from "../components/medical/StepCard";
import { useTranslation } from "react-i18next"; // إضافة مكتبة الترجمة

export function HowItWorksPage() {
  const { t } = useTranslation(); // تفعيل الترجمة

  const steps = [
    {
      step: 1,
      icon: CameraIcon,
      title: t("howItWorks.steps.1.title", "Capture Your Image"),
      description: t("howItWorks.steps.1.desc", "Take a clear photo of your oral cavity using your smartphone or upload an existing image. Our guidelines help you capture the best possible image for accurate analysis."),
    },
    {
      step: 2,
      icon: UploadCloudIcon,
      title: t("howItWorks.steps.2.title", "Secure Upload"),
      description: t("howItWorks.steps.2.desc", "Your image is securely uploaded using end-to-end encryption. We never store your personal data, and images are processed in real-time then immediately deleted."),
    },
    {
      step: 3,
      icon: BrainIcon,
      title: t("howItWorks.steps.3.title", "AI Analysis"),
      description: t("howItWorks.steps.3.desc", "Our advanced machine learning model, trained on thousands of clinical images, analyzes your photo for potential indicators of oral cancer and other abnormalities."),
    },
    {
      step: 4,
      icon: FileTextIcon,
      title: t("howItWorks.steps.4.title", "Receive Results"),
      description: t("howItWorks.steps.4.desc", "Get your comprehensive risk assessment with clear explanations, personalized recommendations, and guidance on next steps based on your results."),
    },
  ];
  const techFeatures = [
    {
      icon: BrainIcon,
      title: t("howItWorks.tech.1.title", "Deep Learning Model"),
      description: t("howItWorks.tech.1.desc", "Convolutional neural network trained on 100,000+ annotated clinical images"),
    },
    {
      icon: ShieldCheckIcon,
      title: t("howItWorks.tech.2.title", "95% Accuracy"),
      description: t("howItWorks.tech.2.desc", "Validated against expert pathologist diagnoses in clinical trials"),
    },
    {
      icon: ServerIcon,
      title: t("howItWorks.tech.3.title", "Real-time Processing"),
      description: t("howItWorks.tech.3.desc", "Edge computing for instant analysis without cloud storage"),
    },
    {
      icon: LockIcon,
      title: t("howItWorks.tech.4.title", "Privacy First"),
      description: t("howItWorks.tech.4.desc", "HIPAA compliant with zero data retention policy"),
    },
  ];
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-right" dir="rtl">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 lg:py-28">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-cyan-50 to-white" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-100 rounded-full text-teal-700 text-sm font-medium mb-6">
              <BrainIcon className="w-4 h-4" />
              {t("howItWorks.heroBadge", "AI-Powered Technology")}
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6">
              {t("howItWorks.heroTitle", "How Our AI Detection Works")}
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed">
              {t("howItWorks.heroDesc", "Our advanced screening process combines cutting-edge artificial intelligence with medical expertise to provide you with accurate, fast, and private oral cancer risk assessment.")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Steps Timeline */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
            }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              {t("howItWorks.stepsTitle", "Simple 4-Step Process")}
            </h2>
            <p className="text-lg text-slate-600">
              {t("howItWorks.stepsSubtitle", "From image capture to results in under a minute")}
            </p>
          </motion.div>

          <div className="space-y-0">
            {steps.map((step, index) => (
              <StepCard
                key={step.step}
                {...step}
                isLast={index === steps.length - 1}
              />
            ))}
          </div>

          <motion.div
            initial={{
              opacity: 0,
            }}
            whileInView={{
              opacity: 1,
            }}
            viewport={{
              once: true,
            }}
            className="text-center mt-12"
          >
            <Link to="/upload">
              <Button className="px-8 py-4 text-lg bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white rounded-xl shadow-lg shadow-teal-500/25">
                {t("howItWorks.tryNow", "Try It Now")}
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
            }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              {t("howItWorks.techTitle", "The Technology Behind It")}
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {t("howItWorks.techSubtitle", "Built on years of research and validated through rigorous clinical testing")}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {techFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  delay: index * 0.1,
                }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-center"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-7 h-7 text-teal-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What You Get Section */}
      <section className="py-20 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              {t("howItWorks.resultsTitle", "What You’ll Receive After Analysis")}
            </h2>
            <p className="text-lg text-slate-600">
              {t("howItWorks.resultsSubtitle", "Clear, actionable insights designed to help you take the right next step.")}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: FileTextIcon, title: t("howItWorks.results.1.title", "Detailed Risk Report"), desc: t("howItWorks.results.1.desc", "Easy-to-understand explanation of your screening result.") },
              { icon: CheckCircleIcon, title: t("howItWorks.results.2.title", "Personalized Recommendations"), desc: t("howItWorks.results.2.desc", "Guidance on whether to monitor or consult a specialist.") },
              { icon: ShieldCheckIcon, title: t("howItWorks.results.3.title", "Confidence Score"), desc: t("howItWorks.results.3.desc", "AI confidence level to help interpret the assessment.") },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white border rounded-2xl p-8 text-center shadow-sm hover:shadow-lg transition"
              >
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-teal-50 flex items-center justify-center">
                  <item.icon className="w-7 h-7 text-teal-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-teal-600 to-cyan-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              {t("howItWorks.ctaTitle", "Ready to Get Started?")}
            </h2>
            <p className="text-xl text-teal-100 mb-8 max-w-2xl mx-auto">
              {t("howItWorks.ctaSubtitle", "Experience the power of AI-driven oral cancer screening. Fast, accurate, and completely private.")}
            </p>
            <Link to="/upload">
              <Button className="group px-10 py-4 text-lg bg-white !text-teal-700 hover:bg-teal-300 hover:!text-white rounded-xl shadow-lg">
                {t("howItWorks.ctaButton", "Start Your Free Scan")}
                <ArrowRightIcon className="w-5 h-5 ml-2 group-text-teal-700" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
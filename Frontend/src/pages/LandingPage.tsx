import React from 'react';
import logo from '../assets/logo.png';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShieldCheckIcon, ZapIcon, UsersIcon, CameraIcon, BrainIcon, FileTextIcon, ArrowRightIcon, CheckCircleIcon, LockIcon, AwardIcon } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useState } from "react";
import { ChevronDownIcon } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { FeatureCard } from '../components/medical/FeatureCard';
export function LandingPage() {
  const features = [{
    icon: BrainIcon,
    title: 'AI-Powered Analysis',
    description: 'Advanced machine learning algorithms trained on thousands of clinical images for accurate early detection.'
  }, {
    icon: ZapIcon,
    title: 'Results in Seconds',
    description: 'Get your risk assessment within moments. No waiting, no appointments needed for initial screening.'
  }, {
    icon: ShieldCheckIcon,
    title: 'Expert Guidance',
    description: 'Receive personalized recommendations and connect with healthcare professionals when needed.'
  }];
  const steps = [{
    icon: CameraIcon,
    title: 'Take a Photo',
    description: 'Capture a clear image of your oral cavity'
  }, {
    icon: BrainIcon,
    title: 'AI Analysis',
    description: 'Our AI examines the image for indicators'
  }, {
    icon: FileTextIcon,
    title: 'Get Results',
    description: 'Receive your risk assessment and guidance'
  }];
  const trustBadges = [{
    icon: LockIcon,
    label: 'HIPAA Compliant'
  }, {
    icon: ShieldCheckIcon,
    label: 'Data Encrypted'
  }, {
    icon: AwardIcon,
    label: 'Clinically Validated'
  }];
  return <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
    {/* Hero Section */}
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-cyan-50 to-white" />
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-teal-100/50 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-32 lg:pb-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.6
          }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-100 rounded-full text-teal-700 text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
              AI-Powered Early Detection
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
              Early Detection
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600">
                Saves Lives
              </span>
            </h1>

            <p className="text-xl text-slate-600 mb-8 leading-relaxed max-w-lg">
              Screen for oral cancer risk in seconds using our advanced AI
              technology. Fast, private, and designed to help you take control
              of your health.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link to="/upload">
                <Button className="w-full sm:w-auto px-8 py-4 text-lg bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white rounded-xl shadow-lg shadow-teal-500/25">
                  Start Free Scan
                  <ArrowRightIcon className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/how-it-works">
                <Button variant="secondary" className="w-full sm:w-auto px-8 py-4 text-lg border-2 border-slate-200 hover:border-teal-300 rounded-xl">
                  Learn How It Works
                </Button>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-4">
              {trustBadges.map(badge => <div key={badge.label} className="flex items-center gap-2 text-sm text-slate-600">
                <badge.icon className="w-4 h-4 text-teal-600" />
                <span>{badge.label}</span>
              </div>)}
            </div>
          </motion.div>

          <motion.div initial={{
            opacity: 0,
            scale: 0.95
          }} animate={{
            opacity: 1,
            scale: 1
          }} transition={{
            duration: 0.6,
            delay: 0.2
          }} className="relative hidden lg:block">
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-3xl rotate-6 opacity-20" />
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-3xl -rotate-3 opacity-30" />
              <div className="relative bg-white rounded-3xl shadow-2xl p-8 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-64 h-64 mx-auto mb-6 rounded-full  flex items-center justify-center overflow-hidden">
                    <img
                      src={logo}
                      alt="OralScan AI Logo"
                      className="w-full h-full object-cover scale-90"
                    />
                  </div>

                  <h3 className="text-2xl font-bold text-slate-900 mb-2">
                    AI Screening
                  </h3>
                  <p className="text-slate-600">
                    Powered by advanced machine learning
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
        <motion.div initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Why Choose Our Platform
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Combining cutting-edge AI technology with medical expertise to
            provide reliable early detection screening.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => <FeatureCard key={feature.title} {...feature} index={index} />)}
        </div>
      </div>
    </section>

    {/* How It Works Preview */}
    <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Simple 3-Step Process
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Get your oral health screening in just a few minutes.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => <motion.div key={step.title} initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            delay: index * 0.15
          }} className="relative">
            {index < steps.length - 1 && <div className="hidden md:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-teal-200 to-transparent" />}
            <div className="relative bg-white rounded-2xl p-8 shadow-sm border border-slate-100 text-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 text-white font-bold text-lg flex items-center justify-center mx-auto mb-4">
                {index + 1}
              </div>
              <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center mx-auto mb-4">
                <step.icon className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {step.title}
              </h3>
              <p className="text-slate-600">{step.description}</p>
            </div>
          </motion.div>)}
        </div>

        <motion.div initial={{
          opacity: 0
        }} whileInView={{
          opacity: 1
        }} viewport={{
          once: true
        }} className="text-center mt-12">
          <Link to="/how-it-works">
            <Button variant="secondary" className="px-6 py-3 border-2 border-teal-200 hover:border-teal-300 text-teal-700 rounded-xl">
              Learn More About Our Process
              <ArrowRightIcon className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>

    {/* Stats Section */}
    <section className="py-20 bg-gradient-to-r from-teal-600 to-cyan-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 text-center text-white">
          {[{
            value: '95%',
            label: 'Detection Accuracy'
          }, {
            value: '50K+',
            label: 'Scans Completed'
          }, {
            value: '<30s',
            label: 'Average Analysis Time'
          }, {
            value: '100%',
            label: 'Data Privacy'
          }].map((stat, index) => <motion.div key={stat.label} initial={{
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
            <div className="text-4xl sm:text-5xl font-bold mb-2">
              {stat.value}
            </div>
            <div className="text-teal-100">{stat.label}</div>
          </motion.div>)}
        </div>
      </div>
    </section>

    {/* Testimonials */}
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
        }} className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Trusted by Healthcare Professionals
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {[{
            quote: 'This tool has become an invaluable part of our preliminary screening process. The accuracy is remarkable.',
            author: 'Dr. Sarah Chen',
            role: 'Oral Surgeon, Stanford Medical'
          }, {
            quote: 'Early detection is crucial for oral cancer outcomes. This AI system helps identify cases we might otherwise miss.',
            author: 'Dr. Michael Roberts',
            role: 'Oncologist, Mayo Clinic'
          }, {
            quote: 'The ease of use and quick results make it accessible for patients who might otherwise delay screening.',
            author: 'Dr. Emily Watson',
            role: 'Family Dentist, Private Practice'
          }].map((testimonial, index) => <motion.div key={testimonial.author} initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            delay: index * 0.1
          }} className="bg-slate-50 rounded-2xl p-8">
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => <CheckCircleIcon key={i} className="w-5 h-5 text-teal-500" />)}
            </div>
            <p className="text-slate-700 mb-6 leading-relaxed">
              "{testimonial.quote}"
            </p>
            <div>
              <div className="font-semibold text-slate-900">
                {testimonial.author}
              </div>
              <div className="text-sm text-slate-500">
                {testimonial.role}
              </div>
            </div>
          </motion.div>)}
        </div>
      </div>
    </section>

    {/* FAQ Section */}
    <section className="py-20 bg-gradient-to-r from-teal-600 to-cyan-600">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-slate-900 mb-12">
          Frequently Asked Questions
        </h2>

        <FAQAccordion />
      </div>
    </section>


    {/* CTA Section */}
    <section className="py-20 bg-gradient-to-b from-slate-50 to-teal-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }}>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Take Control of Your Oral Health Today
          </h2>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Early detection can make all the difference. Start your free
            screening now and get peace of mind in minutes.
          </p>
          <Link to="/upload">
            <Button className="px-10 py-4 text-lg bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white rounded-xl shadow-lg shadow-teal-500/25">
              Start Your Free Scan
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <p className="text-sm text-slate-500 mt-4">
            No registration required • Results in seconds • 100% private
          </p>
        </motion.div>
      </div>
    </section>
  </div>;
}

function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      q: "Is this a medical diagnosis?",
      a: "No. This tool provides a risk assessment only and should not replace professional medical advice."
    },
    {
      q: "How accurate is the AI analysis?",
      a: "Our AI is trained on thousands of clinical images and provides high accuracy for early screening."
    },
    {
      q: "Is my data safe?",
      a: "All uploaded images are encrypted and processed securely."
    },
    {
      q: "Do I need to create an account?",
      a: "No registration is required to perform a scan."
    }
  ];

  return (
    <div className="space-y-4">
      {faqs.map((item, i) => {
        const isOpen = openIndex === i;

        return (
          <div
            key={i}
            className="border rounded-xl bg-slate-50 overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="w-full flex justify-between items-center p-6 text-left"
            >
              <span className="font-semibold text-slate-900">
                {item.q}
              </span>

              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDownIcon className="w-5 h-5 text-teal-600" />
              </motion.div>
            </button>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="px-6 pb-6"
                >
                  <p className="text-slate-600">{item.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

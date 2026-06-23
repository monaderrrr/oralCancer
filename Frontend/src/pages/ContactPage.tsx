
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
  SendIcon,
  UserIcon,
  MessageSquareIcon,
  CheckCircleIcon,
  AlertCircleIcon,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/Textarea";
import { useTranslation } from "react-i18next"; 

type FormData = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};
type FormErrors = Partial<Record<keyof FormData, string>>;

export function ContactPage() {
  const { t } = useTranslation(); 
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = t("contact.errors.nameRequired", "Name is required");
    }
    if (!formData.email.trim()) {
      newErrors.email = t("contact.errors.emailRequired", "Email is required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t("contact.errors.emailValid", "Please enter a valid email");
    }
    if (!formData.message.trim()) {
      newErrors.message = t("contact.errors.messageRequired", "Message is required");
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const handleChange =
    (field: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
      if (errors[field]) {
        setErrors((prev) => ({
          ...prev,
          [field]: undefined,
        }));
      }
    };

  const contactInfo = [
    {
      icon: MailIcon,
      label: t("contact.labels.email", "Email"),
      value: "support@oralscan.ai",
      href: "mailto:support@oralscan.ai",
    },
    {
      icon: PhoneIcon,
      label: t("contact.labels.phone", "Phone"),
      value: "+1 (800) 555-0123",
      href: "tel:+18005550123",
    },
    {
      icon: MapPinIcon,
      label: t("contact.labels.address", "Address"),
      value: "123 Medical Center Dr, San Francisco, CA 94102",
    },
    {
      icon: ClockIcon,
      label: t("contact.labels.hours", "Hours"),
      value: t("contact.labels.hoursVal", "Mon-Fri: 8am-6pm PST"),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-right" dir="rtl">
      {/* Hero */}
      <section className="relative overflow-hidden py-20">
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
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6">
              {t("contact.heroTitle", "Get in Touch")}
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed">
              {t("contact.heroSubtitle", "Have questions about our AI screening technology or need to connect with a healthcare professional? We're here to help.")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100"
              >
                {isSubmitted ? (
                  <motion.div
                    initial={{
                      opacity: 0,
                      scale: 0.95,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                    }}
                    className="text-center py-12"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
                      <CheckCircleIcon className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">
                      {t("contact.submitted.title", "Message Sent!")}
                    </h3>
                    <p className="text-slate-600 mb-6">
                      {t("contact.submitted.subtitle", "Thank you for reaching out. We'll get back to you within 24-48 hours.")}
                    </p>
                    <Button
                      onClick={() => {
                        setIsSubmitted(false);
                        setFormData({
                          name: "",
                          email: "",
                          phone: "",
                          subject: "",
                          message: "",
                        });
                      }}
                      variant="secondary"
                      className="px-6 py-3 border-2 border-slate-200 rounded-xl"
                    >
                      {t("contact.submitted.sendAgain", "Send Another Message")}
                    </Button>
                  </motion.div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">
                      {t("contact.formTitle", "Send Us a Message")}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid sm:grid-cols-2 gap-6">
                        <div>
                          <label
                            htmlFor="name"
                            className="block text-sm font-medium text-slate-700 mb-2"
                          >
                            {t("contact.fields.name", "Full Name *")}
                          </label>
                          <Input
                            id="name"
                            type="text"
                            value={formData.name}
                            onChange={handleChange("name")}
                            placeholder="John Doe"
                            className={errors.name ? "border-red-300" : ""}
                          />
                          {errors.name && (
                            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                              <AlertCircleIcon className="w-3.5 h-3.5" />
                              {errors.name}
                            </p>
                          )}
                        </div>
                        <div>
                          <label
                            htmlFor="email"
                            className="block text-sm font-medium text-slate-700 mb-2"
                          >
                            {t("contact.fields.email", "Email Address *")}
                          </label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange("email")}
                            placeholder="john@example.com"
                            className={errors.email ? "border-red-300" : ""}
                          />
                          {errors.email && (
                            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                              <AlertCircleIcon className="w-3.5 h-3.5" />
                              {errors.email}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-6">
                        <div>
                          <label
                            htmlFor="phone"
                            className="block text-sm font-medium text-slate-700 mb-2"
                          >
                            {t("contact.fields.phone", "Phone Number")}
                          </label>
                          <Input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleChange("phone")}
                            placeholder="+1 (555) 000-0000"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="subject"
                            className="block text-sm font-medium text-slate-700 mb-2"
                          >
                            {t("contact.fields.subject", "Subject")}
                          </label>
                          <Input
                            id="subject"
                            type="text"
                            value={formData.subject}
                            onChange={handleChange("subject")}
                            placeholder="How can we help?"
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="message"
                          className="block text-sm font-medium text-slate-700 mb-2"
                        >
                          {t("contact.fields.message", "Message *")}
                        </label>
                        <Textarea
                          id="message"
                          value={formData.message}
                          onChange={handleChange("message")}
                          placeholder="Tell us more about your inquiry..."
                          rows={5}
                          className={errors.message ? "border-red-300" : ""}
                        />
                        {errors.message && (
                          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircleIcon className="w-3.5 h-3.5" />
                            {errors.message}
                          </p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white rounded-xl shadow-lg shadow-teal-500/25 disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>
                            <motion.div
                              animate={{
                                rotate: 360,
                              }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: "linear",
                              }}
                              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                            />
                            {t("contact.sending", "Sending...")}
                          </>
                        ) : (
                          <>
                            <SendIcon className="w-5 h-5 mr-2" />
                            {t("contact.sendBtn", "Send Message")}
                          </>
                        )}
                      </Button>
                    </form>
                  </>
                )}
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Info */}
              <motion.div
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.1,
                }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
              >
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  {t("contact.info.title", "Contact Information")}
                </h3>
                <div className="space-y-4">
                  {contactInfo.map((item) => (
                    <div key={item.label} className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-5 h-5 text-teal-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">{item.label}</p>
                        {item.href ? (
                          <a
                            href={item.href}
                            className="text-slate-900 hover:text-teal-600 transition-colors"
                          >
                            {item.value}
                          </a>
                        ) : (
                          <p className="text-slate-900">{item.value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Care Support */}
              <motion.div
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.2,
                }}
                className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl p-6 text-white"
              >
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                  <MessageSquareIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {t("contact.support.title", "Need Care Guidance?")}
                </h3>
                <p className="text-teal-100 text-sm mb-4">
                  {t("contact.support.desc", "Need to speak with a healthcare professional? Send us a message and we will help you find the right specialist.")}
                </p>
                <Button className="w-full bg-teal-600 text-white hover:bg-teal-700 rounded-xl py-3 shadow-md hover:shadow-lg transition-all duration-300">
                  {t("contact.sendBtn", "Send Message")}
                </Button>
              </motion.div>

              {/* Emergency */}
              <motion.div
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.3,
                }}
                className="bg-red-50 border border-red-200 rounded-2xl p-6"
              >
                <div className="flex items-start gap-3">
                  <AlertCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-800 mb-1">
                      {t("contact.emergency.title", "Medical Emergency?")}
                    </h4>
                    <p className="text-sm text-red-700 mb-3">
                      {t("contact.emergency.desc", "If you're experiencing a medical emergency, please call emergency services immediately.")}
                    </p>
                    <a
                      href="tel:911"
                      className="inline-flex items-center gap-2 text-red-700 font-semibold hover:text-red-800"
                    >
                      <PhoneIcon className="w-4 h-4" />
                      {t("contact.emergency.call", "Call 911")}
                    </a>
                  </div>
                </div>
              </motion.div>
              {/* Response Time */}
              <motion.div
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.4,
                }}
                className="bg-slate-50 rounded-2xl p-6"
              >
                <h4 className="font-semibold text-slate-900 mb-3">
                  Response Times
                </h4>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                    General inquiries: 24-48 hours
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-amber-500 rounded-full" />
                    Technical support: 12-24 hours
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-teal-500 rounded-full" />
                    Medical consultations: Same day
                  </li>
                </ul>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

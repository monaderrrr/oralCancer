import React from 'react';
import logo from '../../assets/logo.png';

import { Link } from 'react-router-dom';
import { ShieldCheckIcon, MailIcon, PhoneIcon, MapPinIcon } from 'lucide-react';
import { MedicalDisclaimer } from '../medical/MedicalDisclaimer';
import { useTranslation } from "react-i18next"; 

export function Footer() {
  const { t } = useTranslation(); 
  const currentYear = new Date().getFullYear();
  
  const footerLinks = {
    product: [{
      label: t('footer.productLinks.howItWorks', 'How It Works'),
      href: '/how-it-works'
    }, {
      label: t('footer.productLinks.startScan', 'Start Scan'),
      href: '/upload'
    }, {
      label: t('footer.productLinks.viewResults', 'View Results'),
      href: '/results'
    }],
    resources: [{
      label: t('footer.resourceLinks.awareness', 'Oral Cancer Awareness'),
      href: '/awareness'
    }, {
      label: t('footer.resourceLinks.about', 'About Us'),
      href: '/about'
    }, {
      label: t('footer.resourceLinks.contact', 'Contact'),
      href: '/contact'
    }],
    legal: [{
      label: t('footer.legalLinks.privacy', 'Privacy Policy'),
      href: '#'
    }, {
      label: t('footer.legalLinks.terms', 'Terms of Service'),
      href: '#'
    }, {
      label: t('footer.legalLinks.cookie', 'Cookie Policy'),
      href: '#'
    }]
  };

  return <footer className="bg-slate-900 text-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Medical Disclaimer */}
      <div className="mb-12 p-6 bg-slate-800 rounded-xl">
        <MedicalDisclaimer variant="compact" />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
        {/* Brand */}
        <div className="lg:col-span-2">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-16 h-16 bg-gradient-to-br rounded-xl flex items-center justify-center overflow-hidden">
              <img src={logo} className="w-16 h-16 object-contain" alt="OralScan Logo" />
            </div>
            <span className="font-bold text-xl text-white">
              OralScan AI
            </span>
          </Link>

          <p className="text-slate-400 mb-6 max-w-sm">
            {t('footer.brandDesc', 'AI-powered oral cancer screening for early detection. Fast, accurate, and private.')}
          </p>
          <div className="space-y-2 text-sm text-slate-400">
            <a href="mailto:support@oralscan.ai" className="flex items-center gap-2 hover:text-teal-400 transition-colors">
              <MailIcon className="w-4 h-4" />
              support@oralscan.ai
            </a>
            <a href="tel:+2001017296998" className="flex items-center gap-2 hover:text-teal-400 transition-colors">
              <PhoneIcon className="w-4 h-4" />
              +20 0101 729 6998
            </a>
            <div className="flex items-start gap-2">
              <MapPinIcon className="w-4 h-4 mt-0.5" />
              <span>
                {t('footer.location.academy', 'MET Academy')}
                <br />
                {t('footer.location.city', 'Mansoura, Egypt')}
              </span>
            </div>
          </div>
        </div>

        {/* Product Links */}
        <div>
          <h4 className="font-semibold mb-4">{t('footer.headers.product', 'Product')}</h4>
          <ul className="space-y-2">
            {footerLinks.product.map(link => <li key={link.label}>
              <Link to={link.href} className="text-slate-400 hover:text-teal-400 transition-colors text-sm">
                {link.label}
              </Link>
            </li>)}
          </ul>
        </div>

        {/* Resources Links */}
        <div>
          <h4 className="font-semibold mb-4">{t('footer.headers.resources', 'Resources')}</h4>
          <ul className="space-y-2">
            {footerLinks.resources.map(link => <li key={link.label}>
              <Link to={link.href} className="text-slate-400 hover:text-teal-400 transition-colors text-sm">
                {link.label}
              </Link>
            </li>)}
          </ul>
        </div>

        {/* Legal Links */}
        <div>
          <h4 className="font-semibold mb-4">{t('footer.headers.legal', 'Legal')}</h4>
          <ul className="space-y-2">
            {footerLinks.legal.map(link => <li key={link.label}>
              <Link to={link.href} className="text-slate-400 hover:text-teal-400 transition-colors text-sm">
                {link.label}
              </Link>
            </li>)}
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-slate-400 text-sm">
          © {currentYear} OralScan AI. {t('footer.rights', 'All rights reserved.')}
        </p>
        <div className="flex items-center gap-4 text-sm text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-emerald-500 rounded-full" />
            {t('footer.compliance.hipaa', 'HIPAA Compliant')}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-emerald-500 rounded-full" />
            {t('footer.compliance.gdpr', 'GDPR Compliant')}
          </span>
        </div>
      </div>
    </div>
  </footer>;
}
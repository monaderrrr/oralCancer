import React from 'react';
import logo from '../../assets/logo.png';

import { Link } from 'react-router-dom';
import { ShieldCheckIcon, MailIcon, PhoneIcon, MapPinIcon } from 'lucide-react';
import { MedicalDisclaimer } from '../medical/MedicalDisclaimer';
export function Footer() {
  const currentYear = new Date().getFullYear();
  const footerLinks = {
    product: [{
      label: 'How It Works',
      href: '/how-it-works'
    }, {
      label: 'Start Scan',
      href: '/upload'
    }, {
      label: 'View Results',
      href: '/results'
    }],
    resources: [{
      label: 'Oral Cancer Awareness',
      href: '/awareness'
    }, {
      label: 'About Us',
      href: '/about'
    }, {
      label: 'Contact',
      href: '/contact'
    }],
    legal: [{
      label: 'Privacy Policy',
      href: '#'
    }, {
      label: 'Terms of Service',
      href: '#'
    }, {
      label: 'Cookie Policy',
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
              <img src={logo} className="w-16 h-16 object-contain" />
            </div>

            <span className="font-bold text-xl text-white">
              OralScan AI
            </span>

          </Link>

          <p className="text-slate-400 mb-6 max-w-sm">
            AI-powered oral cancer screening for early detection. Fast,
            accurate, and private.
          </p>
          <div className="space-y-2 text-sm text-slate-400">
            <a href="mailto:support@oralscan.ai" className="flex items-center gap-2 hover:text-teal-400 transition-colors">
              <MailIcon className="w-4 h-4" />
              support@oralscan.ai
            </a>
            <a href="tel:+18005550123" className="flex items-center gap-2 hover:text-teal-400 transition-colors">
              <PhoneIcon className="w-4 h-4" />
              +20 0101 729 6998
            </a>
            <div className="flex items-start gap-2">
              <MapPinIcon className="w-4 h-4 mt-0.5" />
              <span>
                MET Academy
                <br />
                Mansoura, Egypt
              </span>
            </div>
          </div>
        </div>

        {/* Product Links */}
        <div>
          <h4 className="font-semibold mb-4">Product</h4>
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
          <h4 className="font-semibold mb-4">Resources</h4>
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
          <h4 className="font-semibold mb-4">Legal</h4>
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
          © {currentYear} OralScan AI. All rights reserved.
        </p>
        <div className="flex items-center gap-4 text-sm text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-emerald-500 rounded-full" />
            HIPAA Compliant
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-emerald-500 rounded-full" />
            GDPR Compliant
          </span>
        </div>
      </div>
    </div>
  </footer>;
}
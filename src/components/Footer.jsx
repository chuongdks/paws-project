import React, { useState } from 'react';
import { Mail, Info } from 'lucide-react';
import { FacebookIcon, InstagramIcon, XIcon, YoutubeIcon, TiktokIcon } from './SocialIcons.jsx';
import myLogo from '../assets/paws.jpg';
import DisclaimerModal from './DisclaimerModal.jsx';

// Fill in real URLs when ready — '#' placeholders for now.
// Delete any row here for a platform you don't use.
const SOCIAL_LINKS = [
  { icon: FacebookIcon,  href: 'https://www.facebook.com/p/Paws-in-Recovery-61566509212457/', label: 'Facebook' },
  { icon: InstagramIcon, href: 'https://www.instagram.com/pawsinrecovery/', label: 'Instagram' },
  { icon: Mail,          href: 'mailto:pawsinrecovery@gmail.com', label: 'Email' },
];

export default function Footer() {
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-slate-200 px-4 sm:px-5 py-5 shrink-0 space-y-4">

      {/* Logo + socials */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <a href="https://pawsinrecovery.ca/" target="_blank" rel="noopener noreferrer" className="shrink-0">
          <img src={myLogo} alt="Paws in Recovery" className="h-14 sm:h-16 w-auto object-contain" />
        </a>

        <div className="flex items-center gap-1">
          Follow Us On Social Media
          {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer" title={label}
              className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
              <Icon className="h-4 w-4" />
            </a>
          ))}
        </div>
      </div>

      {/* Short disclaimer — always visible, links out to the full version */}
      <p className="text-[11px] text-slate-400 leading-relaxed border-t border-slate-100 pt-4">
        Should I put anything here before the full disclosure? {' '} {' '}
        <button onClick={() => setShowDisclaimer(true)}
          className="inline-flex items-center gap-0.5 font-semibold text-blue-600 hover:underline">
          <Info className="h-3 w-3" /> Read full disclaimer
        </button>
      </p>

      {/* Copyright + signature */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-[11px] text-slate-400">
        <span>© {year} PAWS in Recovery. All rights reserved.</span>
        <span className="flex items-center gap-1">
          Created by{' '}
          <a href="#" className="font-semibold text-slate-500 hover:text-blue-600 transition-colors">
            Noor
          </a>
          ,
          <a href="#" className="font-semibold text-slate-500 hover:text-blue-600 transition-colors">
            Parsia
          </a>
          and 
          <a href="https://github.com/chuongdks" target="_blank" className="font-semibold text-slate-500 hover:text-blue-600 transition-colors">
            Chuong Pham
          </a>
        </span>
      </div>

      {showDisclaimer && (
        <DisclaimerModal onClose={() => setShowDisclaimer(false)} />
      )}
    </footer>
  );
}

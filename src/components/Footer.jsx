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
    <footer className="bg-surface border-t border-divider-page px-4 sm:px-5 py-1 shrink-0 space-y-1">

      {/* Logo + socials */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <a href="https://pawsinrecovery.ca/" target="_blank" rel="noopener noreferrer" className="shrink-0">
          <img src={myLogo} alt="Paws in Recovery" className="h-10 sm:h-14 w-auto object-contain" />
        </a>

        <div className="flex items-center gap-1 text-secondary">
          Follow Us On Social Media
          {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer" title={label}
              className="p-2 rounded-lg text-faint hover:text-accent-text hover:bg-accent-soft transition-colors">
              <Icon className="h-4 w-4" />
            </a>
          ))}
        </div>
      </div>

      {/* Short disclaimer, always visible, links out to the full version
      <p className="text-[11px] text-faint leading-relaxed border-t border-divider-subtle pt-0">
        <button onClick={() => setShowDisclaimer(true)}
          className="inline-flex items-center gap-0.5 font-semibold text-accent-text hover:underline">
          <Info className="h-3 w-3" /> Read full disclaimer
        </button>
      </p> */}

      {/* Copyright + signature */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-[12px] text-faint">
        <span>© {year} PAWS in Recovery. All rights reserved.</span>
        <span className="flex items-center gap-1">
          Created by{' '}
          <a href="http://www.linkedin.com/in/noorhaddadcs" target="_blank" className="font-semibold text-muted hover:text-accent-text transition-colors">
            Noor Haddad
          </a>
          ,
          <a href="https://www.linkedin.com/in/parsia-zahedi-bb49402b6/" target="_blank" className="font-semibold text-muted hover:text-accent-text transition-colors">
            Parsia Zahedimazandarani
          </a>
          , and 
          <a href="https://www.linkedin.com/in/phchuong98/" target="_blank" className="font-semibold text-muted hover:text-accent-text transition-colors">
            Chuong Pham
          </a>
        </span>
      </div>

      {/* {showDisclaimer && (
        <DisclaimerModal onClose={() => setShowDisclaimer(false)} />
      )} */}
    </footer>
  );
}

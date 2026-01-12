import React from 'react';
import { Link } from 'react-router-dom';
import { Sun, Facebook, Instagram, Youtube, Mail, Lock } from 'lucide-react';

// Custom SVGs for icons not in standard library
const TiktokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 1 0 1 7.6 6.83 6.83 0 0 0 6-6.8V6.69z"/></svg>
);
const PinterestIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg"><path d="M9.04 21.54c.96.29 1.93.46 2.96.46a10 10 0 0 0 10-10A10 10 0 0 0 12 2 10 10 0 0 0 2 12c0 4.25 2.67 7.9 6.44 9.34-.09-.8-.16-2.02.03-2.88l1.1-4.63s-.28-.56-.28-1.39c0-1.3.75-2.27 1.69-2.27.8 0 1.18.6 1.18 1.32 0 .8-.51 2-0.77 3.11-.22.93.47 1.51 1.4 1.51 1.68 0 2.97-1.78 2.97-4.35 0-2.27-1.63-3.86-3.96-3.86-2.88 0-4.57 2.16-4.57 4.41 0 .87.33 1.8.76 2.31.08.1.09.18.06.28l-.29 1.17c-.05.19-.17.23-.39.14-1.46-.68-2.37-2.82-2.37-4.54 0-3.7 2.69-7.09 7.76-7.09 4.08 0 7.24 2.91 7.24 6.8 0 4.05-2.55 7.31-6.09 7.31-1.19 0-2.31-.62-2.7-1.35l-.73 2.77c-.26 1.01-.97 2.27-1.44 3.04z"/></svg>
);

const Footer: React.FC = () => {
  return (
    <footer className="bg-spirit-900 text-white pt-10 pb-6 border-t border-white/5 relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Column 1: Branding & Info */}
          <div className="col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-accent-500 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                <Sun className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-serif font-bold tracking-tight uppercase">Jaadu ki kaat</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs mb-6">
              Illuminating paths and identifying spiritual hurdles since 2024. Your journey to inner Shifa begins here with absolute compassion and ancient wisdom.
            </p>
            <div className="flex items-center space-x-4 text-slate-300 text-sm font-bold group cursor-pointer">
              <div className="p-2 bg-white/5 rounded-lg group-hover:bg-accent-500/20 transition-colors">
                <Mail size={18} className="text-accent-500" />
              </div>
              <span className="group-hover:text-accent-400 transition-colors">Info@jaadukikaat.com</span>
            </div>
          </div>
          
          {/* Column 2: Quick Links */}
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-bold mb-6 font-serif text-accent-400 tracking-wider uppercase text-center">Quick Links</h3>
            <ul className="space-y-3 text-slate-400 text-sm font-medium flex flex-col items-center">
              <li><Link to="/disclaimer" className="hover:text-accent-400 transition-colors">Disclaimer</Link></li>
              <li><Link to="/faq" className="hover:text-accent-400 transition-colors">FAQ</Link></li>
              <li><Link to="/privacy" className="hover:text-accent-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-accent-400 transition-colors">Terms and Conditions</Link></li>
            </ul>
          </div>

          {/* Column 3: Follow Us */}
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-bold mb-6 font-serif text-accent-400 tracking-wider uppercase text-center">Follow Us</h3>
            <div className="grid grid-cols-2 gap-4">
                <SocialLink href="#" icon={<TiktokIcon className="w-4 h-4" />} label="TikTok" />
                <SocialLink href="#" icon={<Facebook size={16} />} label="Facebook" />
                <SocialLink href="#" icon={<Instagram size={16} />} label="Instagram" />
                <SocialLink href="#" icon={<Youtube size={16} />} label="YouTube" />
                <SocialLink href="#" icon={<PinterestIcon className="w-4 h-4" />} label="Pinterest" />
            </div>
          </div>
        </div>
        
        <div className="border-t border-white/5 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center text-slate-500 text-[10px] gap-6">
          <p className="font-bold tracking-[0.3em] uppercase">&copy; {new Date().getFullYear()} JAADU KI KAAT. All rights reserved.</p>
          <Link to="/admin" className="inline-flex items-center space-x-2 hover:text-accent-400 transition-colors uppercase tracking-[0.3em] font-bold">
              <Lock size={12} className="inline" /> 
              <span>Admin</span>
          </Link>
        </div>
      </div>
    </footer>
  );
};

const SocialLink = ({ href, icon, label }: { href: string, icon: React.ReactNode, label: string }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center group w-fit">
        <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-accent-500 group-hover:text-white transition-all duration-300">
            {icon}
        </div>
        <span className="ml-3 text-sm font-medium text-slate-400 group-hover:text-accent-400 transition-colors">{label}</span>
    </a>
);

export default Footer;
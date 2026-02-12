
import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Youtube, Mail, Lock, AlertCircle, HelpCircle, Shield, FileText } from 'lucide-react';

// Custom SVGs
const TiktokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 1 0 1 7.6 6.83 6.83 0 0 0 6-6.8V6.69z"/></svg>
);
const PinterestIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg"><path d="M9.04 21.54c.96.29 1.93.46 2.96.46a10 10 0 0 0 10-10A10 10 0 0 0 12 2 10 10 0 0 0 2 12c0 4.25 2.67 7.9 6.44 9.34-.09-.8-.16-2.02.03-2.88l1.1-4.63s-.28-.56-.28-1.39c0-1.3.75-2.27 1.69-2.27.8 0 1.18.6 1.18 1.32 0 .8-.51 2-0.77 3.11-.22.93.47 1.51 1.4 1.51 1.68 0 2.97-1.78 2.97-4.35 0-2.27-1.63-3.86-3.96-3.86-2.88 0-4.57 2.16-4.57 4.41 0 .87.33 1.8.76 2.31.08.1.09.18.06.28l-.29 1.17c-.05.19-.17.23-.39.14-1.46-.68-2.37-2.82-2.37-4.54 0-3.7 2.69-7.09 7.76-7.09 4.08 0 7.24 2.91 7.24 6.8 0 4.05-2.55 7.31-6.09 7.31-1.19 0-2.31-.62-2.7-1.35l-.73 2.77c-.26 1.01-.97 2.27-1.44 3.04z"/></svg>
);

const Footer: React.FC = () => {
  return (
    <footer className="bg-spirit-900 text-white pt-16 pb-8 border-t border-white/5 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-spirit-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:grid md:grid-cols-3 md:gap-12 gap-12">
          
          {/* Brand Section */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="mb-6 bg-white/5 p-4 rounded-3xl backdrop-blur-sm border border-white/10 inline-block shadow-xl">
               <img src="https://res.cloudinary.com/dq0ccjs6y/image/upload/v1770399481/Jaadu_Ki-removebg-preview_wnzo57.png" alt="Jaadu ki kaat Logo" className="h-24 md:h-28" />
            </div>
            <p className="text-slate-300 text-sm leading-relaxed max-w-sm font-light mb-6">
              Illuminating paths and identifying spiritual hurdles since 2024. Your journey to inner Shifa begins here with absolute compassion.
            </p>
            <div>
                <a href="mailto:Info@jaadukikaat.com" className="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-white/5 border border-white/10 hover:bg-accent-500 hover:border-accent-500 transition-all group shadow-lg hover:shadow-accent-500/25">
                    <Mail size={18} className="text-accent-400 group-hover:text-white transition-colors" />
                    <span className="font-bold tracking-wide text-sm group-hover:text-white text-slate-300">Info@jaadukikaat.com</span>
                </a>
            </div>
          </div>
          
          {/* Mobile: Grid for Links (Parallel on Mobile) */}
          <div className="md:col-span-2 grid grid-cols-2 gap-4 md:gap-8">
             
             {/* Quick Links */}
             <div className="flex flex-col items-start w-full">
                <h3 className="text-lg md:text-xl font-serif font-bold text-white mb-6 relative inline-block">
                    Quick Links
                    <div className="absolute -bottom-2 left-0 w-8 md:w-12 h-1 bg-accent-500 rounded-full"></div>
                </h3>
                <div className="flex flex-col gap-3 w-full">
                    <FooterLink to="/disclaimer" label="Disclaimer" icon={<AlertCircle size={14} />} />
                    <FooterLink to="/faq" label="FAQ" icon={<HelpCircle size={14} />} />
                    <FooterLink to="/privacy" label="Privacy Policy" icon={<Shield size={14} />} />
                    <FooterLink to="/terms" label="Terms & Conditions" icon={<FileText size={14} />} />
                </div>
             </div>

             {/* Follow Us */}
             <div className="flex flex-col items-start w-full">
                <h3 className="text-lg md:text-xl font-serif font-bold text-white mb-6 relative inline-block">
                    Follow Us
                    <div className="absolute -bottom-2 left-0 w-8 md:w-12 h-1 bg-accent-500 rounded-full"></div>
                </h3>
                <div className="flex flex-col gap-3 w-full">
                    <FooterLink label="TikTok" icon={<TiktokIcon className="w-3.5 h-3.5" />} />
                    <FooterLink label="Facebook" icon={<Facebook size={14} />} />
                    <FooterLink label="Instagram" icon={<Instagram size={14} />} />
                    <FooterLink label="YouTube" icon={<Youtube size={14} />} />
                    <FooterLink label="Pinterest" icon={<PinterestIcon className="w-3.5 h-3.5" />} />
                </div>
             </div>

          </div>
        </div>
        
        {/* Footer Bottom */}
        <div className="border-t border-white/5 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center text-slate-500 text-xs gap-4">
          <p className="font-medium tracking-wide text-center md:text-left">&copy; {new Date().getFullYear()} JAADU KI KAAT. All rights reserved.</p>
          <Link to="/admin" className="inline-flex items-center space-x-2 hover:text-accent-400 transition-colors opacity-50 hover:opacity-100">
              <Lock size={12} /> 
              <span className="uppercase tracking-widest font-bold">Admin Access</span>
          </Link>
        </div>
      </div>
    </footer>
  );
};

interface FooterLinkProps {
    label: string;
    icon: React.ReactNode;
    to?: string;
    href?: string;
}

const FooterLink = ({ label, icon, to, href }: FooterLinkProps) => {
    const commonClasses = "flex items-center justify-center gap-3 bg-white/5 hover:bg-accent-600 border border-white/5 hover:border-accent-500 px-3 py-3 rounded-xl transition-all duration-300 group shadow-sm hover:shadow-lg w-full max-w-[180px]";

    const content = (
        <>
            <span className="text-slate-400 group-hover:text-white transition-colors shrink-0">{icon}</span>
            <span className="text-slate-300 text-[10px] md:text-xs font-bold uppercase tracking-wider group-hover:text-white transition-colors truncate">{label}</span>
        </>
    );

    if (to) {
        return <Link to={to} className={commonClasses}>{content}</Link>;
    }
    return (
        <a href={href || "#"} target="_blank" rel="noopener noreferrer" className={commonClasses}>
            {content}
        </a>
    );
};

export default Footer;

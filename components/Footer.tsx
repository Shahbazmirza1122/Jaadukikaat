import React from 'react';
import { Link } from 'react-router-dom';
import { Sun, Facebook, Twitter, Instagram, Mail, Lock } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-spirit-900 text-white pt-20 pb-10 border-t border-white/5 relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-3 mb-8">
              <div className="p-2 bg-accent-500 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                <Sun className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-serif font-bold tracking-tight uppercase">Jaadu ki kaat</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Illuminating paths and identifying spiritual hurdles since 2024. Your journey to inner Shifa begins here with absolute compassion and ancient wisdom.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-8 font-serif text-accent-400 tracking-wider uppercase">Navigation</h3>
            <ul className="space-y-4 text-slate-400 text-sm font-medium">
              <li><a href="/#about" className="hover:text-accent-400 transition-colors">About Sanctuary</a></li>
              <li><a href="/#services" className="hover:text-accent-400 transition-colors">Our Services</a></li>
              <li><Link to="/blog" className="hover:text-accent-400 transition-colors">Journal</Link></li>
              <li><a href="/#contact" className="hover:text-accent-400 transition-colors">Connect</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-8 font-serif text-accent-400 tracking-wider uppercase">Expertise</h3>
            <ul className="space-y-4 text-slate-400 text-sm font-medium">
              <li>Rohani Ilaaj</li>
              <li>Spiritual Analysis</li>
              <li>Protection Duas</li>
              <li>Sacred Wazaif</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-8 font-serif text-accent-400 tracking-wider uppercase">Community</h3>
            <div className="flex space-x-6 mb-8">
              <a href="#" className="text-slate-400 hover:text-accent-400 transition-all hover:scale-125"><Facebook size={24} /></a>
              <a href="#" className="text-slate-400 hover:text-accent-400 transition-all hover:scale-125"><Twitter size={24} /></a>
              <a href="#" className="text-slate-400 hover:text-accent-400 transition-all hover:scale-125"><Instagram size={24} /></a>
            </div>
            <div className="flex items-center space-x-4 text-slate-300 text-sm mb-10 font-bold group cursor-pointer">
              <div className="p-2 bg-white/5 rounded-lg group-hover:bg-accent-500/20 transition-colors">
                <Mail size={18} className="text-accent-500" />
              </div>
              <span className="group-hover:text-accent-400 transition-colors">shifa@jaadukikaat.com</span>
            </div>
            <Link to="/admin" className="inline-flex items-center space-x-2 text-slate-500 text-[10px] hover:text-accent-400 transition-colors uppercase tracking-[0.3em] font-bold">
              <Lock size={12} className="inline" /> 
              <span>Sanctuary Portal</span>
            </Link>
          </div>
        </div>
        
        <div className="border-t border-white/5 mt-20 pt-10 flex flex-col md:flex-row justify-between items-center text-slate-500 text-[10px] gap-6">
          <p className="font-bold tracking-[0.3em] uppercase">&copy; {new Date().getFullYear()} JAADU KI KAAT SPIRITUAL SANCTUARY.</p>
          <div className="flex space-x-10 uppercase tracking-[0.3em] font-bold">
            <a href="#" className="hover:text-accent-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-accent-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
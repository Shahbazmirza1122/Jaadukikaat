
import React, { useEffect } from 'react';
import { 
  Brain, ShieldAlert, Activity, Zap, HeartCrack, Wind, Mountain, 
  Cloud, Heart, Lock, CircleX, FileSignature, Image, TriangleAlert, Frown, Sparkles, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ServicesPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const services = [
    { title: "Relief from Whispers", desc: "Removing intrusive whispers and doubts from the mind to restore mental peace.", icon: Brain },
    { title: "Protection from Fear", desc: "Spiritual protection against irrational fear, nightmares, and phobias.", icon: ShieldAlert },
    { title: "Healing Sickness", desc: "Healing from spiritual sickness and unexplained physical ailments.", icon: Activity },
    { title: "Mind Protection", desc: "Breaking spells designed to control the mind or manipulate thoughts.", icon: Zap },
    { title: "Resolving Hatred", desc: "Removing supernatural causes of hatred and restoring harmony between people.", icon: HeartCrack },
    { title: "Curing Restlessness", desc: "Curing chronic restlessness, anxiety, and lack of sleep caused by spiritual factors.", icon: Wind },
    { title: "Earth Magic Removal", desc: "Neutralizing magic buried in earth or graves designed to ground your progress.", icon: Mountain },
    { title: "Air Magic Clearing", desc: "Clearing airborne spiritual afflictions that affect your environment.", icon: Cloud },
    { title: "Restoring Love", desc: "Restoring lost love and fixing relationship bonds broken by negative energy.", icon: Heart },
    { title: "Removing Blockages", desc: "Opening blocked paths (Bandish) in career, marriage, or financial life.", icon: Lock },
    { title: "Overcoming Failure", desc: "Reversing spells designed to cause persistent failure and bad luck.", icon: CircleX },
    { title: "Name Spell Breaking", desc: "Breaking specific spells that were cast using your name or personal details.", icon: FileSignature },
    { title: "Photo Magic Removal", desc: "Neutralizing the effects of black magic performed on your photographs.", icon: Image },
    { title: "Mental Healing", desc: "Healing spiritual causes of mental instability or unexplained insanity.", icon: TriangleAlert },
    { title: "Pain Relief", desc: "Spiritual relief from chronic, unexplained physical pain that doctors cannot cure.", icon: Frown },
  ];

  return (
    <div className="bg-white min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-24 animate-fade-in pt-12">
          <span className="text-accent-600 font-bold tracking-[0.4em] uppercase text-xs mb-4 block">Our Sacred Expertise</span>
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-spirit-900 mb-8 relative inline-block">
            Healing Services
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-32 h-2 bg-accent-500 rounded-full shadow-lg"></div>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed mt-10 font-light">
            We provide specialized spiritual remedies (Rohani Ilaj) for a wide spectrum of afflictions. 
            Whatever burden your soul carries, we have a guided path to restoration.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-24">
          {services.map((service, index) => (
            <div key={index} className="group relative bg-white rounded-[2rem] p-1 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-accent-500 to-spirit-900 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative h-full bg-white rounded-[1.9rem] p-10 flex flex-col items-center text-center overflow-hidden z-10 border border-slate-100">
                
                {/* Icon */}
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-slate-50 rounded-2xl rotate-3 flex items-center justify-center group-hover:rotate-6 transition-all duration-300 group-hover:bg-accent-50 shadow-inner">
                    <service.icon className="w-10 h-10 text-accent-500 group-hover:text-accent-600 transition-colors" />
                  </div>
                  <div className="absolute -bottom-3 -right-3 bg-spirit-900 text-white text-[10px] font-bold w-8 h-8 flex items-center justify-center rounded-xl border-2 border-white shadow-lg">
                    {index + 1 < 10 ? `0${index + 1}` : index + 1}
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-spirit-900 mb-5 font-serif group-hover:text-accent-600 transition-colors">
                  {service.title}
                </h3>
                
                <p className="text-slate-600 leading-relaxed mb-10 flex-grow font-light">
                  {service.desc}
                </p>
                
                <Link 
                  to="/#contact" 
                  className="w-full mt-auto bg-slate-900 text-white font-bold py-4 px-6 rounded-xl group-hover:bg-accent-500 transition-all duration-300 flex items-center justify-center space-x-3 shadow-xl active:scale-95"
                >
                  <span className="uppercase tracking-widest text-xs">Get Spiritual Solution</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-spirit-900 rounded-[4rem] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl mx-auto max-w-6xl border border-white/5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent-500 opacity-10 rounded-full blur-[100px] transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-500 opacity-10 rounded-full blur-[100px] transform -translate-x-1/2 translate-y-1/2"></div>

          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-8">Unsure which path to choose?</h2>
            <p className="text-slate-300 text-xl mb-12 max-w-2xl mx-auto leading-relaxed font-light">
              Spiritual matters are nuanced and personal. Contact us for a free analysis, and we will listen to your situation with absolute compassion.
            </p>
            <Link to="/#contact" className="inline-flex items-center bg-accent-500 text-white font-bold py-5 px-12 rounded-full hover:bg-accent-600 transition transform hover:scale-105 shadow-[0_20px_50px_rgba(99,102,241,0.4)] text-lg group">
              <Sparkles className="w-6 h-6 mr-3 text-white group-hover:rotate-12 transition-transform" />
              Book Free Consultation
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ServicesPage;

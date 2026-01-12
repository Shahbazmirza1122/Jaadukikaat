import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Moon, Star, Send, X, Check, ArrowRight, Shield, Heart, Sparkles, MapPin, Mail, Phone } from 'lucide-react';
import SpiritualGuide from '../components/SpiritualGuide';
import { submitToGoogleSheet } from '../services/sheetService';

const Home: React.FC = () => {
  const location = useLocation();

  // Modal States
  const [isPrayerRequestModalOpen, setIsPrayerRequestModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isConsultSubmitting, setIsConsultSubmitting] = useState(false);

  // Prayer Request Form States
  const [prayerRequestName, setPrayerRequestName] = useState('');
  const [prayerRequestMotherName, setPrayerRequestMotherName] = useState('');
  const [prayerRequestDob, setPrayerRequestDob] = useState('');
  const [prayerRequestPhone, setPrayerRequestPhone] = useState('');
  const [prayerRequestEmail, setPrayerRequestEmail] = useState('');
  const [prayerRequestCity, setPrayerRequestCity] = useState('');
  const [prayerRequestCountry, setPrayerRequestCountry] = useState('');
  const [prayerRequestRecitation, setPrayerRequestRecitation] = useState('');
  const [prayerRequestRecitationCount, setPrayerRequestRecitationCount] = useState('');
  const [prayerRequestPurpose, setPrayerRequestPurpose] = useState('');
  const [prayerRequestMessage, setPrayerRequestMessage] = useState('');

  // Contact Form States
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactStatus, setContactStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  useEffect(() => {
    // Handle hash scrolling on load if present
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location]);

  // Prayer Request Handler
  const handlePrayerRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConsultSubmitting(true);
    
    const payload = {
        'Full Name': prayerRequestName,
        "Mother's Name": prayerRequestMotherName,
        'Date of Birth': prayerRequestDob,
        'Phone Number': prayerRequestPhone,
        'Email Address': prayerRequestEmail,
        'City': prayerRequestCity,
        'Country': prayerRequestCountry,
        'What You Have Recited': prayerRequestRecitation, // Updated key
        'How Many Times': prayerRequestRecitationCount,   // Updated key
        'Purpose': prayerRequestPurpose,
        'Message': prayerRequestMessage,
        'Requesting Service': 'Prayer Request'
    };

    // Send to "Prayer Requests" sheet (assuming this sheet exists in your script logic)
    // If specific sheet name logic isn't in script, it usually dumps to one sheet. 
    // We pass 'Prayer Requests' as sheetName argument.
    await submitToGoogleSheet('Prayer Requests', payload);

    setIsConsultSubmitting(false);
    setIsPrayerRequestModalOpen(false);
    setIsSuccessModalOpen(true);
    
    setPrayerRequestName('');
    setPrayerRequestMotherName('');
    setPrayerRequestDob('');
    setPrayerRequestEmail('');
    setPrayerRequestPhone('');
    setPrayerRequestCity('');
    setPrayerRequestCountry('');
    setPrayerRequestRecitation('');
    setPrayerRequestRecitationCount('');
    setPrayerRequestPurpose('');
    setPrayerRequestMessage('');
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactStatus('submitting');
    
    const payload = {
        'Full Name': contactName,
        'Email Address': contactEmail,
        'Message': contactMessage,
        'Requesting Service': 'Contact Inquiry'
    };

    const success = await submitToGoogleSheet('Inquiries', payload);
    
    if (success) {
        setContactStatus('success');
        setContactName('');
        setContactEmail('');
        setContactMessage('');
        setTimeout(() => setContactStatus('idle'), 5000);
    } else {
        setContactStatus('error');
    }
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section id="top" className="relative min-h-screen flex items-center justify-center bg-spirit-900 overflow-hidden pt-20">
         {/* Background Elements */}
         <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
             <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-500/20 rounded-full blur-[128px]"></div>
             <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[128px]"></div>
         </div>

         <div className="container mx-auto px-6 relative z-10 text-center text-white">
            <div className="inline-block p-3 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md animate-fade-in-up">
                <span className="text-accent-300 uppercase tracking-[0.2em] text-xs font-bold flex items-center gap-2">
                    <Sparkles size={14} /> Spiritual Healing & Protection
                </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold mb-8 leading-tight animate-fade-in">
                Jaadu Ki Kaat
            </h1>
            
            <p className="text-lg md:text-2xl text-spirit-200 mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in delay-100 font-light">
                Find clarity, protection, and inner peace through authentic spiritual guidance (Rohani Ilaj). 
                Your journey to Shifa begins here.
            </p>
            
            <div className="flex flex-col md:flex-row gap-6 justify-center animate-fade-in delay-200">
                <Link 
                    to="/services" 
                    className="px-8 py-5 bg-accent-500 hover:bg-accent-600 rounded-2xl font-bold text-white transition-all shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:shadow-[0_0_50px_rgba(99,102,241,0.5)] flex items-center justify-center gap-2 group"
                >
                    Explore Remedies <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button 
                    onClick={() => setIsPrayerRequestModalOpen(true)} 
                    className="px-8 py-5 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-2xl font-bold text-white transition-all flex items-center justify-center gap-2"
                >
                    <Moon size={18} /> Request Prayer
                </button>
            </div>
         </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-spirit-50 relative">
        <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center mb-16">
                <h2 className="text-4xl font-serif font-bold text-spirit-900 mb-6">A Sanctuary for the Soul</h2>
                <p className="text-xl text-slate-600 leading-relaxed font-light">
                    In a world of unseen burdens, we offer a path to light. Jaadu Ki Kaat is dedicated to removing spiritual blockages, 
                    protecting against negative energies, and restoring the harmony meant for your life.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-spirit-100 text-center hover:-translate-y-2 transition-transform duration-500">
                    <div className="w-16 h-16 bg-accent-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Shield className="w-8 h-8 text-accent-500" />
                    </div>
                    <h3 className="text-xl font-bold text-spirit-900 mb-3">Protection</h3>
                    <p className="text-slate-500">Ancient duas and wazaif to shield you and your family from evil eye and harm.</p>
                </div>
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-spirit-100 text-center hover:-translate-y-2 transition-transform duration-500">
                    <div className="w-16 h-16 bg-accent-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Heart className="w-8 h-8 text-accent-500" />
                    </div>
                    <h3 className="text-xl font-bold text-spirit-900 mb-3">Healing</h3>
                    <p className="text-slate-500">Spiritual remedies for ailments of the heart, mind, and soul that defy physical explanation.</p>
                </div>
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-spirit-100 text-center hover:-translate-y-2 transition-transform duration-500">
                    <div className="w-16 h-16 bg-accent-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Star className="w-8 h-8 text-accent-500" />
                    </div>
                    <h3 className="text-xl font-bold text-spirit-900 mb-3">Guidance</h3>
                    <p className="text-slate-500">Istikhara and spiritual analysis to help you make decisions aligned with divine will.</p>
                </div>
            </div>
        </div>
      </section>

      {/* Services Highlight (Redirect to page) */}
      <section id="services" className="py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center gap-16">
                <div className="w-full md:w-1/2">
                    <span className="text-accent-600 font-bold tracking-[0.2em] uppercase text-sm mb-2 block">Our Expertise</span>
                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-spirit-900 mb-8">Specialized Spiritual Services</h2>
                    <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                        From breaking persistent spells (Kaat) to resolving relationship disharmony, our methods are rooted in authentic tradition and deep wisdom.
                    </p>
                    <ul className="space-y-4 mb-10">
                        {['Black Magic Removal', 'Marriage Obstacles', 'Business Blockages', 'Evil Eye Protection'].map((item) => (
                            <li key={item} className="flex items-center text-spirit-800 font-bold">
                                <div className="w-6 h-6 rounded-full bg-accent-100 flex items-center justify-center mr-4">
                                    <Check size={14} className="text-accent-600" />
                                </div>
                                {item}
                            </li>
                        ))}
                    </ul>
                    <Link to="/services" className="inline-flex items-center px-8 py-4 bg-spirit-900 text-white rounded-xl font-bold hover:bg-accent-600 transition gap-2">
                        View All Services <ArrowRight size={20} />
                    </Link>
                </div>
                <div className="w-full md:w-1/2 relative">
                    <div className="aspect-square bg-spirit-100 rounded-[3rem] rotate-3 overflow-hidden relative z-10">
                         <img src="https://images.unsplash.com/photo-1600609842388-3e4b7c6d48ac?q=80&w=800&auto=format&fit=crop" alt="Spiritual Peace" className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-1000" />
                    </div>
                    <div className="absolute top-10 -left-10 w-full h-full border-2 border-accent-200 rounded-[3rem] -z-0 rotate-6 hidden md:block"></div>
                </div>
            </div>
        </div>
      </section>

      {/* AI Spiritual Guide */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
                 <div className="text-center mb-12">
                     <span className="bg-white border border-slate-200 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-spirit-500 mb-4 inline-block">New Feature</span>
                     <h2 className="text-3xl md:text-4xl font-serif font-bold text-spirit-900">Instant Spiritual Wisdom</h2>
                     <p className="text-slate-500 mt-4">Ask our AI guide for a moment of reflection or advice.</p>
                 </div>
                 <SpiritualGuide />
            </div>
        </div>
      </section>

       {/* Contact Section */}
      <section id="contact" className="py-24 bg-spirit-900 text-white relative overflow-hidden">
        {/* Decorative */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent-600/10 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2"></div>
        
        <div className="container mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                <div>
                    <h2 className="text-4xl font-serif font-bold mb-6">Get in Touch</h2>
                    <p className="text-spirit-200 mb-10 text-lg leading-relaxed">
                        Do you feel weighed down by unseen forces? Reach out to us. We treat every case with confidentiality and compassion.
                    </p>
                    
                    <div className="space-y-8">
                        <div className="flex items-start gap-6">
                            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                                <MapPin className="text-accent-400" />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg mb-1">Visit Us</h4>
                                <p className="text-spirit-300">123 Spiritual Avenue, Peace District,<br/>Mystic City, 54000</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-6">
                            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                                <Mail className="text-accent-400" />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg mb-1">Email Us</h4>
                                <p className="text-spirit-300">shifa@jaadukikaat.com</p>
                                <p className="text-spirit-300">support@jaadukikaat.com</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-6">
                            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                                <Phone className="text-accent-400" />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg mb-1">Call Us</h4>
                                <p className="text-spirit-300">+1 (555) 123-4567</p>
                                <p className="text-xs text-spirit-400 mt-1">Available Mon-Fri, 9am - 6pm</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-8 md:p-10 text-slate-800 shadow-2xl">
                    <h3 className="text-2xl font-bold text-spirit-900 mb-6">Send a Message</h3>
                    <form onSubmit={handleContactSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Your Name</label>
                            <input 
                                required 
                                type="text" 
                                value={contactName}
                                onChange={e => setContactName(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent-500 outline-none" 
                                placeholder="John Doe" 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email Address</label>
                            <input 
                                required 
                                type="email" 
                                value={contactEmail}
                                onChange={e => setContactEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent-500 outline-none" 
                                placeholder="john@example.com" 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Message</label>
                            <textarea 
                                required 
                                rows={4} 
                                value={contactMessage}
                                onChange={e => setContactMessage(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent-500 outline-none resize-none" 
                                placeholder="How can we help you?"
                            ></textarea>
                        </div>
                        <button 
                            type="submit" 
                            disabled={contactStatus === 'submitting'}
                            className="w-full bg-spirit-900 text-white font-bold py-4 rounded-xl hover:bg-accent-600 transition shadow-lg disabled:opacity-70"
                        >
                            {contactStatus === 'submitting' ? 'Sending...' : 'Send Message'}
                        </button>
                        
                        {contactStatus === 'success' && (
                            <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm text-center font-bold">
                                Message sent successfully. We will contact you soon.
                            </div>
                        )}
                        {contactStatus === 'error' && (
                            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm text-center font-bold">
                                Failed to send message. Please try again.
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
      </section>

      {/* Prayer Request Modal */}
      {isPrayerRequestModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-spirit-900/80 backdrop-blur-sm" onClick={() => setIsPrayerRequestModalOpen(false)}></div>
            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8 relative animate-fade-in-up z-10 custom-scrollbar shadow-2xl">
                <button onClick={() => setIsPrayerRequestModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-full"><X size={24}/></button>
                
                <div className="mb-8 border-b border-slate-100 pb-6">
                    <span className="bg-accent-50 text-accent-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 inline-block">Sacred Request</span>
                    <h3 className="text-3xl font-serif font-bold text-spirit-900 mb-2">Submit Prayer Request</h3>
                    <p className="text-slate-500 text-sm">Please provide accurate details. Our spiritual team will include you in our special prayers.</p>
                </div>
                
                <form onSubmit={handlePrayerRequestSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Full Name</label>
                            <input required type="text" placeholder="e.g. Sarah Smith" value={prayerRequestName} onChange={e => setPrayerRequestName(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Mother's Name</label>
                            <input required type="text" placeholder="For spiritual identification" value={prayerRequestMotherName} onChange={e => setPrayerRequestMotherName(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Date of Birth</label>
                            <input type="text" placeholder="DD/MM/YYYY (Optional)" value={prayerRequestDob} onChange={e => setPrayerRequestDob(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Phone Number</label>
                            <input required type="tel" placeholder="+1 ..." value={prayerRequestPhone} onChange={e => setPrayerRequestPhone(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent-500 outline-none" />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email Address</label>
                        <input required type="email" placeholder="To receive updates" value={prayerRequestEmail} onChange={e => setPrayerRequestEmail(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent-500 outline-none" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">City</label>
                            <input required type="text" placeholder="Current City" value={prayerRequestCity} onChange={e => setPrayerRequestCity(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Country</label>
                            <input required type="text" placeholder="Current Country" value={prayerRequestCountry} onChange={e => setPrayerRequestCountry(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent-500 outline-none" />
                        </div>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                         <div className="flex items-center gap-2 mb-2">
                             <Moon size={16} className="text-accent-500" />
                             <p className="text-sm font-bold text-spirit-900 uppercase tracking-wide">Spiritual Context (Optional)</p>
                         </div>
                         <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">What have you recited?</label>
                            <input type="text" placeholder="e.g. Surah Yasin, Ayatul Kursi" value={prayerRequestRecitation} onChange={e => setPrayerRequestRecitation(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent-500 outline-none bg-white" />
                         </div>
                         <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">How many times?</label>
                            <input type="text" placeholder="e.g. 40 times" value={prayerRequestRecitationCount} onChange={e => setPrayerRequestRecitationCount(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent-500 outline-none bg-white" />
                         </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Purpose of Request</label>
                        <input required type="text" placeholder="e.g. Healing, Marriage, Success" value={prayerRequestPurpose} onChange={e => setPrayerRequestPurpose(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent-500 outline-none" />
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Additional Message</label>
                        <textarea rows={3} placeholder="Describe your specific problem..." value={prayerRequestMessage} onChange={e => setPrayerRequestMessage(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent-500 outline-none resize-none"></textarea>
                    </div>
                    
                    <button type="submit" disabled={isConsultSubmitting} className="w-full bg-spirit-900 text-white font-bold py-5 rounded-xl hover:bg-accent-600 transition shadow-lg text-lg flex items-center justify-center gap-2 disabled:opacity-70">
                        {isConsultSubmitting ? 'Submitting...' : 'Send Sacred Request'} <Send size={18} />
                    </button>
                    <p className="text-center text-xs text-slate-400">Your information is kept strictly confidential.</p>
                </form>
            </div>
        </div>
      )}

      {/* Success Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-10 max-w-sm w-full text-center animate-fade-in-up shadow-2xl">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <Check size={40} />
                </div>
                <h3 className="text-2xl font-serif font-bold text-spirit-900 mb-2">Request Received</h3>
                <p className="text-slate-500 mb-8 leading-relaxed">
                    We have received your prayer request. Our spiritual team will include you in the next session. May you find peace.
                </p>
                <button onClick={() => setIsSuccessModalOpen(false)} className="w-full bg-spirit-900 text-white font-bold py-4 rounded-xl hover:bg-spirit-800 transition">Close</button>
            </div>
        </div>
      )}

    </div>
  );
};

export default Home;
import React, { useState } from 'react';
import { Sparkles, ArrowRight, Loader } from 'lucide-react';
import { getSpiritualGuidance } from '../services/geminiService';

const SpiritualGuide: React.FC = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResponse(null);
    const result = await getSpiritualGuidance(query);
    setResponse(result);
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
      <div className="bg-spirit-900 p-10 text-white text-center relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent-500/15 rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <div className="w-16 h-16 bg-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Sparkles className="h-8 w-8 text-white animate-pulse" />
          </div>
          <h3 className="text-3xl font-serif font-bold mb-2">AI Spiritual Guide</h3>
          <p className="text-slate-400 text-sm font-medium">Seek compassionate wisdom through sacred algorithms.</p>
        </div>
      </div>
      <div className="p-10">
        <form onSubmit={handleAsk} className="space-y-6">
          <div className="relative">
            <textarea
              id="question"
              rows={4}
              className="w-full px-6 py-5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-accent-500 focus:border-transparent outline-none resize-none text-spirit-900 bg-slate-50 placeholder-slate-400 transition-all text-lg shadow-inner"
              placeholder="e.g., How can I find peace in difficult times?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !query}
            className={`w-full py-5 px-6 rounded-2xl flex items-center justify-center space-x-3 font-bold transition-all shadow-xl text-lg ${
              loading || !query 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' 
                : 'bg-accent-500 text-white hover:bg-accent-600 hover:scale-[1.02] active:scale-95'
            }`}
          >
            {loading ? (
              <>
                <Loader className="animate-spin h-6 w-6" />
                <span>Meditating...</span>
              </>
            ) : (
              <>
                <span className="uppercase tracking-widest">Seek Shifa Guidance</span>
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </form>

        {response && (
          <div className="mt-10 p-8 bg-slate-50 rounded-3xl border border-slate-200 animate-fade-in relative shadow-inner">
            <div className="absolute top-0 left-0 w-2 h-full bg-accent-500 rounded-l-3xl"></div>
            <h4 className="text-accent-600 font-bold mb-4 text-xs uppercase tracking-[0.3em]">A Moment of Insight:</h4>
            <p className="text-spirit-900 italic leading-relaxed text-2xl font-light">"{response}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpiritualGuide;
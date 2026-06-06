import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, Trash2, Download } from 'lucide-react';
import { BlogPost } from '../types';

export const UsersTab: React.FC = () => {
  const [leads, setLeads] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFormTab, setActiveFormTab] = useState<string>("All");

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('category', '_form_lead_')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setLeads(data);
    }
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) return;
    setIsLoading(true);
    await supabase.from('posts').delete().eq('id', id);
    await fetchLeads();
  };

  const baseRequestedForms = [
    "Dua", 
    "Wazaif", 
    "Istikhara", 
    "Rohaani ilaaj", 
    "Jaadu ki kaat", 
    "Job Success", 
    "Prayer Requests", 
    "IsmeAzam", 
    "Contact", 
    "Wisdom Subscriber"
  ];

  const dynamicForms = Array.from(new Set(leads.map(lead => lead.title))).filter(
    title => title && !baseRequestedForms.find(rf => rf.toLowerCase() === title.toLowerCase())
  );

  const forms = ["All", ...baseRequestedForms, ...dynamicForms];

  const filteredLeads = activeFormTab === "All" 
    ? leads 
    : leads.filter(lead => {
        // Handle common mapping / fallback
        if (lead.title === "Prayer Requests" && activeFormTab.toLowerCase() === "pray request") return true;
        if (lead.title === "Contact" && activeFormTab.toLowerCase() === "contact us") return true;
        
        return lead.title && lead.title.toLowerCase() === activeFormTab.toLowerCase();
      });

  const handleExportCSV = () => {
    if (filteredLeads.length === 0) return;
    
    // Extract headers based on parsed JSON payload
    let headers = new Set<string>(['Date', 'Form Type']);
    const parsedData = filteredLeads.map(lead => {
      let parsed = {};
      try { parsed = JSON.parse(lead.content); } catch (e) {}
      
      Object.keys(parsed).forEach(k => headers.add(k));
      return {
        Date: new Date(lead.date || lead.created_at || '').toLocaleDateString(),
        'Form Type': lead.title,
        ...parsed
      };
    });

    const headerArray = Array.from(headers);
    let csv = headerArray.join(',') + '\n';
    
    parsedData.forEach(row => {
      csv += headerArray.map(header => `"${(row as any)[header] || ''}"`).join(',') + '\n';
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${activeFormTab.toLowerCase()}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const currentHeaders = new Set<string>();
  const parsedDataMap = new Map<string, Record<string, string>>();

  filteredLeads.forEach(lead => {
    let parsed = {};
    if (lead.content) {
      try { parsed = JSON.parse(lead.content); } catch (e) {}
    }
    parsedDataMap.set(lead.id, parsed);
    Object.keys(parsed).forEach(k => {
      // Exclude generic/redundant keys that we already show
      if (k !== 'Title' && k !== 'category') {
         currentHeaders.add(k);
      }
    });
  });

  const headersArray = Array.from(currentHeaders);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-800">Users & Leads</h1>
          <p className="text-gray-500 mt-1">Manage form submissions across the sanctuary.</p>
        </div>
        <button 
          onClick={handleExportCSV}
          className="bg-spirit-600 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-spirit-700 transition shadow-md flex items-center"
        >
          <Download size={18} className="mr-2" /> Export CSV
        </button>
      </div>

      {/* Horizontal Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2 border-b border-gray-200 scrollbar-hide">
        {forms.map(form => (
          <button
            key={form}
            onClick={() => setActiveFormTab(form)}
            className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${
              activeFormTab === form 
                ? 'bg-spirit-900 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {form === 'IsmeAzam' ? 'Ism E Azam' : form}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-spirit-500" />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {filteredLeads.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              No leads found in this category.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-4 font-semibold whitespace-nowrap">Date</th>
                    <th className="px-6 py-4 font-semibold whitespace-nowrap">Form Type</th>
                    {headersArray.map(header => (
                      <th key={header} className="px-6 py-4 font-semibold whitespace-nowrap">{header}</th>
                    ))}
                    <th className="px-6 py-4 font-semibold text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredLeads.map((lead) => {
                    const parsed = parsedDataMap.get(lead.id) || {};
                    return (
                      <tr key={lead.id} className="hover:bg-gray-50/50 transition">
                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                          {new Date(lead.date || lead.created_at || '').toLocaleDateString()}
                          <span className="block text-xs text-gray-400 mt-1">
                            {new Date(lead.date || lead.created_at || '').toLocaleTimeString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap">
                          <span className="bg-spirit-100 text-spirit-800 text-xs px-2 py-1 rounded font-bold uppercase tracking-wide">
                            {lead.title}
                          </span>
                        </td>
                        {headersArray.map(header => (
                          <td key={header} className="px-6 py-4 text-sm text-gray-700 max-w-[200px] truncate" title={parsed[header]}>
                            {parsed[header] || '-'}
                          </td>
                        ))}
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <button 
                            onClick={() => handleDelete(lead.id)} 
                            className="text-gray-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition"
                            title="Delete Lead"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, Mail, Users, CheckSquare, Square, Search } from 'lucide-react';
import RichTextEditor from './RichTextEditor';
import { sendCustomEmail } from '../services/sheetService';

export const EmailTab: React.FC = () => {
  const [leads, setLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedForms, setSelectedForms] = useState<string[]>([]);
  const [subject, setSubject] = useState("");
  const [bodyData, setBodyData] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('category', '_form_lead_');

    if (!error && data) {
      setLeads(data);
    }
    setIsLoading(false);
  };

  const baseRequestedForms = [
    "Dua", "Wazaif", "Istikhara", "Rohaani ilaaj", "Jaadu ki kaat", 
    "Job Success", "Prayer Requests", "IsmeAzam", "Contact", "Wisdom Subscriber"
  ];
  
  const dynamicForms = Array.from(new Set(leads.map(lead => lead.title))).filter(
    title => title && !baseRequestedForms.find(rf => rf.toLowerCase() === title.toLowerCase())
  );
  
  const allForms = [...baseRequestedForms, ...dynamicForms];

  // Derive unique emails from selected forms
  const filteredLeads = leads.filter(lead => {
    if (selectedForms.length === 0) return true; // If none selected, actually we might want to default to ALL or NONE. Let's say if none is selected, list is empty? Or if 'All' is selected. Let's make explicit selection.
    
    // Check mapping
    if (selectedForms.includes("Prayer Requests") && lead.title === "Prayer Requests") return true;
    if (selectedForms.includes("Contact") && lead.title === "Contact") return true;
    
    return selectedForms.some(sf => sf.toLowerCase() === (lead.title || '').toLowerCase());
  });

  const getValidEmails = (leadsArray: any[]) => {
    const emails = new Set<string>();
    leadsArray.forEach(lead => {
      try {
        const parsed = JSON.parse(lead.content || '{}');
        const email = parsed['Email Address'] || parsed['email'] || parsed['Email'];
        if (email && typeof email === 'string' && email.includes('@')) {
          emails.add(email.trim());
        }
      } catch (e) {}
    });
    return Array.from(emails);
  };

  let finalEmails: string[] = [];
  if (selectedForms.length > 0) {
    finalEmails = getValidEmails(filteredLeads);
  } else {
    // If nothing selected, none
    finalEmails = [];
  }

  const toggleFormSelection = (form: string) => {
    if (selectedForms.includes(form)) {
      setSelectedForms(selectedForms.filter(f => f !== form));
    } else {
      setSelectedForms([...selectedForms, form]);
    }
  };

  const selectAll = () => {
    setSelectedForms(allForms);
  };

  const checkAllSelected = () => {
    return selectedForms.length === allForms.length;
  };

  const parseRichTextToHtml = (jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      if (data.version === 1 && Array.isArray(data.rows)) {
        let html = '<div style="width: 100%; max-width: 600px; margin: 0 auto; font-family: sans-serif;">';
        data.rows.forEach((row: any) => {
          html += '<table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 15px;"><tr>';
          row.columns.forEach((col: any) => {
            html += `<td width="${col.width}%" valign="top" style="padding: 10px;">${col.content}</td>`;
          });
          html += '</tr></table>';
        });
        html += '</div>';
        return html;
      }
      return jsonString; // Fallback
    } catch (e) {
      // If it's not JSON, might be raw HTML
      return jsonString;
    }
  };

  const [testEmail, setTestEmail] = useState("");
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // ... (previous functions remain the same)
  
  const handleSendTestEmail = async () => {
    if (!testEmail || !testEmail.includes('@')) {
      setNotification({ type: 'error', text: 'Please enter a valid test email address.' });
      return;
    }
    if (!subject.trim()) {
      setNotification({ type: 'error', text: 'Please enter an email subject.' });
      return;
    }
    if (!bodyData.trim()) {
      setNotification({ type: 'error', text: 'Email body cannot be empty.' });
      return;
    }

    setIsSendingTest(true);
    setNotification(null);

    const fullHtml = parseRichTextToHtml(bodyData);
    const success = await sendCustomEmail([testEmail.trim()], `[TEST] ${subject}`, fullHtml);

    if (success) {
      setNotification({ type: 'success', text: `Test email successfully sent to ${testEmail}.` });
    } else {
      setNotification({ type: 'error', text: 'Failed to send test email. Check console for details.' });
    }
    setIsSendingTest(false);
  };

  const handleSendEmail = async () => {
    if (finalEmails.length === 0) {
      setNotification({ type: 'error', text: 'No valid recipient emails found for selected forms.' });
      return;
    }
    if (!subject.trim()) {
      setNotification({ type: 'error', text: 'Please enter an email subject.' });
      return;
    }
    if (!bodyData.trim()) {
      setNotification({ type: 'error', text: 'Email body cannot be empty.' });
      return;
    }

    setIsSending(true);
    setNotification(null);

    const fullHtml = parseRichTextToHtml(bodyData);

    const success = await sendCustomEmail(finalEmails, subject, fullHtml);

    if (success) {
      setNotification({ type: 'success', text: `Email successfully sent to ${finalEmails.length} recipient(s).` });
      setSubject("");
      // Don't clear body data to allow minor edits and resends easily, or clear it if preferred.
    } else {
      setNotification({ type: 'error', text: 'Failed to send email. Check console for details.' });
    }

    setIsSending(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-800">Email Marketing</h1>
          <p className="text-gray-500 mt-1">Design and send emails directly to your form leads.</p>
        </div>
      </div>

      <div className="space-y-6 max-w-full">
        
        {/* TOP COMPONENT: Settings & Audience */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Audience & Subject */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Campaign Audience</label>
                <div className="relative">
                  <div 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer flex justify-between items-center hover:bg-gray-100 transition"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >
                    <span className={selectedForms.length === 0 ? "text-gray-400" : "text-gray-900 font-medium"}>
                      {selectedForms.length === 0 
                        ? "Select users / leads to target..." 
                        : selectedForms.length === allForms.length 
                          ? "All Users Selected" 
                          : `${selectedForms.length} segments selected`}
                    </span>
                    <span className="bg-spirit-600 text-white rounded-full px-2 py-0.5 text-xs font-bold leading-none flex items-center ml-2">{finalEmails.length} recipients</span>
                  </div>
                  
                  {dropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 shadow-xl rounded-lg z-50 max-h-64 overflow-y-auto w-full">
                      <div className="p-4 border-b border-gray-100 flex items-center justify-between hover:bg-gray-50 cursor-pointer rounded-t-lg" onClick={() => checkAllSelected() ? setSelectedForms([]) : selectAll()}>
                         <span className="font-bold text-sm text-gray-700">Select All Segments</span>
                         {checkAllSelected() ? <CheckSquare className="text-spirit-600" size={18} /> : <Square className="text-gray-400" size={18} />}
                      </div>
                      <div className="p-2">
                        {allForms.map(form => (
                          <div 
                            key={form} 
                            onClick={() => toggleFormSelection(form)}
                            className="flex justify-between items-center p-3 hover:bg-gray-50 rounded cursor-pointer transition"
                          >
                            <span className="text-sm text-gray-600 font-medium">{form === 'IsmeAzam' ? 'Ism E Azam' : form}</span>
                            {selectedForms.includes(form) ? <CheckSquare className="text-spirit-600" size={16} /> : <Square className="text-gray-300" size={16} />}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-spirit-500 transition"
                  placeholder="Enter a compelling subject line..."
                />
              </div>
            </div>

            {/* Test Email Section */}
            <div className="space-y-6 md:border-l md:border-gray-100 md:pl-8">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center justify-between">
                  <span>Send Test Email</span>
                  <span className="text-xs font-normal text-gray-400">Verify design before broadcast</span>
                </label>
                <div className="flex flex-col gap-3">
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-spirit-500 transition"
                    placeholder="Enter your email address..."
                  />
                  <p className="text-[11px] text-gray-400 -mt-1 leading-tight">Note: Check your Spam or Promotions folder if you don't see it within a minute.</p>
                  <button
                    onClick={handleSendTestEmail}
                    type="button"
                    disabled={isSendingTest || !testEmail}
                    className="bg-gray-800 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-900 transition shadow-sm disabled:opacity-50 flex items-center justify-center w-full"
                  >
                    {isSendingTest ? (
                      <Loader2 size={18} className="animate-spin mr-2" />
                    ) : (
                      <Mail size={18} className="mr-2" />
                    )}
                    Send Test Email
                  </button>
                </div>
              </div>
            </div>
            
          </div>
        </div>

        {/* EDITOR COMPONENT */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative w-full mb-10 overflow-hidden">
          <label className="block text-sm font-bold text-gray-700 mb-4">Email Designer</label>
          <RichTextEditor
            initialValue={bodyData}
            onChange={(val) => setBodyData(val)}
          />
          
          {notification && (
            <div className={`mt-6 p-4 rounded-lg text-sm font-bold ${notification.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {notification.text}
            </div>
          )}

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSendEmail}
              type="button"
              disabled={isSending || finalEmails.length === 0}
              className="bg-spirit-600 text-white font-bold py-3 px-10 rounded-lg hover:bg-spirit-700 transition shadow-md disabled:opacity-50 flex items-center w-full md:w-auto justify-center"
            >
              {isSending ? (
                <>
                  <Loader2 size={18} className="animate-spin mr-2" /> Sending Campaign...
                </>
              ) : (
                <>
                  <Mail size={18} className="mr-2" /> Send To {finalEmails.length} Recipients
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

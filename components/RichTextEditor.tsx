
import React, { useState, useEffect, useRef } from 'react';
import { 
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, 
  Image as ImageIcon, Video, Trash2, Layout, 
  MoveHorizontal, Palette, Type as TypeIcon, Highlighter,
  X, CloudUpload, Link as LinkIcon, Monitor, Check
} from 'lucide-react';

interface Column {
  id: string;
  width: number; // Percentage
  content: string; // HTML
}

interface Row {
  id: string;
  columns: Column[];
}

interface RichTextEditorProps {
  initialValue: string;
  onChange: (value: string) => void;
}

// Helper component for the width input to handle focus/blur logic correctly
const ColumnWidthInput: React.FC<{ 
    width: number; 
    onUpdate: (val: number) => void;
}> = ({ width, onUpdate }) => {
    const [val, setVal] = useState<string | number>(width);
    const inputRef = useRef<HTMLInputElement>(null);

    // Sync with external changes (e.g. neighbor balancing) only when not focused
    useEffect(() => {
        if (document.activeElement !== inputRef.current) {
            setVal(width);
        }
    }, [width]);

    const commit = () => {
        let num = parseInt(val.toString());
        if (isNaN(num)) {
            // Revert to prop if invalid
            setVal(width);
            return;
        }
        // Clamp locally before sending
        if (num < 5) num = 5;
        if (num > 95) num = 95;
        
        onUpdate(num);
        setVal(num);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent form submission
            e.currentTarget.blur(); // Triggers onBlur -> commit
        }
    };

    return (
        <input 
            ref={inputRef}
            type="number" 
            value={val}
            min="5" max="95"
            onChange={(e) => setVal(e.target.value)}
            onBlur={commit}
            onKeyDown={handleKeyDown}
            className="w-12 text-center border border-gray-200 rounded bg-gray-50 focus:border-spirit-500 outline-none text-xs py-1"
        />
    );
};

const RichTextEditor: React.FC<RichTextEditorProps> = ({ initialValue, onChange }) => {
  const [rows, setRows] = useState<Row[]>([]);
  
  // State for popups
  const [showLayoutModal, setShowLayoutModal] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [mediaTab, setMediaTab] = useState<'upload' | 'url'>('upload');
  
  // State for media inputs
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);

  // Selection management
  const [activeColId, setActiveColId] = useState<string | null>(null);
  const savedRange = useRef<Range | null>(null);

  // Initialize state
  useEffect(() => {
    try {
      if (initialValue && initialValue.trim().startsWith('{')) {
        const parsed = JSON.parse(initialValue);
        if (parsed.version === 1 && Array.isArray(parsed.rows)) {
          setRows(parsed.rows);
          return;
        }
      }
    } catch (e) {
      // Not JSON
    }

    if (!rows.length && initialValue) {
        setRows([{
            id: Date.now().toString(),
            columns: [{ id: 'col-1', width: 100, content: initialValue }]
        }]);
    } else if (!rows.length) {
        setRows([{
            id: Date.now().toString(),
            columns: [{ id: 'col-1', width: 100, content: '' }]
        }]);
    }
  }, []);

  // Sync parent
  useEffect(() => {
    const data = JSON.stringify({ version: 1, rows });
    onChange(data);
  }, [rows, onChange]);

  // --- SELECTION HELPERS ---
  
  const saveSelection = () => {
    const sel = window.getSelection();
    // Only save if we are selecting inside the editor
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      // Verify the selection is actually inside our active column
      if (activeColId) {
          const container = document.getElementById(`editable-${activeColId}`);
          if (container && container.contains(range.commonAncestorContainer)) {
              savedRange.current = range.cloneRange();
          }
      }
    }
  };

  const restoreSelection = () => {
    const sel = window.getSelection();
    if (sel && savedRange.current) {
      sel.removeAllRanges();
      sel.addRange(savedRange.current);
    }
  };

  const handleFocus = (colId: string) => {
    setActiveColId(colId);
  };

  const handleContentChange = (colId: string, html: string) => {
    setRows(prev => prev.map(row => ({
      ...row,
      columns: row.columns.map(col => col.id === colId ? { ...col, content: html } : col)
    })));
  };

  // --- COMMAND EXECUTION ---

  const execCmd = (command: string, value: string | undefined = undefined) => {
    // 1. Focus the active editable div if valid
    if (activeColId) {
        const el = document.getElementById(`editable-${activeColId}`);
        if(el) {
            el.focus();
            // Restore selection only if it belongs to this element
            if (savedRange.current && el.contains(savedRange.current.commonAncestorContainer)) {
                restoreSelection();
            }
        }
    }
    
    // 2. Execute
    document.execCommand(command, false, value);

    // 3. Update state immediately to reflect changes
    if (activeColId) {
        const el = document.getElementById(`editable-${activeColId}`);
        if (el) handleContentChange(activeColId, el.innerHTML);
    }
    
    // 4. Save new selection state
    saveSelection();
  };

  // Prevent button click from stealing focus entirely
  const onToolbarBtnClick = (e: React.MouseEvent, command: string, value?: string) => {
    e.preventDefault(); 
    execCmd(command, value);
  };

  // --- ROW / COL MANAGEMENT ---

  const addRow = (cols: number) => {
    const newRow: Row = {
      id: Date.now().toString(),
      columns: Array(cols).fill(0).map((_, i) => ({
        id: `${Date.now()}-${i}`,
        width: Math.floor(100 / cols),
        content: ''
      }))
    };
    // Fix rounding errors for 3 cols (33, 33, 33 -> 99)
    if (cols === 3) newRow.columns[2].width = 34;

    setRows([...rows, newRow]);
    setShowLayoutModal(false);
  };

  const deleteRow = (rowId: string) => {
    if (rows.length > 1) {
        setRows(rows.filter(r => r.id !== rowId));
    } else {
        alert("You must have at least one section.");
    }
  };

  const updateColWidth = (rowId: string, colId: string, newWidth: number) => {
    // Clamp width logic handled in input, but safety check here
    if (newWidth < 5) newWidth = 5;
    if (newWidth > 95) newWidth = 95;

    setRows(prev => prev.map(r => {
      if (r.id !== rowId) return r;
      
      const cols = [...r.columns];
      const targetIndex = cols.findIndex(c => c.id === colId);
      if (targetIndex === -1) return r;

      const oldWidth = cols[targetIndex].width;
      const diff = newWidth - oldWidth;
      
      if (diff === 0) return r;

      // Find neighbor to adjust
      // If not last column, take from next. If last, take from prev.
      let neighborIndex = targetIndex + 1;
      if (neighborIndex >= cols.length) neighborIndex = targetIndex - 1;

      // Adjust neighbor
      if (neighborIndex >= 0 && neighborIndex < cols.length) {
          let neighborWidth = cols[neighborIndex].width - diff;
          
          // Safety check for neighbor
          if (neighborWidth < 5) {
             // If neighbor would be too small, cap the change
             // Recalculate newWidth based on min neighbor width
             neighborWidth = 5;
             newWidth = oldWidth + (cols[neighborIndex].width - 5);
          }

          cols[targetIndex] = { ...cols[targetIndex], width: newWidth };
          cols[neighborIndex] = { ...cols[neighborIndex], width: neighborWidth };
      }

      return { ...r, columns: cols };
    }));
  };

  // --- MEDIA HANDLING ---

  const openMediaModal = (type: 'image' | 'video') => {
    // Attempt to save selection before opening. 
    // If no selection exists or it's outside, activeColId will help us fallback.
    saveSelection();
    
    if (!activeColId && rows.length > 0 && rows[0].columns.length > 0) {
        // Default to first column if nothing active
        setActiveColId(rows[0].columns[0].id);
    }

    setMediaType(type);
    setMediaTab('upload');
    setMediaUrl('');
    setMediaFile(null);
    setShowMediaModal(true);
  };

  const handleMediaSubmit = () => {
    if (!activeColId) {
        alert("Please click inside a content area first.");
        return;
    }

    // 1. Refocus the editor container
    const el = document.getElementById(`editable-${activeColId}`);
    if (el) {
        el.focus();
        // Restore range if valid
        if (savedRange.current && el.contains(savedRange.current.commonAncestorContainer)) {
             restoreSelection();
        } else {
             // Fallback: Move cursor to end if no valid range found inside this col
             const range = document.createRange();
             range.selectNodeContents(el);
             range.collapse(false); // collapse to end
             const sel = window.getSelection();
             sel?.removeAllRanges();
             sel?.addRange(range);
        }
    }

    // 2. Insert Logic
    if (mediaTab === 'url') {
        if (!mediaUrl) return;
        
        if (mediaType === 'image') {
            document.execCommand('insertImage', false, mediaUrl);
        } else {
            // Video URL logic
            let embedHtml = '';
            if (mediaUrl.includes('youtube.com') || mediaUrl.includes('youtu.be')) {
                const videoId = mediaUrl.split('v=')[1]?.split('&')[0] || mediaUrl.split('/').pop();
                embedHtml = `<div class="video-wrapper"><iframe width="100%" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div><p><br></p>`;
            } else {
                embedHtml = `<div class="video-wrapper"><video controls width="100%" src="${mediaUrl}"></video></div><p><br></p>`;
            }
            document.execCommand('insertHTML', false, embedHtml);
        }
    } else {
        // Upload Logic (Base64)
        if (!mediaFile) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            // Refocus again inside async
            if (el) {
                el.focus();
                restoreSelection(); // Try restoring again just in case
            }
            
            if (mediaType === 'image') {
                // Insert HTML with full width
                const imgHtml = `<img src="${result}" style="width:100%; height:auto; display:block;" /><p><br></p>`;
                document.execCommand('insertHTML', false, imgHtml);
            } else {
                const embedHtml = `<div class="video-wrapper"><video controls width="100%" src="${result}"></video></div><p><br></p>`;
                document.execCommand('insertHTML', false, embedHtml);
            }
            
            // Force update state
            if (el) handleContentChange(activeColId, el.innerHTML);
        };
        reader.readAsDataURL(mediaFile);
    }

    // Force update state for URL path (sync)
    if (mediaTab === 'url' && el) {
        handleContentChange(activeColId, el.innerHTML);
    }

    setShowMediaModal(false);
  };


  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm relative">
      <style>{`
        .prose img { width: 100%; height: auto; border-radius: 0; margin: 4px 0; display: block; }
        .prose .video-wrapper { position: relative; width: 100%; margin: 4px 0; border-radius: 0; overflow: hidden; }
        .prose iframe, .prose video { width: 100%; max-width: 100%; display: block; }
      `}</style>

      {/* --- TOOLBAR --- */}
      <div className="bg-gray-50 border-b border-gray-200 p-2 flex flex-wrap gap-2 items-center sticky top-0 z-20">
        
        {/* Text Formatting */}
        <div className="flex bg-white rounded border border-gray-200 shadow-sm">
          <button type="button" onMouseDown={(e) => onToolbarBtnClick(e, 'bold')} className="p-2 hover:bg-gray-100 text-gray-700" title="Bold"><Bold size={16}/></button>
          <button type="button" onMouseDown={(e) => onToolbarBtnClick(e, 'italic')} className="p-2 hover:bg-gray-100 text-gray-700" title="Italic"><Italic size={16}/></button>
          <button type="button" onMouseDown={(e) => onToolbarBtnClick(e, 'underline')} className="p-2 hover:bg-gray-100 text-gray-700" title="Underline"><Underline size={16}/></button>
        </div>

        <div className="h-6 w-px bg-gray-300 mx-1"></div>

        {/* Alignment */}
        <div className="flex bg-white rounded border border-gray-200 shadow-sm">
          <button type="button" onMouseDown={(e) => onToolbarBtnClick(e, 'justifyLeft')} className="p-2 hover:bg-gray-100 text-gray-700"><AlignLeft size={16}/></button>
          <button type="button" onMouseDown={(e) => onToolbarBtnClick(e, 'justifyCenter')} className="p-2 hover:bg-gray-100 text-gray-700"><AlignCenter size={16}/></button>
          <button type="button" onMouseDown={(e) => onToolbarBtnClick(e, 'justifyRight')} className="p-2 hover:bg-gray-100 text-gray-700"><AlignRight size={16}/></button>
        </div>

        <div className="h-6 w-px bg-gray-300 mx-1"></div>

        {/* Colors & Fonts */}
        <div className="flex items-center gap-2">
            <div className="flex bg-white rounded border border-gray-200 items-center px-2 py-1 shadow-sm" title="Text Color">
                <Palette size={16} className="text-gray-500 mr-2" />
                <input 
                    type="color" 
                    onChange={(e) => execCmd('foreColor', e.target.value)}
                    className="w-5 h-5 p-0 border-0 bg-transparent cursor-pointer"
                />
            </div>

            <div className="flex bg-white rounded border border-gray-200 items-center px-2 py-1 shadow-sm" title="Highlight Color">
                <Highlighter size={16} className="text-gray-500 mr-2" />
                <input 
                    type="color" 
                    onChange={(e) => execCmd('hiliteColor', e.target.value)}
                    className="w-5 h-5 p-0 border-0 bg-transparent cursor-pointer"
                    defaultValue="#ffffff"
                />
            </div>

            <div className="flex bg-white rounded border border-gray-200 items-center px-2 shadow-sm">
                <TypeIcon size={16} className="text-gray-500 mr-1" />
                <select 
                    onChange={(e) => execCmd('fontSize', e.target.value)} 
                    className="text-sm bg-transparent outline-none py-1.5 w-20"
                    defaultValue="3"
                >
                    <option value="1">Small</option>
                    <option value="3">Normal</option>
                    <option value="5">Large</option>
                    <option value="7">Huge</option>
                </select>
            </div>
        </div>

        <div className="h-6 w-px bg-gray-300 mx-1"></div>

        {/* Media Buttons */}
        <button 
            type="button" 
            onClick={() => openMediaModal('image')} 
            className="p-2 bg-white rounded border border-gray-200 hover:bg-gray-100 flex items-center gap-1 text-sm font-medium text-gray-700 shadow-sm"
        >
            <ImageIcon size={16} /> Image
        </button>
        <button 
            type="button" 
            onClick={() => openMediaModal('video')} 
            className="p-2 bg-white rounded border border-gray-200 hover:bg-gray-100 flex items-center gap-1 text-sm font-medium text-gray-700 shadow-sm"
        >
            <Video size={16} /> Video
        </button>

        <div className="flex-grow"></div>

        {/* Layout Button */}
        <button 
            type="button" 
            onClick={() => setShowLayoutModal(true)} 
            className="p-2 bg-spirit-50 border border-spirit-200 text-spirit-700 rounded hover:bg-spirit-100 flex items-center gap-2 text-sm font-bold shadow-sm"
        >
            <Layout size={18} /> Add Layout
        </button>
      </div>

      {/* --- CANVAS --- */}
      <div className="p-8 bg-gray-100 min-h-[500px] space-y-8">
        {rows.map((row, rIndex) => (
            <div key={row.id} className="relative group bg-white rounded-xl border border-dashed border-gray-300 hover:border-spirit-400 transition-colors shadow-sm overflow-hidden">
                {/* Row Header / Controls */}
                <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Section {rIndex + 1}</span>
                    <button 
                        type="button" 
                        onClick={() => deleteRow(row.id)} 
                        className="text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1 text-xs"
                        title="Delete Section"
                    >
                        <Trash2 size={14} /> Remove
                    </button>
                </div>

                <div className="p-4 flex flex-wrap gap-6">
                    {row.columns.map((col) => (
                        <div 
                            key={col.id} 
                            style={{ width: `${col.width}%`, flex: `1 1 0` }}
                            className="flex flex-col min-w-[150px]"
                        >
                            {/* Column Header / Resizer */}
                            <div className="flex items-center justify-between text-xs text-gray-400 mb-2 px-1">
                                <span className="flex items-center"><MoveHorizontal size={10} className="mr-1"/> Width %</span>
                                <ColumnWidthInput 
                                    width={col.width}
                                    onUpdate={(val) => updateColWidth(row.id, col.id, val)}
                                />
                            </div>

                            {/* Editable Content */}
                            <div 
                                id={`editable-${col.id}`}
                                contentEditable
                                suppressContentEditableWarning
                                onFocus={() => handleFocus(col.id)}
                                onBlur={(e) => {
                                    handleContentChange(col.id, e.currentTarget.innerHTML);
                                    saveSelection();
                                }}
                                onKeyUp={saveSelection}
                                onMouseUp={saveSelection}
                                dangerouslySetInnerHTML={{ __html: col.content }}
                                className={`border rounded-lg p-4 min-h-[150px] focus:outline-none focus:ring-2 focus:ring-spirit-300 focus:border-transparent prose max-w-none text-sm transition-shadow ${activeColId === col.id ? 'bg-white border-spirit-300 shadow-md ring-2 ring-spirit-100' : 'bg-gray-50 border-gray-200'}`}
                                style={{ minHeight: '150px' }}
                            />
                        </div>
                    ))}
                </div>
            </div>
        ))}
        
        {rows.length === 0 && (
            <div className="text-center text-gray-400 py-10">
                Start by adding a layout section from the toolbar.
            </div>
        )}
      </div>

      <div className="bg-gray-50 px-4 py-2 text-xs text-gray-500 border-t border-gray-200 flex justify-between">
          <span>Tip: Highlight text to format. Click 'Image' or 'Video' to insert media.</span>
          <span>{rows.length} Sections</span>
      </div>

      {/* --- POPUP: LAYOUT SELECTION --- */}
      {showLayoutModal && (
        <div className="absolute inset-0 z-50 flex items-start justify-center pt-20 bg-black/20 backdrop-blur-[1px]">
            <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-6 w-96 animate-fade-in">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-800 flex items-center"><Layout size={18} className="mr-2 text-spirit-600"/> Select Columns</h3>
                    <button type="button" onClick={() => setShowLayoutModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <button type="button" onClick={() => addRow(1)} className="border border-gray-200 rounded-lg p-4 hover:bg-spirit-50 hover:border-spirit-300 transition flex flex-col items-center gap-2 group">
                        <div className="w-full h-8 bg-gray-200 rounded group-hover:bg-spirit-200 border border-gray-300"></div>
                        <span className="text-xs font-bold text-gray-600">1 Column</span>
                    </button>
                    <button type="button" onClick={() => addRow(2)} className="border border-gray-200 rounded-lg p-4 hover:bg-spirit-50 hover:border-spirit-300 transition flex flex-col items-center gap-2 group">
                        <div className="flex gap-1 w-full">
                            <div className="w-1/2 h-8 bg-gray-200 rounded group-hover:bg-spirit-200 border border-gray-300"></div>
                            <div className="w-1/2 h-8 bg-gray-200 rounded group-hover:bg-spirit-200 border border-gray-300"></div>
                        </div>
                        <span className="text-xs font-bold text-gray-600">2 Columns</span>
                    </button>
                    <button type="button" onClick={() => addRow(3)} className="border border-gray-200 rounded-lg p-4 hover:bg-spirit-50 hover:border-spirit-300 transition flex flex-col items-center gap-2 group">
                        <div className="flex gap-1 w-full">
                            <div className="w-1/3 h-8 bg-gray-200 rounded group-hover:bg-spirit-200 border border-gray-300"></div>
                            <div className="w-1/3 h-8 bg-gray-200 rounded group-hover:bg-spirit-200 border border-gray-300"></div>
                            <div className="w-1/3 h-8 bg-gray-200 rounded group-hover:bg-spirit-200 border border-gray-300"></div>
                        </div>
                        <span className="text-xs font-bold text-gray-600">3 Columns</span>
                    </button>
                    <button type="button" onClick={() => addRow(4)} className="border border-gray-200 rounded-lg p-4 hover:bg-spirit-50 hover:border-spirit-300 transition flex flex-col items-center gap-2 group">
                        <div className="flex gap-1 w-full">
                            <div className="w-1/4 h-8 bg-gray-200 rounded group-hover:bg-spirit-200 border border-gray-300"></div>
                            <div className="w-1/4 h-8 bg-gray-200 rounded group-hover:bg-spirit-200 border border-gray-300"></div>
                            <div className="w-1/4 h-8 bg-gray-200 rounded group-hover:bg-spirit-200 border border-gray-300"></div>
                            <div className="w-1/4 h-8 bg-gray-200 rounded group-hover:bg-spirit-200 border border-gray-300"></div>
                        </div>
                        <span className="text-xs font-bold text-gray-600">4 Columns</span>
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* --- POPUP: MEDIA INSERTION --- */}
      {showMediaModal && (
        <div className="absolute inset-0 z-50 flex items-start justify-center pt-20 bg-black/20 backdrop-blur-[1px]">
            <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-6 w-96 animate-fade-in">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-gray-800 flex items-center capitalize">
                        {mediaType === 'image' ? <ImageIcon size={18} className="mr-2 text-spirit-600"/> : <Video size={18} className="mr-2 text-spirit-600"/>} 
                        Insert {mediaType}
                    </h3>
                    <button type="button" onClick={() => setShowMediaModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
                </div>

                {/* Tabs */}
                <div className="flex mb-6 bg-gray-100 p-1 rounded-lg">
                    <button 
                        type="button"
                        onClick={() => setMediaTab('upload')}
                        className={`flex-1 py-2 text-sm font-bold rounded-md flex items-center justify-center gap-2 transition ${mediaTab === 'upload' ? 'bg-white text-spirit-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Monitor size={14} /> Upload
                    </button>
                    <button 
                        type="button"
                        onClick={() => setMediaTab('url')}
                        className={`flex-1 py-2 text-sm font-bold rounded-md flex items-center justify-center gap-2 transition ${mediaTab === 'url' ? 'bg-white text-spirit-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <LinkIcon size={14} /> Link
                    </button>
                </div>

                {/* Content */}
                <div className="mb-6">
                    {mediaTab === 'upload' ? (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition relative">
                             <input 
                                type="file" 
                                accept={mediaType === 'image' ? "image/*" : "video/*"}
                                onChange={(e) => setMediaFile(e.target.files?.[0] || null)}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                             />
                             {mediaFile ? (
                                <div className="text-center">
                                    <Check className="w-8 h-8 text-green-500 mx-auto mb-2" />
                                    <p className="text-sm font-bold text-gray-700 truncate max-w-[200px]">{mediaFile.name}</p>
                                    <p className="text-xs text-green-600 mt-1">Ready to insert</p>
                                </div>
                             ) : (
                                <div className="text-center">
                                    <CloudUpload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm font-bold text-gray-700">Click to Browse</p>
                                    <p className="text-xs text-gray-500 mt-1">Select from computer</p>
                                </div>
                             )}
                        </div>
                    ) : (
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                                {mediaType === 'video' ? 'YouTube or MP4 URL' : 'Image URL'}
                            </label>
                            <input 
                                type="text"
                                value={mediaUrl}
                                onChange={(e) => setMediaUrl(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-spirit-500 outline-none text-sm"
                                placeholder="https://..."
                            />
                        </div>
                    )}
                </div>

                <button 
                    type="button"
                    onClick={handleMediaSubmit}
                    disabled={mediaTab === 'upload' ? !mediaFile : !mediaUrl}
                    className="w-full bg-spirit-600 text-white font-bold py-2.5 rounded-lg hover:bg-spirit-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Insert {mediaType}
                </button>
            </div>
        </div>
      )}

    </div>
  );
};

export default RichTextEditor;

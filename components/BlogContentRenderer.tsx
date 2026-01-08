import React, { useMemo } from 'react';

interface Column {
  id: string;
  width: number;
  content: string;
}

interface Row {
  id: string;
  columns: Column[];
}

interface ContentData {
  version: number;
  rows: Row[];
}

const BlogContentRenderer: React.FC<{ content: string }> = ({ content }) => {
  const structuredContent: ContentData | null = useMemo(() => {
    try {
      if (content.trim().startsWith('{')) {
        const parsed = JSON.parse(content);
        if (parsed.version === 1 && Array.isArray(parsed.rows)) {
          return parsed;
        }
      }
    } catch (e) {
      // Not JSON or invalid
    }
    return null;
  }, [content]);

  if (!structuredContent) {
    // Legacy Render
    return (
      <div className="prose prose-lg prose-spirit max-w-none text-gray-700 leading-loose whitespace-pre-line font-sans [&_img]:w-full [&_img]:rounded-none [&_img]:shadow-none [&_img]:my-2">
        {content}
      </div>
    );
  }

  // Structured Grid Render
  return (
    <div className="space-y-6">
      {structuredContent.rows.map((row) => (
        <div key={row.id} className="flex flex-col md:flex-row gap-6 md:gap-8">
          {row.columns.map((col) => (
            <div 
              key={col.id} 
              className="flex-1"
              style={{ flexBasis: `${col.width}%` }}
            >
              <div 
                className="prose prose-lg prose-spirit max-w-none text-gray-700 leading-loose font-sans 
                [&_img]:w-full [&_img]:rounded-none [&_img]:shadow-none [&_img]:my-2 
                [&_.video-wrapper]:w-full [&_.video-wrapper]:rounded-none [&_.video-wrapper]:shadow-none [&_.video-wrapper]:my-2 
                [&_iframe]:w-full [&_iframe]:rounded-none 
                [&_video]:w-full [&_video]:rounded-none"
                dangerouslySetInnerHTML={{ __html: col.content }}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default BlogContentRenderer;
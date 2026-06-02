import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { PageSection } from '../types';

export function usePageSections(pageTarget: string) {
  const [sections, setSections] = useState<PageSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    async function fetchSections() {
      try {
        // Fetch all sections
        const { data, error } = await supabase
          .from("posts")
          .select("*")
          .eq("category", "_page_section_")
          .order("created_at", { ascending: false });

        if (!error && data && mounted) {
           const mapped = data
              // filter by exact page match, or 'all'
             .filter((post: any) => post.excerpt === pageTarget || post.excerpt === 'all' || post.excerpt === '/' + pageTarget )
             .map((post: any) => {
             let config: any = {};
             try {
                config = JSON.parse(post.content);
             } catch(e) {}
             
             return {
               id: post.id,
               title: post.title,
               pageTarget: post.excerpt,
               config
             } as PageSection;
           });
           setSections(mapped);
        }
      } catch (e) {
         console.warn("Failed to fetch page sections:", e);
      } finally {
        if(mounted) setLoading(false);
      }
    }
    
    fetchSections();
    
    return () => {
      mounted = false;
    };
  }, [pageTarget]);

  return { sections, loading };
}

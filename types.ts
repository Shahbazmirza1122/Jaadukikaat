
export interface PageSection {
  id: string;
  title: string;
  pageTarget: string; // which page to show on
  config: {
    sectionType: 'hero' | 'cta' | 'text' | 'features';
    bgUrl: string;
    bgColor: string;
    overlayStyle: string; // opacity/color
    textColor: string;
    fontFamily: string;
    animation: string;
    padding: string;
    content: string; // rich text
  };
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  imageUrl: string;
  category: string;
  relatedIds?: string[]; // IDs of manually selected related articles
  isLatest?: boolean;
  status?: 'published' | 'draft';
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  price: string;
}

export interface NavItem {
  label: string;
  to: string; // URL path or Hash
  isExternalRoute?: boolean; // True if it leads to a separate page like /blog
}

export interface Inquiry {
  id: string;
  date?: string; // Legacy string date
  created_at?: string; // DB timestamp
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

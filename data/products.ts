
export interface Product {
  id: string;
  name: string;
  price: string;
  image: string;
  category: string;
  description?: string;
  // New Fields
  sku?: string;
  salePrice?: string;
  saleStart?: string;
  saleEnd?: string;
  isOutOfStock?: boolean;
  isBlurBeforeBuy?: boolean;
}

export const products: Product[] = [
  {
    id: '1',
    name: 'Natural Yemeni Aqeeq',
    price: '$85.00',
    image: 'https://images.unsplash.com/photo-1615486511262-c7b5c7f4297e?q=80&w=800&auto=format&fit=crop',
    category: 'Gemstones',
    description: 'A rare, authentic Yemeni Aqeeq stone known for its grounding properties and ability to ward off negative energy. Polished to perfection, this gemstone is perfect for rings or pendants.',
    sku: 'GEM-001',
    isOutOfStock: false
  },
  {
    id: '2',
    name: 'Crystal Tasbih (33 Beads)',
    price: '$25.00',
    image: 'https://images.unsplash.com/photo-1629738096180-d6363c373a63?q=80&w=800&auto=format&fit=crop',
    category: 'Accessories',
    description: 'Hand-strung crystal Tasbih designed for dhikr and meditation. The cool touch of the beads aids in focus and tranquility during your spiritual recitations.',
    sku: 'ACC-002'
  },
  {
    id: '3',
    name: 'Pure Musk Al-Tahara',
    price: '$40.00',
    image: 'https://images.unsplash.com/photo-1595535373192-fc046098858f?q=80&w=800&auto=format&fit=crop',
    category: 'Fragrance',
    description: 'A thick, creamy, and long-lasting musk with a clean, powdery scent. Traditionally used for purification, its aroma brings a sense of absolute cleanliness and serenity.',
    sku: 'FRG-003'
  },
  {
    id: '4',
    name: 'Hand-Engraved Loh-e-Qurani',
    price: '$150.00',
    image: 'https://images.unsplash.com/photo-1632662095033-d8c7c9179d63?q=80&w=800&auto=format&fit=crop',
    category: 'Art',
    description: 'Exquisite brass plate featuring hand-engraved Loh-e-Qurani script. A powerful symbol of protection and blessings for your home or office.'
  },
  {
    id: '5',
    name: 'Healing Zamzam Set',
    price: '$55.00',
    image: 'https://images.unsplash.com/photo-1542646675-53856d61d3bf?q=80&w=800&auto=format&fit=crop',
    category: 'Essentials',
    description: 'A curated set containing authentic Zamzam water and Ajwa dates. A spiritual remedy for physical ailments and a source of immense blessings.'
  },
  {
    id: '6',
    name: 'Brass Bakhoor Burner',
    price: '$70.00',
    image: 'https://images.unsplash.com/photo-1517454266159-2c700469b76c?q=80&w=800&auto=format&fit=crop',
    category: 'Home',
    description: 'An elegant brass burner for Bakhoor and Oud. Its intricate latticework allows the fragrant smoke to diffuse gently, creating a calming atmosphere.'
  }
];

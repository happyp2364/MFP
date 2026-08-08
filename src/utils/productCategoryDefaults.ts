import { SizeStock, ProductColor } from '../types';

export interface CategoryOption {
  value: 'men' | 'women' | 'kids';
  label: string;
}

export const PRODUCT_FOR_OPTIONS: CategoryOption[] = [
  { value: 'men', label: 'Men' },
  { value: 'women', label: 'Women' },
  { value: 'kids', label: 'Kids' },
];

export const MEN_FOOTWEAR_SUBCATEGORIES = [
  'Sports Shoes',
  'Running Shoes',
  'Sneakers',
  'Casual Shoes',
  'Formal Shoes',
  'Loafers',
  'Boots',
  'Sandals',
  'Slippers',
  'Flip-Flops',
  'Ethnic Footwear',
  'Leather Shoes',
];

export const MEN_CLOTHING_SUBCATEGORIES = [
  'T-Shirts',
  'Shirts',
  'Jeans',
  'Trousers',
  'Jackets',
  'Hoodies',
  'Lower',
];

export const WOMEN_SUBCATEGORIES = [
  'Sports Shoes',
  'Running Shoes',
  'Sneakers',
  'Casual Shoes',
  'Slip-ons',
];

export const KIDS_SUBCATEGORIES = [
  'School Shoes',
  'Sports Shoes',
  'Casual Shoes',
  'Sneakers',
  'Sandals',
  'Slippers',
  'Party Shoes',
];

// SIZE ARRAYS AS PER SPECIFICATION
export const MEN_FOOTWEAR_SIZES = ['6', '7', '8', '9', '10', '11', '12', '13', '14'];
export const WOMEN_FOOTWEAR_SIZES = ['4', '5', '6', '7', '8', '9', '10'];
export const KIDS_FOOTWEAR_SIZES = ['7', '8', '9', '10', '11', '12', '13', '1', '2', '3', '4', '5'];

export const CLOTHING_ALPHA_SIZES = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
export const MEN_JEANS_WAIST_SIZES = ['28', '30', '32', '34', '36', '38', '40', '42', '44'];

export const PRESET_COLOR_PALETTE: ProductColor[] = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Blue', hex: '#1E40AF' },
  { name: 'Navy Blue', hex: '#1E3A8A' },
  { name: 'Grey', hex: '#6B7280' },
  { name: 'Brown', hex: '#78350F' },
  { name: 'Tan', hex: '#D97706' },
  { name: 'Green', hex: '#15803D' },
  { name: 'Maroon', hex: '#800000' },
  { name: 'Red', hex: '#DC2626' },
  { name: 'Olive', hex: '#556B2F' },
];

/**
 * Returns subcategories list for chosen "Product For"
 */
export function getSubcategoriesForProductFor(category: 'men' | 'women' | 'kids'): {
  footwear: string[];
  clothing: string[];
  all: string[];
} {
  if (category === 'women') {
    return {
      footwear: WOMEN_SUBCATEGORIES,
      clothing: [],
      all: WOMEN_SUBCATEGORIES,
    };
  }

  if (category === 'kids') {
    return {
      footwear: KIDS_SUBCATEGORIES,
      clothing: [],
      all: KIDS_SUBCATEGORIES,
    };
  }

  // MEN
  return {
    footwear: MEN_FOOTWEAR_SUBCATEGORIES,
    clothing: MEN_CLOTHING_SUBCATEGORIES,
    all: [...MEN_FOOTWEAR_SUBCATEGORIES, ...MEN_CLOTHING_SUBCATEGORIES],
  };
}

/**
 * Determines whether subcategory is Footwear, Alpha Clothing (Shirt/T-Shirt/Jacket/Hoodie), or Waist Sizes (Jeans/Trousers/Lower)
 */
export function getSizeTypeForSubcategory(category: 'men' | 'women' | 'kids', subcategory: string): 'footwear' | 'clothing_alpha' | 'clothing_waist' {
  if (category === 'women' || category === 'kids') {
    return 'footwear';
  }

  const sub = (subcategory || '').toLowerCase();
  if (sub.includes('jeans') || sub.includes('trouser') || sub.includes('lower')) {
    return 'clothing_waist';
  }

  if (sub.includes('shirt') || sub.includes('jacket') || sub.includes('hoodie')) {
    return 'clothing_alpha';
  }

  return 'footwear';
}

/**
 * Returns standard size array for selected Product For + Subcategory
 */
export function getStandardSizesForCategory(category: 'men' | 'women' | 'kids', subcategory: string): string[] {
  const type = getSizeTypeForSubcategory(category, subcategory);

  if (type === 'clothing_alpha') {
    return CLOTHING_ALPHA_SIZES;
  }

  if (type === 'clothing_waist') {
    return MEN_JEANS_WAIST_SIZES;
  }

  // Footwear
  if (category === 'women') {
    return WOMEN_FOOTWEAR_SIZES;
  }

  if (category === 'kids') {
    return KIDS_FOOTWEAR_SIZES;
  }

  return MEN_FOOTWEAR_SIZES;
}

/**
 * Builds initial SizeStock array with sensible defaults
 */
export function buildDefaultSizeStocks(category: 'men' | 'women' | 'kids', subcategory: string): SizeStock[] {
  const sizes = getStandardSizesForCategory(category, subcategory);
  return sizes.map((sz) => ({
    size: sz,
    isAvailable: true,
    inStock: true,
    stockQuantity: 10,
    system: getSizeTypeForSubcategory(category, subcategory) === 'footwear' ? 'UK' : 'Clothing',
  }));
}

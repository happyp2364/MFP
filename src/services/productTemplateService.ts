import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product, ProductTemplate } from '../types';
import { getProductTypes } from '../utils/productTypeUtils';

const COLLECTION_NAME = 'productTemplates';
const LOCAL_STORAGE_KEY = 'mfp_product_templates_cache';

export const DEFAULT_PRODUCT_TEMPLATES: ProductTemplate[] = [
  {
    id: 'tpl_sports_running_marudhar',
    name: 'Marudhar Sports & Running Shoes',
    descriptionPreview: 'Standard configuration for high-performance sports, running shoes & training sneakers.',
    category: 'men',
    productTypes: ['Sports Shoes', 'Running Shoes', 'Sneakers'],
    subcategory: 'Sports Shoes',
    brand: 'Marudhar Fashion',
    description:
      'Engineered for maximum endurance, breathability, and responsive grip. Features reinforced heel counters, anti-skid rubber traction outsoles, and lightweight mesh upper for all-day athletic performance.',
    shortDescription: 'Lightweight, shock-absorbing athletic running shoe designed for high daily performance.',
    material: 'Breathable Knit Mesh, EVA Cushioned Midsole, High-Grip Rubber Outsole',
    fitGuide: 'True to Indian/UK standard shoe sizing. For wider feet or thick socks, consider sizing up by 1/2 size.',
    careInstructions: 'Allow to air dry naturally away from direct heat. Wipe with a damp cloth and mild foam cleaner. Do not machine wash.',
    features: [
      'High-energy return responsive midsole',
      'Ultra-breathable honeycomb engineered mesh',
      'Reinforced TPU arch support & heel lock',
      'Anti-slip dual-density traction outsole',
      'Washable soft foam insole',
    ],
    collectionTags: ['Sports Collection', 'New Arrival', 'Bestseller'],
    metaTitle: 'Marudhar Sports Running Shoes | Best Price & Fast Delivery',
    metaDescription: 'Shop high-performance sports and running shoes at Marudhar Fashion Point. Engineered for comfort, durability, and daily training.',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'tpl_casual_sneakers_daily',
    name: 'Daily Casual Sneakers & Walking',
    descriptionPreview: 'Modern lifestyle sneakers with cushioned cupsoles and versatile styling.',
    category: 'men',
    productTypes: ['Sneakers', 'Casual Shoes'],
    subcategory: 'Sneakers',
    brand: 'Marudhar Fashion',
    description:
      'Classic urban silhouette made for effortless everyday styling. Crafted with soft synthetic leather overlays, flexible cushioned cupsoles, and padded collars for premium step-in comfort.',
    shortDescription: 'Contemporary streetwear sneakers offering premium comfort from morning to night.',
    material: 'Premium Vegan Leather, Cushioned Polyurethane Insole, Vulcanized Rubber Cupsole',
    fitGuide: 'Regular comfortable fit. Fits standard UK footwear size.',
    careInstructions: 'Spot clean with sneaker cleaning foam or damp microfiber cloth. Store in dry, ventilated space.',
    features: [
      'Minimalist streamlined aesthetics',
      'Padded tongue and ankle collar for zero chafing',
      'Non-marking rubber tread with flexibility grooves',
      'Sweat-wicking interior lining',
    ],
    collectionTags: ['Casual Shoes', 'Trending Now'],
    metaTitle: 'Casual Streetwear Sneakers | Marudhar Fashion Point',
    metaDescription: 'Discover everyday sneakers built for comfort and timeless style. Order online with Free Shipping & COD.',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'tpl_formal_loafers_premium',
    name: 'Executive Formal Shoes & Loafers',
    descriptionPreview: 'Handcrafted formal and slip-on loafers tailored for office, wedding, and formal occasions.',
    category: 'men',
    productTypes: ['Formal Shoes', 'Loafers'],
    subcategory: 'Formal Shoes',
    brand: 'Marudhar Fashion',
    description:
      'Sophisticated dress footwear combining artisanal finish with modern orthotic comfort. Hand-burnished upper with reinforced stitching, padded leather insoles, and durable formal slip-resistant soles.',
    shortDescription: 'Elegant formal shoes crafted for executive presence and all-day wedding or office comfort.',
    material: 'Hand-Finished Microfiber Leather, Ortho-Cushion Insole, Flexible TPR Formal Sole',
    fitGuide: 'Tailored formal fit. Follows UK standard formal shoe scales.',
    careInstructions: 'Buff regularly with natural wax polish or leather conditioner. Avoid heavy rain soaking.',
    features: [
      'Hand-burnished dual-tone toe finish',
      'Easy slip-on comfort with elastic gussets',
      'Shock-absorbing heel pad reduces knee fatigue',
      'Refined formal silhouette for business and traditional wear',
    ],
    collectionTags: ['Formal Shoes', 'Premium Collection'],
    metaTitle: 'Executive Formal Shoes & Loafers | Marudhar Fashion Point',
    metaDescription: 'Step up your professional wardrobe with Marudhar handcrafted formal shoes and loafers.',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

/**
 * Listens in real-time to the productTemplates Firestore collection.
 * Falls back to local storage and default presets if collection is empty or offline.
 */
export function listenToProductTemplates(
  onUpdate: (templates: ProductTemplate[]) => void
): () => void {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('updatedAt', 'desc'), limit(100));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const items: ProductTemplate[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            items.push({
              id: docSnap.id,
              name: data.name || 'Untitled Template',
              descriptionPreview: data.descriptionPreview || '',
              category: data.category || 'men',
              productTypes: getProductTypes(data),
              subcategory: data.subcategory || (data.productTypes && data.productTypes[0]) || '',
              brand: data.brand || 'Marudhar Fashion',
              description: data.description || '',
              shortDescription: data.shortDescription || '',
              material: data.material || '',
              fitGuide: data.fitGuide || '',
              careInstructions: data.careInstructions || '',
              features: Array.isArray(data.features) ? data.features : [],
              collectionTags: Array.isArray(data.collectionTags) ? data.collectionTags : [],
              metaTitle: data.metaTitle || '',
              metaDescription: data.metaDescription || '',
              createdAt: data.createdAt || new Date().toISOString(),
              updatedAt: data.updatedAt || new Date().toISOString(),
              createdBy: data.createdBy,
            });
          });
          onUpdate(items);
          try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
          } catch {
            // Ignore storage errors
          }
        } else {
          // If Firestore collection has no items yet, provide default presets
          try {
            const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (cached) {
              onUpdate(JSON.parse(cached));
              return;
            }
          } catch {
            // fallback
          }
          onUpdate(DEFAULT_PRODUCT_TEMPLATES);
        }
      },
      (error) => {
        console.warn('[ProductTemplateService] Firestore listener warning:', error);
        try {
          const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
          if (cached) {
            onUpdate(JSON.parse(cached));
            return;
          }
        } catch {
          // fallback
        }
        onUpdate(DEFAULT_PRODUCT_TEMPLATES);
      }
    );

    return unsubscribe;
  } catch (e) {
    console.warn('[ProductTemplateService] Initialization fallback:', e);
    onUpdate(DEFAULT_PRODUCT_TEMPLATES);
    return () => {};
  }
}

/**
 * Saves or updates a product template in Firestore.
 */
export async function saveProductTemplate(
  template: Omit<ProductTemplate, 'id'> & { id?: string }
): Promise<ProductTemplate> {
  const templateId = template.id || `tpl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const cleanTypes = getProductTypes(template);

  const cleanTemplate: ProductTemplate = {
    id: templateId,
    name: (template.name || 'Untitled Template').trim(),
    descriptionPreview: (template.descriptionPreview || template.description || '').substring(0, 160).trim(),
    category: template.category || 'men',
    productTypes: cleanTypes,
    subcategory: cleanTypes[0] || '',
    brand: (template.brand || 'Marudhar Fashion').trim(),
    description: (template.description || '').trim(),
    shortDescription: (template.shortDescription || '').trim(),
    material: (template.material || '').trim(),
    fitGuide: (template.fitGuide || '').trim(),
    careInstructions: (template.careInstructions || '').trim(),
    features: Array.isArray(template.features) ? template.features.filter(Boolean) : [],
    collectionTags: Array.isArray(template.collectionTags) ? template.collectionTags.filter(Boolean) : [],
    metaTitle: (template.metaTitle || '').trim(),
    metaDescription: (template.metaDescription || '').trim(),
    createdAt: template.createdAt || now,
    updatedAt: now,
    createdBy: template.createdBy || 'admin',
  };

  try {
    await setDoc(doc(db, COLLECTION_NAME, templateId), cleanTemplate);
  } catch (err: any) {
    console.error('[ProductTemplateService] Failed to save template to Firestore:', err);
    // Cache locally so admin does not lose data
    try {
      const cached = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
      const updated = [cleanTemplate, ...cached.filter((t: ProductTemplate) => t.id !== templateId)];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
    throw err;
  }

  return cleanTemplate;
}

/**
 * Deletes a product template from Firestore.
 */
export async function deleteProductTemplate(templateId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, templateId));
  } catch (err: any) {
    console.error('[ProductTemplateService] Failed to delete template from Firestore:', err);
    throw err;
  }
}

/**
 * Duplicates a product template.
 */
export async function duplicateProductTemplate(
  sourceTemplate: ProductTemplate
): Promise<ProductTemplate> {
  return saveProductTemplate({
    ...sourceTemplate,
    id: undefined,
    name: `${sourceTemplate.name} (Copy)`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Creates a reusable product template from an existing product.
 * Strictly extracts only reusable data (never copies unique name, SKU, price, stock, or images).
 */
export async function createTemplateFromProduct(
  templateName: string,
  product: Product,
  createdBy?: string
): Promise<ProductTemplate> {
  const cleanTypes = getProductTypes(product);

  const newTemplate: Omit<ProductTemplate, 'id'> = {
    name: templateName.trim(),
    descriptionPreview: (product.shortDescription || product.description || '').substring(0, 160).trim(),
    category: product.category,
    productTypes: cleanTypes,
    subcategory: cleanTypes[0] || product.subcategory || '',
    brand: product.brand || 'Marudhar Fashion',
    description: product.description || '',
    shortDescription: product.shortDescription || '',
    material: product.material || '',
    fitGuide: product.fitGuide || '',
    careInstructions: product.careInstructions || '',
    features: product.features || [],
    collectionTags: product.collectionTags || [],
    metaTitle: product.metaTitle || '',
    metaDescription: product.metaDescription || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: createdBy || 'admin',
  };

  return saveProductTemplate(newTemplate);
}

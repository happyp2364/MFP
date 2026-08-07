import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, recordAuditLog } from './firebase';
import { WhatsAppTemplatesConfig, WhatsAppTemplate } from '../types';
import { DEFAULT_WHATSAPP_TEMPLATES_CONFIG } from '../data/defaultWhatsAppTemplates';

const WHATSAPP_SETTINGS_DOC = 'settings/whatsapp_templates';

/**
 * Fetches the active WhatsApp auto-reply templates configuration from Firestore.
 */
export async function getWhatsAppAutoReplyConfig(): Promise<WhatsAppTemplatesConfig> {
  try {
    const docRef = doc(db, WHATSAPP_SETTINGS_DOC);
    const snap = await getDoc(docRef);
    
    if (snap.exists()) {
      return snap.data() as WhatsAppTemplatesConfig;
    }
  } catch (err) {
    handleFirestoreError(err as Error, OperationType.GET, WHATSAPP_SETTINGS_DOC);
  }
  return DEFAULT_WHATSAPP_TEMPLATES_CONFIG;
}

/**
 * Updates the entire WhatsApp auto-reply configuration.
 */
export async function updateWhatsAppAutoReplyConfig(
  newConfig: WhatsAppTemplatesConfig,
  adminEmail: string
): Promise<{ success: boolean; message: string }> {
  try {
    const docRef = doc(db, WHATSAPP_SETTINGS_DOC);
    await setDoc(docRef, newConfig, { merge: true });
    
    await recordAuditLog(
      'WhatsApp Templates Updated',
      'SETTINGS',
      `${adminEmail} updated the WhatsApp automated reply templates.`,
      'SUCCESS'
    );
    
    return { success: true, message: 'WhatsApp reply templates saved successfully.' };
  } catch (err) {
    handleFirestoreError(err as Error, OperationType.WRITE, WHATSAPP_SETTINGS_DOC);
    return { success: false, message: 'Failed to update WhatsApp reply templates.' };
  }
}

/**
 * Toggles the enabled status of a specific WhatsApp template.
 */
export async function toggleWhatsAppTemplateStatus(
  templateId: string,
  isEnabled: boolean,
  adminEmail: string
): Promise<{ success: boolean; message: string }> {
  try {
    const config = await getWhatsAppAutoReplyConfig();
    const updatedTemplates = config.templates.map((t) => 
      t.id === templateId ? { ...t, enabled: isEnabled } : t
    );
    
    const newConfig = { ...config, templates: updatedTemplates };
    return await updateWhatsAppAutoReplyConfig(newConfig, adminEmail);
  } catch (err) {
    return { success: false, message: 'Failed to toggle template status.' };
  }
}

/**
 * Resets the WhatsApp templates configuration to the system defaults.
 */
export async function resetWhatsAppAutoReplyConfig(
  adminEmail: string
): Promise<{ success: boolean; message: string }> {
  return await updateWhatsAppAutoReplyConfig(DEFAULT_WHATSAPP_TEMPLATES_CONFIG, adminEmail);
}

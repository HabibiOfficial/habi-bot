/**
 * ╔══════════════
 * ║  ------ HABI AI --------
 * ║ WA Bot • by Habibih Official ID   
 * ╚══════════════
 * 
 * @author Habibih Official ID
 * @website habibi-store.pages.dev
 * @wa  wa.me/6285181576338
 * @source Habibih Cloud ID - No Comot, No Ganti Nama
 */


import { settings } from '../config/settings.js'

export const CREATOR_NAME = settings.ownerName || 'Habibih Official ID'
export const PROJECT_NAME = 'Habibih Cloud ID'
export const PROJECT_YEAR = settings.footerYear || '2026'

export function creatorWatermark() {
  return `© ${PROJECT_YEAR} ${CREATOR_NAME}`
}

export default {
  CREATOR_NAME,
  PROJECT_NAME,
  PROJECT_YEAR,
  creatorWatermark,
}

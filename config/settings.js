/**
 * ╔══════════════
 * ║  ------ HABIBIH CLOUD ID --------
 * ║ WA Bot • by Habibih Cloud Official ID   
 * ╚══════════════
 * 
 * @author Habibih Cloud Official ID
 * @website habibihcloud.id
 * @wa  wa.me/6285181576338
 * @source Habibih Cloud ID - No Comot, No Ganti Nama
 */

export const settings = {
  // ------------------------------------------
  
  botName: 'Habibih Cloud ID',
  botAlias: 'Habibih',
  
  // ------------------------------------------
  
  ownerName: 'Habibih Cloud Official ID',

  ownerNumbers: [
    '6285181576338',
  ],

  // ------------------------------------------

  links: {
    groupLink: 'https://chat.whatsapp.com/L8UUutSeDK68LsHf0SXekh',
    groupId: '',
    channelLink: '',
    channelId: '',
    githubLink: '',
  },

  // ------------------------------------------

  defaultPrefix: '.',
  timezone: 'Asia/Jakarta',
  footerText: 'Habibih Official ID',
  footerYear: '2026',
  botVersion: '1.0.0',
  botMode: 'Public',

  sticker: {
    pack: 'Habibih ID',
    author: 'Habibih Cloud Official ID',
  },

  messageRouting: {
    respondToSelf: true,
  },

  pairingNumber: '', // ISI NOKER BOT KALIAN

  // ------------------------------------------

  // ── REST API Habibih Cloud ID ──
  // Dikosongkan berarti bot pakai nilai bawaan di lib/habi-api.js.
  // API key juga bisa diisi lewat env HABI_API_KEY (lebih aman).
  api: {
    baseUrl: '',
    apikey: '',
  },

  menuImage: 'habibih.jpg',

  replyVariant: 1,

  // ------------------------------------------

  donation: {
    danaNumber: '085169123955', 
    danaName: 'AN*** R****',
    qrisImage: 'qris.jpg',
  },

  // ------------------------------------------
  
  menuGreeting: (name) => `Hai welcome saya ${name}!`,
  menuDescription: [
    `${'{{botName}}'} adalah assistant virtual berbasis`,
    'WhatsApp, yang dirancang khusus untuk',
    'menemani dan membantu anda mencari',
  ],
  menuFeatures: [
    'edukasi pelajaran',
    'mengunduh media',
    'bermain game',
    'menjaga group',
    'dan masih banyak lagi!!',
  ],
}

export default settings

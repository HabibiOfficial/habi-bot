/**
 * ╔══════════════
 * ║  ------ HABI AI --------
 * ║ WA Bot • by Habibih Official   
 * ╚══════════════
 * 
 * @author Habibih Official
 * @website habibi-store.pages.dev
 * @wa  wa.me/6285181576338
 * @source Habibih Cloud ID - No Comot, No Ganti Nama
 */


import { printBanner, printStatus, printSection } from './tampilan/banner.js'
import { loadAllPlugins, watchPlugins, pluginStore } from './core/pemuat-plugin.js'
import { startConnection } from './core/connection.js'
import { attachMessageRouter } from './core/router-pesan.js'
import { attachAnticallHandler } from './core/anticall-handler.js'
import { attachWelcomeHandler } from './core/welcome-handler.js'
import { ensurePlayDependencies } from './scripts/ensure-play-deps.js'
import { mulaiSchedulerAdzan } from './lib/scheduler-adzan.js'
import { semuaPengaturan } from './plugins/islam/adzan.js'

async function bootstrap() {
  await printBanner()

  await ensurePlayDependencies()

  printSection('Memuat Plugin')
  const { total, loaded } = await loadAllPlugins()
  printStatus(`${loaded} dari ${total} plugin berhasil dimuat`, loaded === total ? 'success' : 'warn')

  watchPlugins({
    onReload: (event, file) => {
      const labels = { added: 'ditambahkan', changed: 'diperbarui', removed: 'dihapus' }
      printStatus(`Plugin ${labels[event] || event}: ${file}`, 'info')
    },
  })

  setInterval(async () => {
    const before = pluginStore.size
    const { loaded } = await loadAllPlugins()
    if (loaded !== before) {
      printStatus(`Pemindaian ulang plugin: ${loaded} plugin aktif (sebelumnya ${before})`, 'info')
    }
  }, 2 * 60 * 1000)

  printSection('Menghubungkan ke WhatsApp')
  await startConnection({
    onReady: (activeConn) => {
      attachMessageRouter(activeConn)
      attachAnticallHandler(activeConn)
      attachWelcomeHandler(activeConn)

      // Pengingat adzan otomatis untuk chat yang mengaktifkan .adzan on
      mulaiSchedulerAdzan(activeConn, semuaPengaturan(), {
        kirimTeks: async (chat, teks) => {
          await activeConn.sendMessage(chat, { text: teks })
        },
        kirimAudio: async (chat, buffer, teks) => {
          await activeConn.sendMessage(chat, { audio: buffer, mimetype: 'audio/mpeg', caption: teks })
        },
      })

      printStatus('Message router aktif — bot siap menerima perintah.', 'success')
      printStatus('Scheduler adzan aktif — .adzan on <kota> untuk mengaktifkan.', 'success')
    },
  })
}

bootstrap().catch((err) => {
  console.error('Gagal menjalankan bot:', err)
  process.exit(1)
})

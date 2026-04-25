const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys")

const express = require("express")
const P = require("pino")
const QRCode = require("qrcode")

const config = require("./config")
const { commands, loadCommands } = require("./lib/handler")
const { isOwner, isVIP } = require("./lib/role")
const { getLimit, reduceLimit } = require("./lib/limit")

// 🌐 WEB SERVER
const app = express()
let latestQR = null

// 📌 HALAMAN QR DI REPLIT
app.get("/", (req, res) => {
  if (!latestQR) {
    return res.send(`
      <h2>🤖 ${config.botName} Aktif</h2>
      <p>QR belum muncul atau sudah login WhatsApp</p>
    `)
  }

  res.send(`
    <h2>🤖 ${config.botName} QR LOGIN</h2>
    <p>Scan QR di bawah ini:</p>
    <img src="${latestQR}" style="width:300px"/>
  `)
})

app.listen(3000, () => {
  console.log("🌐 Web QR aktif di port 3000")
})

// 📦 LOAD COMMAND
loadCommands()

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("session")
  const { version } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    version,
    auth: state,
    logger: P({ level: "silent" })
  })

  sock.ev.on("creds.update", saveCreds)

  // 🔥 QR HANDLER
  sock.ev.on("connection.update", async (update) => {
    const { connection, qr } = update

    if (qr) {
      latestQR = await QRCode.toDataURL(qr)
      console.log("📌 QR siap diakses di web")
    }

    if (connection === "open") {
      console.log("✅ WhatsApp terhubung")
      latestQR = null
    }
  })

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0]
    if (!msg.message) return

    const sender = msg.key.remoteJid

    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text || ""

    if (!text.startsWith(config.prefix)) return

    const args = text.slice(1).trim().split(" ")
    const cmdName = args.shift().toLowerCase()

    const cmd = commands.get(cmdName)
    if (!cmd) return

    // 👤 LIMIT SYSTEM
    if (!isVIP(sender) && !isOwner(sender)) {
      if (getLimit(sender) <= 0) {
        return sock.sendMessage(sender, {
          text: "❌ Limit habis (15/15 per hari)"
        })
      }
      reduceLimit(sender)
    }

    try {
      await cmd.run(sock, msg, args)
    } catch (e) {
      console.log(e)
    }
  })

  console.log(`🤖 ${config.botName} aktif`)
}

startBot()

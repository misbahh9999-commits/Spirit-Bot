const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason
} = require("@whiskeysockets/baileys")

const express = require("express")
const P = require("pino")
const config = require("./config")

const { commands, loadCommands } = require("./lib/handler")
const { isOwner, isVIP } = require("./lib/role")
const { getLimit, reduceLimit } = require("./lib/limit")

const app = express()
app.get("/", (req, res) => {
  res.send(`🤖 ${config.botName} aktif`)
})
app.listen(3000)

loadCommands()

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("session")
  const { version } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    version,
    auth: state,
    logger: P({ level: "silent" }),
    printQRInTerminal: false
  })

  sock.ev.on("creds.update", saveCreds)

  // 🔥 PAIRING CODE LOGIN
  if (!sock.authState.creds.registered) {
    const phoneNumber = "628xxxxxxxxxx" // ganti nomor kamu

    setTimeout(async () => {
      try {
        const code = await sock.requestPairingCode(phoneNumber)
        console.log("📌 PAIRING CODE ANDA:")
        console.log(code)
      } catch (e) {
        console.log("❌ Gagal generate pairing code:", e)
      }
    }, 3000)
  }

  // 📡 STATUS CONNECTION
  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update

    if (connection === "open") {
      console.log(`✅ ${config.botName} sudah terhubung ke WhatsApp`)
    }

    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode

      console.log("⚠️ Koneksi terputus:", reason)

      if (reason !== DisconnectReason.loggedOut) {
        startBot()
      }
    }
  })

  // 💬 MESSAGE HANDLER
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
          text: "❌ Limit habis (15/15)"
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

  console.log(`🤖 ${config.botName} running...`)
}

startBot()

const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys")

const express = require("express")
const P = require("pino")

const config = require("./config")
const { commands, loadCommands } = require("./lib/handler")
const { isOwner, isVIP } = require("./lib/role")
const { getLimit, reduceLimit } = require("./lib/limit")

// 🌐 WEB SERVER (REPLIT DOMAIN READY)
const app = express()
app.get("/", (req, res) => {
  res.send(`🤖 ${config.botName} aktif`)
})
app.listen(3000)

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

    // 👤 LIMIT USER (15 ONLY)
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

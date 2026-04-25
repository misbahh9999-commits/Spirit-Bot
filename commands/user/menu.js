module.exports = {
  name: "menu",

  async run(sock, msg) {
    const text = `
🤖 SPIRIT BOT MENU

👤 USER (LIMIT 15)
.ping
.sticker
.menu
.help
.rules

⭐ VIP
.ai

👑 OWNER
.addvip
.delvip
.resetlimit
`

    await sock.sendMessage(msg.key.remoteJid, { text })
  }
}

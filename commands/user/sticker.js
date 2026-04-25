module.exports = {
  name: "sticker",

  async run(sock, msg) {
    await sock.sendMessage(msg.key.remoteJid, {
      text: "📌 Sticker dibuat (User umum bisa pakai ini)"
    })
  }
}

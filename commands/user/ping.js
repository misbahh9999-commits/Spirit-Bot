module.exports = {
  name: "ping",

  async run(sock, msg) {
    await sock.sendMessage(msg.key.remoteJid, {
      text: "🏓 Pong!"
    })
  }
}

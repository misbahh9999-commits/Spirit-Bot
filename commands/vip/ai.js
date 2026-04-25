module.exports = {
  name: "ai",

  async run(sock, msg, args) {
    const text = args.join(" ")

    await sock.sendMessage(msg.key.remoteJid, {
      text: "🤖 AI Spirit Bot: " + text
    })
  }
}

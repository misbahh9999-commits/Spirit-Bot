const { addVIP } = require("../../lib/role")

module.exports = {
  name: "addvip",

  async run(sock, msg, args) {
    const num = args[0]

    addVIP(num)

    await sock.sendMessage(msg.key.remoteJid, {
      text: "✅ VIP ditambahkan: " + num
    })
  }
}

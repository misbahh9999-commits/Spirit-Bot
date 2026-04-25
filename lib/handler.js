const fs = require("fs")

const commands = new Map()

function loadCommands() {
  const folders = fs.readdirSync("./commands")

  folders.forEach(folder => {
    const files = fs.readdirSync(`./commands/${folder}`)

    files.forEach(file => {
      const cmd = require(`../commands/${folder}/${file}`)
      commands.set(cmd.name, cmd)
    })
  })
}

module.exports = {
  commands,
  loadCommands
}

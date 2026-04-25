const config = require("../config")

let vipList = []

function isOwner(sender) {
  return sender.includes(config.owner)
}

function isVIP(sender) {
  return vipList.includes(sender)
}

function addVIP(num) {
  if (!vipList.includes(num)) vipList.push(num)
}

function delVIP(num) {
  vipList = vipList.filter(v => v !== num)
}

module.exports = {
  isOwner,
  isVIP,
  addVIP,
  delVIP,
  vipList
}

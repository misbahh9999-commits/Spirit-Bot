let limitDB = {}

function getLimit(user) {
  if (!limitDB[user]) limitDB[user] = 15
  return limitDB[user]
}

function reduceLimit(user) {
  if (!limitDB[user]) limitDB[user] = 15
  if (limitDB[user] > 0) limitDB[user]--
}

function resetLimit() {
  limitDB = {}
}

module.exports = {
  getLimit,
  reduceLimit,
  resetLimit
}


var Notify = function (message, limit=false, groups=false) {

  if(!groups) {
    groups = ['default']
  }

  // If no limit then send immediately (and potentially repeatedly)
  if(!limit) {
    Notify.queueMessage(message)
    return
  }

  // Save message history, normalizing digits to prevent notification spam.
  const history_message = (message + '::' + groups.join('_')).replace(/\s(\d+)/g, 'X')

  if(!Memory.__notify_history) {
    Memory.__notify_history = {}
  }

  // If the message was sent in the last LIMIT ticks then don't send again.
  if(!!Memory.__notify_history[history_message]) {
    var lastSent = Memory.__notify_history[history_message]
    if(lastSent >= Game.time - limit) {
      return
    } else {
      // History is older than limit so delete it.
      delete Memory.__notify_history[history_message]
    }
  }

  // Record message in history and send it.
  Memory.__notify_history[history_message] = Game.time
  Notify.queueMessage(message, groups)
  return 0
}


Notify.queueMessage = function (message, groups) {
  if(!Memory.__notify) {
    Memory.__notify = []
  }
  Memory.__notify.push({
    'message': message,
    'groups': groups,
    'tick': Game.time
  })
}

// Clean up history instead of leaving old messages around
Notify.cleanHistory = function (limit) {
  if(!limit) {
    limit = 20000
  }

  if(!Memory.__notify_history) {
    return
  }

  var messages = Object.keys(Memory.__notify_history)
  for(var i in messages) {
    var message = messages[i]
    if(Memory.__notify_history[message] < Game.time - limit) {
      delete Memory.__notify_history[message]
    }
  }
}

module.exports = Notify

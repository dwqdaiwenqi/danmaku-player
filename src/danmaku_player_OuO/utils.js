
export function html (htmls, ...args) {
  return htmls.reduce((param, a) => {
    param.htmls += htmls[param.idx] + (args[param.idx++] || '')
    return param
  }, {htmls: '', idx: 0}).htmls
}

var getPrefix = () => {
  var prefix = null
  if (document.hidden !== undefined) {
   prefix = ''
  } else {
    var browserPrefixes = ['webkit', 'moz', 'ms', 'o']
    for (var i = 0; i < browserPrefixes.length; i++) {
      if (document[browserPrefixes[i] + 'Hidden'] !== undefined) {
        prefix = browserPrefixes[i]
        break
      }
    }
  }
  getPrefix = () => prefix
  return prefix
}

export var shimVisibilityChange = getPrefix() + 'visibilitychange'
export var shimHidden = getPrefix() === '' ? 'hidden' : (getPrefix() + 'Hidden')

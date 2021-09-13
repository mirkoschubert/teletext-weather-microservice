

const headerLines = [
  "²7³1               ³0 ²8³3                        ",
  "²7³1   JvPeek TV   ³0 ²8³3 Mittwoch ... 20:00 CET ",
  "²7³1  Twitch Text  ³0 ²8³3 Sonntag .... 11:00 CET ",
  "²7³1               ³0 ²8³3                        "
]

const color = (fg, bg = 'black') => {
  const fgstr = '²'
  const bgstr = '³'
  const colors = { red: '1', green: '2', yellow: '3', blue: '4', magenta: '5', cyan: '6', white: '7', black: '8', orange: '9', purple: 'a' }

  return `${fgstr}${fg === null ? '' : colors[fg]}${bgstr}${bg === null ? '' : colors[bg]}`
}

const isValidLine = (line) => {
  if (!line || line === '') { return false }
  line.replace(/[²³][0-9a]/g, '')
  return line.length === 40
}

const nbsp = (times) => {
  return new Array(times - 2).join(' ')
}



const render = (data) => {

}

export { render }
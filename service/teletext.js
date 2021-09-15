import axios from 'axios'
import cron from 'node-cron'
import chalk from 'chalk'
import { parseForecast } from './weather.js'

// renderer

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
  line = line.replace(/[²³][0-9a]/g, '')
  return line.length === 40
}

const nbsp = (times, seperator = ' ') => {
  return new Array(times + 1).join(seperator)
}

const statusLine = (term, data, seperator = ' ') => {
  let line = `${color('white')}${term} ${nbsp(40 - term.length - data.length - 2, seperator)} ${data}`
  return line
}

const header = (city, country) => {
  const lines = []

  lines.push(`${color('yellow', 'blue')}${nbsp(40)}`)
  lines.push(`${color('white', 'blue')} JvPeek TV${nbsp(19)}${color('yellow', 'blue')}DAS WETTER `)
  lines.push(`${color('white', 'blue')}${nbsp(37 - city.length - country.length)}${city}, ${country} `)
  lines.push(`${color('yellow', 'blue')}${nbsp(40)}`)

  return lines
}

const current = (data) => {
  const lines = []

  lines.push(`${color('white')}${nbsp(40)}`)
  lines.push(`${color('white')}${nbsp(14)}Temperatur ${nbsp(11 - String(data.current.temp).length, '.')} ${data.current.temp} °C`)
  lines.push(`${color('white')}${nbsp(14)}Feuchtigkeit ${nbsp(10 - String(data.current.humidity).length, '.')} ${data.current.humidity} %`)
  lines.push(`${color('white')}${nbsp(14)}Luftdruck ${nbsp(12 - String(data.current.pressure).length, '.')} ${data.current.pressure} mb`)
  lines.push(`${color('white')}${nbsp(14)}Niederschlag ${nbsp(9 - String(data.current.precipation).length, '.')} ${data.current.precipation} mm`)
  lines.push(`${color('white')}${nbsp(14)}Wind ${nbsp(15 - String(data.current.wind_speed).length, '.')} ${data.current.wind_speed} km/h`)
  lines.push(`${color('white')}${nbsp(14)}Windrichtung ${nbsp(12 - data.current.wind_dir.length, '.')} ${data.current.wind_dir}`)
  lines.push(`${color('white')}${nbsp(40)}`)

  return lines
}


const forecast = (data) => {
  // forecast part
}

const status = (data) => {

  console.log(chalk.blue(`${data.city}, ${data.country}`), chalk.green('T:'), data.current.temp + ' °C', chalk.green('H:'), data.current.humidity + ' %', chalk.green('P:'), data.current.pressure + ' mb')
}


const render = (data) => {
  const lines = []
  
  lines.push(...header(data.city, data.country))
  lines.push(...current(data))

  for (let i = lines.length; i < 24; i++) { lines.push(`${color('white')}${nbsp(40)}`) } // remaining lines

  //console.log(isValidLine(lines[lines.length - 1]))
  //lines.forEach(line => console.log('"'+line+'"'))

  return { lines: lines, title: 'weather' }
}


/**
 * Gets the weather and renders it to a JVPeek teletext page
 */
const teletext = async () => {

  const baseURL = process.env.WEATHER_BASE_URL
  const apikey = process.env.WEATHER_API_KEY
  const location = process.env.WEATHER_LOCATION
  const weather_uri = `${baseURL}forecast.json?key=${apikey}&q=${location}&days=3&lang=de`
  const teletext_uri = process.env.TELETEXT_URL
  let rendered

  try {
    const weather = await axios.get(weather_uri)
    const parsed = parseForecast(weather.data)
    rendered = render(parsed)
    status(parsed)
  } catch (e) {
    console.error(e)
  }

  if (rendered) {
    try {
      const res = await axios.post(teletext_uri, rendered, { params: { format: 'json' }})
      //console.log(res.data)
    } catch (e) {
      console.error(e)
    }
  }
}

/**
 * Sets up a cron schedule for the Service to push automatically
 */
const teletextTask = cron.schedule('* * * * *', async () => {
  console.log('Pushing the weather teletext page...')
  await teletext()
}, { scheduled: false })


export { teletext, teletextTask }
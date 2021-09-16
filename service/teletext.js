import axios from 'axios'
import cron from 'node-cron'
import chalk from 'chalk'
import moment from 'moment'
import { parseForecast } from './weather.js'

// old
const headerLines = [
  "²7³1               ³0 ²8³3                        ",
  "²7³1   JvPeek TV   ³0 ²8³3 Mittwoch ... 20:00 CET ",
  "²7³1  Twitch Text  ³0 ²8³3 Sonntag .... 11:00 CET ",
  "²7³1               ³0 ²8³3                        "
]


/**
 * Renders the color codes
 * 
 * @param {String} fg 
 * @param {String} bg 
 * @returns {String}
 */
const color = (fg, bg = 'black') => {
  const fgstr = '²'
  const bgstr = '³'
  const colors = { red: '1', green: '2', yellow: '3', blue: '4', magenta: '5', cyan: '6', white: '7', black: '8', orange: '9', purple: 'a' }

  return `${fgstr}${fg === null ? '' : colors[fg]}${bgstr}${bg === null ? '' : colors[bg]}`
}


/**
 * Checks if a line is exactry 40 characters long
 * 
 * @param {String} line 
 * @returns {Boolean}
 */
const isValidLine = (line) => {
  if (!line || line === '') { return false }
  line = line.replace(/[²³][0-9a]/g, '')
  return line.length === 40
}


/**
 * Checks if the whole template is valid
 * 
 * @param {Array<String>} lines 
 * @returns {Boolean}
 */
const isValid = (lines) => {
  const invalid = []
  let valid = true
  lines.forEach((line, i) => {
    const lineValid = isValidLine(line)
    if (!lineValid) { invalid.push(i + 1) }
  })
  if (invalid.length > 0) {
    console.error('Line', invalid.join(', '), 'are invalid. Please check the character count!')
    valid = false
  }
  if (lines.length !== 24) {
    console.error('There are not the right amount of lines.')
    valid = false
  }
  return valid
}


/**
 * Renders a character for x times
 * 
 * @param {Number} times 
 * @param {String} seperator 
 * @returns {String}
 */
const nbsp = (times, seperator = ' ') => {
  return new Array(times + 1).join(seperator)
}


/**
 * Renders the status line for the logs
 * 
 * @param {String} term 
 * @param {Object} data 
 * @param {String} seperator 
 * @returns {String}
 */
const statusLine = (term, data, seperator = ' ') => {
  return `${color('white')}${term} ${nbsp(40 - term.length - data.length - 2, seperator)} ${data}`
}


/**
 * Renders the header of the site
 * 
 * @param {String} city 
 * @param {String} country 
 * @returns {Array<String>}
 */
const header = (city, country) => {
  const lines = []

  lines.push(`${color('yellow', 'blue')}${nbsp(40)}`)
  lines.push(`${color('white', 'blue')} JvPeek TV${nbsp(19)}${color('yellow', 'blue')}DAS WETTER `)
  lines.push(`${color('white', 'blue')}${nbsp(37 - city.length - country.length)}${city}, ${country} `)
  lines.push(`${color('yellow', 'blue')}${nbsp(40)}`)

  return lines
}


/**
 * Renders a list of variables for the current weather section
 * 
 * @param {Object} data 
 * @returns {Array<String>}
 */
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


/**
 * Renders a table of variables for the forcast section
 * 
 * @param {Object} data 
 * @returns {Array<String>}
 */
const forecast = (data) => {
  const lines = []
  const parts = {
    date: '',
    condition: '',
    temp_min: '',
    temp_max: '',
    rain: ''
  }
  
  data.days.forEach(day => {
    parts.date += moment(day.date).format('DD.MM.YYYY') + '   '
    parts.condition += day.condition.text + '  '
    parts.temp_max += `${color('red')}🌞 ${day.temp_max}°C${nbsp(9 - String(day.temp_max).length)}`
    parts.temp_min += `${color('blue')}🌙 ${day.temp_min}°C${nbsp(9 - String(day.temp_min).length)}`
    parts.rain += `${color('white')}🌧 ${day.rain}mm${nbsp(9 - String(day.rain).length)}`
  })

  lines.push(`${color('white', 'blue')}${nbsp(40)}`)
  lines.push(`${color('yellow', 'blue')} ${parts.date}`)
  lines.push(`${color('white', 'blue')}${nbsp(40)}`)
  lines.push(`${color('white')}${nbsp(40)}`)
  lines.push(`${parts.temp_max} `)
  lines.push(`${color('white')}${nbsp(40)}`)
  lines.push(`${parts.temp_min} `)
  lines.push(`${color('white')}${nbsp(40)}`)
  lines.push(`${parts.rain} `)
  
  return lines
}


/**
 * Renders the status line for the logs
 * 
 * @param {Object} data 
 */
const status = (data) => {
  const location = chalk.blue(`${data.city}, ${data.country}`)
  const basic = ` ${chalk.green('T:')} ${data.current.temp} °C ${chalk.green('H:')} ${data.current.humidity} % ${chalk.green('P:')} ${data.current.pressure} mb`
  const advanced = ` ${chalk.green('W:')} ${data.current.wind_speed} kmh ${data.current.wind_dir} ${chalk.green('P:')} ${data.current.precipation} mm`
  console.log(location + basic + advanced)
}


/**
 * Renders the full teletext site as an object
 * 
 * @param {Object} data 
 * @returns {Object}
 */
const render = (data) => {
  const lines = []
  
  lines.push(...header(data.city, data.country))
  lines.push(...current(data))
  lines.push(...forecast(data))

  for (let i = lines.length; i < 23; i++) { lines.push(`${color('white')}${nbsp(40)}`) } // remaining lines - 1

  lines.push(`${color('yellow', 'blue')}${nbsp(29)}MUSIKUSS78 `)

  //console.log(isValidLine(lines[lines.length - 1]))
  lines.forEach(line => console.log('"'+line+'"'))

  if (isValid(lines)) {
    return { lines: lines, title: 'weather' }
  } else {
    return false
  }
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
  } else {
    console.error('Teletext page was not pushed because of errors')
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
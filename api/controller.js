import { readFile } from 'fs/promises'
import { current, forecast } from '../service/weather.js'
import { teletextTask } from '../service/teletext.js'

const pkg = JSON.parse(await readFile('./package.json', 'utf-8'))


/**
 * Responses with some data about the service
 * 
 * @param {Object} req 
 * @param {Object} res 
 */
const about = (req, res) => {
  res.json({
    name: pkg.name,
    version: pkg.version
  })
}


/**
 * Responses with current or forecast weather for a given city
 * 
 * @param {Object} req 
 * @param {Object} res 
 */
const weather = async (req, res) => {

  if (req.params.type === 'current') {
    try {
      const data = await current(req, res)
      res.json(data)      
    } catch (e) {
      console.error(e)
    }
  } else if (req.params.type === 'forecast') {
    try {      
      const data = await forecast(req, res)
      res.json(data)
    } catch (e) {
      console.log(e)
    }
  } else {
    res.status(404).send({ error: 'No Access' })
  }

}


/**
 * Responses with a renderes teletext weather site for jvpeek.de
 * Controls for the teletext service (GET status, POST start, POST stop)
 * 
 * @param {Object} req 
 * @param {Object} res 
 */
const teletext = async (req, res) => {
  let status = 'stopped'

  if (req.method === 'GET' && req.params.command === 'status') {
    res.json({ service: 'teletext', status: status })
  } else if (req.method === 'POST' && req.params.command === 'start') {
    teletextTask.start()
    status = 'active'
    res.json({ service: 'teletext', status: status })
  } else if (req.method === 'POST' && req.params.command === 'stop') {
    teletextTask.stop()
    status = 'stopped'
    res.json({ service: 'teletext', status: status })
  } else {
    res.status(404).send({ error: 'No Access' })
  }
}

export { about, weather, teletext }
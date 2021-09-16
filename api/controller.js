import { readFile } from 'fs/promises'
import { current, forecast } from '../service/weather.js'
import { teletextTask } from '../service/teletext.js'
import logger from 'signale'

const pkg = JSON.parse(await readFile('./package.json', 'utf-8'))

var taskStatus = 'stopped'

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
      logger.error(e.message)
    }
  } else if (req.params.type === 'forecast') {
    try {      
      const data = await forecast(req, res)
      res.json(data)
    } catch (e) {
      logger.error(e.message)
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
  

  if (req.method === 'GET' && req.params.command === 'status') {
    logger.info('The status of the Teletext Service was checked.')
    res.json({ service: 'teletext', status: taskStatus })
  } else if (req.method === 'POST' && req.params.command === 'start') {
    taskStatus = 'active'
    teletextTask.start()
    logger.success('The Teletext Service was successfully started.')
    res.json({ service: 'teletext', status: taskStatus })
  } else if (req.method === 'POST' && req.params.command === 'stop') {
    taskStatus = 'stopped'
    teletextTask.stop()
    logger.success('The Teletext Service was successfully stopped.')
    res.json({ service: 'teletext', status: taskStatus })
  } else {
    logger.warn('Someone tried to push data to an unauthorized route.')
    res.status(404).send({ error: 'No Access' })
  }
}

export { about, weather, teletext }
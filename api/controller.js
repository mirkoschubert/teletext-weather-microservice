import { readFile } from 'fs/promises'
import { current, forecast } from '../service/weather.js'
import { teletextTask } from '../service/teletext.js'

const pkg = JSON.parse(await readFile('./package.json', 'utf-8'))


const test = (req, res) => {
  const dummy = {"city":"Hamburg","country":"Germany","current":{"temp":12,"humidity":100,"pressure":1019,"precipation":0,"wind_speed":2.2,"wind_dir":"NNW","condition":{"text":"Klar","code":1000}},"days":[{"date":"2021-09-13","temp_max":17.8,"temp_min":11.2,"rain":77,"snow":0,"condition":{"text":"stellenweise Regenfall","code":1063}},{"date":"2021-09-14","temp_max":22.8,"temp_min":10.1,"rain":0,"snow":0,"condition":{"text":"leicht bewölkt","code":1003}},{"date":"2021-09-15","temp_max":22.5,"temp_min":14.7,"rain":83,"snow":0,"condition":{"text":"mäßiger Regenfall","code":1189}}]}
  res.json(render(dummy))
}

const about = (req, res) => {
  res.json({
    name: pkg.name,
    version: pkg.version
  })
}

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

export { about, weather, teletext, test }
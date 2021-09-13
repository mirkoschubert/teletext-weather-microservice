import cron from 'node-cron'
import { about, weather } from './controller.js'
import { pushTeletextWeather } from '../service/weather.js'

var taskStatus = 'stopped'

const task = cron.schedule('*/5 * * * *', async () => {
  console.log('Pushing the weather teletext page...')
  const teletext = await pushTeletextWeather()
  console.log(teletext)
}, { scheduled: false })

const routes = (app) => {
  app.route('/about').get(about)
  app.route('/api/weather/:type/:city').get(weather)

  app.route('/tasks/teletext/start').get((req, res) => {
    task.start()
    res.json({ task: 'teletext', status: 'active' })
    taskStatus = 'active'
    console.log('Task "Teletext" has been started.')
  })

  app.route('/tasks/teletext/stop').get((req, res) => {
    task.stop()
    res.json({ task: 'teletext', status: 'stopped' })
    taskStatus = 'stopped'
    console.log('Task "Teletext" has been stopped.')
  })

  app.route('/tasks/teletext/status').get((req, res) => {
    res.json({ task: 'teletext', status: taskStatus })
  })
}

export default routes
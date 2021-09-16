
import { about, weather, teletext } from './controller.js'


const routes = (app) => {

  app.route('/about').get(about)
  app.route('/api/weather/:type/:city').get(weather)
  app.route('/service/teletext/:command').all(teletext)
}

export default routes
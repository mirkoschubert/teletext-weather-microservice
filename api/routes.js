
import { about, weather, teletext, test } from './controller.js'


const routes = (app) => {

  app.route('/about').get(about)
  app.route('/api/weather/:type/:city').get(weather)
  app.route('/api/test').get(test)
  app.route('/service/teletext/:command').all(teletext)
}

export default routes
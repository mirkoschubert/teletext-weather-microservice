import { readFile } from 'fs/promises'
import { current, forecast } from '../service/weather.js'

const pkg = JSON.parse(await readFile('./package.json', 'utf-8'))
//console.log(pkg)

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
    // error
  }

}

export { about, weather }
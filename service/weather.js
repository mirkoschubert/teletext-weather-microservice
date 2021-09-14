import axios from 'axios'
import { render } from './renderer.js'

const baseURL = 'https://api.weatherapi.com/v1/'

const parseForecast = (data) => {
  const days = []
  data.forecast.forecastday.forEach(day => {
    days.push({
      date: day.date,
      temp_max: day.day.maxtemp_c,
      temp_min: day.day.mintemp_c,
      rain: day.day.daily_chance_of_rain,
      snow: day.day.daily_chance_of_snow,
      condition: {
        text: day.day.condition.text,
        code: day.day.condition.code
      }
    })
  })

  return {
    city: data.location.name,
    country: data.location.country,
    current: {
      temp: data.current.temp_c,
      humidity: data.current.humidity,
      pressure: data.current.pressure_mb,
      precipation: data.current.precip_mm,
      wind_speed: data.current.wind_kph,
      wind_dir: data.current.wind_dir,
      condition: {
        text: data.current.condition.text,
        code: data.current.condition.code
      }
    },
    days: days
  }
}

const parseCurrent = (data) => {
  return {
    city: data.location.name,
    country: data.location.country,
    temp: data.current.temp_c,
    humidity: data.current.humidity,
    pressure: data.current.pressure_mb,
    precipation: data.current.precip_mm,
    wind_speed: data.current.wind_kph,
    wind_dir: data.current.wind_dir,
    condition: {
      text: data.current.condition.text,
      code: data.current.condition.code
    }
  }
}

const pushDummyWeather = async () => {
  const dummy = {"city":"Hamburg","country":"Germany","current":{"temp":12,"humidity":100,"pressure":1019,"precipation":0,"wind_speed":2.2,"wind_dir":"NNW","condition":{"text":"Klar","code":1000}},"days":[{"date":"2021-09-13","temp_max":17.8,"temp_min":11.2,"rain":77,"snow":0,"condition":{"text":"stellenweise Regenfall","code":1063}},{"date":"2021-09-14","temp_max":22.8,"temp_min":10.1,"rain":0,"snow":0,"condition":{"text":"leicht bewölkt","code":1003}},{"date":"2021-09-15","temp_max":22.5,"temp_min":14.7,"rain":83,"snow":0,"condition":{"text":"mäßiger Regenfall","code":1189}}]}

  const uri = `http://teletext.mirkoschubert.com/content/jvpeek/store.php`

  const data = render(dummy)
  try {
    const res = await axios.post(uri, data, {
      params: { format: 'json' }
    })
    console.log(res)
  } catch (e) {
    console.error(e)
  }
//  return render(dummy)
}

const pushTeletextWeather = async () => {
  const apikey = process.env.WEATHER_API_KEY
  const location = process.env.WEATHER_LOCATION
  const weather_uri = `${baseURL}forecast.json?key=${apikey}&q=${location}&days=3&lang=de`
  const teletext_uri = 'http://teletext.mirkoschubert.com/content/jvpeek/store.php'
  let data

  try {
    const weather = await axios.get(weather_uri)
    data = render(parseForecast(weather.data))
  } catch (e) {
    console.error(e)
  }

  if (data) {
    try {
      const res = await axios.post(teletext_uri, data, { params: { format: 'json' }})
      console.log(res.data)
    } catch (e) {
      console.error(e)
    }
  }
}

const forecast = async (req, res, next) => {
  
  const apikey = process.env.WEATHER_API_KEY
  const location = req.params.city || process.env.WEATHER_LOCATION
  const uri = `${baseURL}forecast.json?key=${apikey}&q=${location}&days=3&lang=de`
  
  try {
    const weather = await axios.get(uri)
    console.log(parseForecast(weather.data))
    res.send(parseForecast(weather.data))
  } catch (e) {
    console.error(e)
  }
}

const current = async (req, res, next) => {

  const apikey = process.env.WEATHER_API_KEY
  const location = req.params.city || process.env.WEATHER_LOCATION
  const uri = `${baseURL}current.json?key=${apikey}&q=${location}&lang=de`

  try {
    const weather = await axios.get(uri)
    console.log(parseCurrent(weather.data))
    res.send(parseCurrent(weather.data))
  } catch (e) {
    console.error(e)
  }

}

export { current, forecast, pushTeletextWeather, pushDummyWeather }
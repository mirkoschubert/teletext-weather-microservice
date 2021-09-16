import axios from 'axios'

/**
 * Parses the forecast weather object from weatherapi.com
 * and creates a reduced object with the needed data
 * 
 * @param {Object} data 
 * @returns {Object}
 */
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


/**
 * Parses the current weather data from weatherapi.com
 * and creates a reduced object 
 * 
 * @param {Object} data 
 * @returns {Object}
 */
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


/**
 * Gets the forcast weather data from weatherapi.com
 * 
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */
const forecast = async (req, res, next) => {
  
  const baseURL = process.env.WEATHER_BASE_URL
  const apikey = process.env.WEATHER_API_KEY
  const location = req.params.city || process.env.WEATHER_LOCATION
  const uri = `${baseURL}forecast.json?key=${apikey}&q=${location}&days=3&lang=de`
  
  try {
    const weather = await axios.get(uri)
    //console.log(parseForecast(weather.data))
    res.send(parseForecast(weather.data))
  } catch (e) {
    console.error(e)
  }
}

/**
 * Gets the current weather data from weatherapi.com
 * 
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */
const current = async (req, res, next) => {

  const baseURL = process.env.WEATHER_BASE_URL
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

export { current, forecast, parseCurrent, parseForecast }
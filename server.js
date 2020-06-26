// Require the framework and instantiate it
const fastify = require('fastify')({ logger: true })
const path = require('path')
const {
  RCApiClient,
  RCWeather,
  RED_CUBA_SOURCE,
  MUNICIPALITIES,
  UtilsService,
  IsmetWeather,
  IsmetClient
} = require('cuba-weather-javascript')
// Declare a route
fastify.register(require('fastify-cors'), {
  // put your options here
})
fastify.register(require('fastify-static'), {
  root: path.join(__dirname, 'public'),
  prefix: '/public/' // optional: default '/'
})
fastify.get('/', async (request, reply) => {
  let locationStr = 'cerro'
  let municipality = MUNICIPALITIES.find(
    municipality => municipality.nameCured === locationStr
  )
  let bestSource = UtilsService.getBestDistanceByMunicipality(
    municipality,
    RED_CUBA_SOURCE
  )

  try {
    let res = await RCApiClient.get(bestSource.name)
    let weather = new RCWeather(res.data.data)
    return weather.weathertoOBJS()
  } catch (err) {
    console.log(err)
  }
})
fastify.get('/ismet', async (request, reply) => {
  try {
    let res = await IsmetClient.get()
    // console.log(res.data)
    let weather = new IsmetWeather(res.data)
    return weather.getAllDataFromIsmet()
  } catch (err) {
    console.log(err)
  }
})
fastify.get('/spa', async (request, reply) => {
  reply.sendFile('index.html')
})

// Run the server!
const start = async () => {
  try {
    await fastify.listen(3000)
    fastify.log.info(`server listening on ${fastify.server.address().port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()

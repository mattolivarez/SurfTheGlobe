const express = require('express')
const app = express()
const path = require('path')
const axios = require('axios')
const port = process.env.PORT || 80 // saving port to be used in server into variable
require('dotenv').config()
//console.log(process.env)

// retrieving hidden api keys
const GEO_KEY = process.env.GEOAPIFY_KEY 
const NEWS_KEY = process.env.NEWS_KEY
const RAPID_KEY = process.env.RAPID_KEY


app.set('view engine', 'ejs') // sets engine for ejs formatting 

// tells express to search for static files in views directory, static files are html files
app.use(express.static(path.join(__dirname + '/views'))) 
//app.set('views', path.join(__dirname, '/views'))

app.use(express.urlencoded({ extended: true })) // parses requests in JSON format
app.use(express.json()) // similar to above, ensures we use JSON format for data from api's

 
// similar to above, tells express to search for static files in public directory
// in this case, static files are css and javascript
app.use(express.static(path.join(__dirname + '/public')))

// both of below statements are meant to incorporate three.js library for 3-d functionality
app.use('/build/', express.static(path.join(__dirname, 'node_modules/three/build')))
app.use('/jsm/', express.static(path.join(__dirname, 'node_modules/three/examples/jsm')))


let newsStories = [] // this will be array of objects to store news stories
let newsCollected = true 
let countryFacts = []
let countryCode // will store country code returned from geoapify api
let countryName // will store country name returned from geoapify api
let cultureData = []
let healthData = []
let caughtError

// "get" route that targets our home/landing page, no matter the result fo the if statement, 
// we render the index file in views directory
app.get('/', (req, res) => {
    // if (newsStories.length > 0)
    // {
    //     newsCollected = true
    //     res.render('index', { newsCollected })
    //     //res.send
    //     //res.redirect
    // }
    // else
    // {
    //     newsCollected = false
    //     res.render('index', { newsCollected })
    // }
    res.render('index') // landing page
})

// get route, retrieves game-home.ejs
app.get('/game', (req, res) => {
    res.render('game-home')
})

// get route, retrieves game-globe.ejs
app.get('/game-globe', (req, res) => {
    res.render('game-globe')
})

// get route, retrieves news-globe.ejs
app.get('/news', (req, res) => {
    res.render('news-globe') // news globe page aka informational page
})

// "post" route that handles most of our logic
// pulls latitude/longitude and serves it into axios "get" request to geoapify
// that returns country code that is served into subsequent axios "get" request to newsapi
// that returns our news stories that will be "pushed" or appended into array
// finally we redirect into results route

app.post('/search', async (req, res) => { // post request to route search
    const { latitude, longitude } = req.body // destructuring or unpacking object
    //console.log(latitude + " " + longitude)
    console.log("Request data taken from form...\n")
    console.log(JSON.stringify(req.body) + "\n\n")
    // axios get request to geoapify api to reverse geocode the latitude and longitude pulled from the requested form
    await axios.get(`https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=${GEO_KEY}`) 
        .then( (response) => {
            //console.log(response.data.features[0].properties.country_code)
            countryCode = response.data.features[0].properties.country_code; // storing country code from api
            countryName = response.data.features[0].properties.country; // storing country name from api
            console.log("Geoapify API data response...\n")
            console.log(JSON.stringify(response.data.features[0].properties) + "\n\n")
        })
        .catch( (error) => {
            // handle error
            console.log(error)
            caughtError = error
            res.redirect('/invalid-search')
        })
    // axios get request to news api using country code and country name that were just retrieved
    await axios.get(`https://newsapi.org/v2/top-headlines?country=${countryCode}&apiKey=${NEWS_KEY}`)
        .then( (response) => {
            console.log("News API response below...\n")
            console.log(JSON.stringify(response.data.articles) + "\n\n")
            // storing top 9 news stories
            newsStories = []
            for (let i = 0; i < 10; i++)
            {
                newsStories.push(response.data.articles[i])
                //console.log(newsStories[i])
            }
        })
        .catch( (error) => {
            // handle error
            console.log(error)
            caughtError = error
            res.redirect('/invalid-search')
        })
    // axios get request to rest countries api using country code variable
    await axios.get(`https://restcountries.com/v3.1/alpha/${countryCode}`)
        .then((response) => {
            console.log("Country facts API response below...\n")
            console.log(JSON.stringify(response.data) + "\n\n")
            countryFacts = []
            //console.log(response.data.articles[i])
            countryFacts.push(response.data) // storing entirety of response to use in results page
        })
        .catch((error) => {
            // handle error
            console.log(error)
            caughtError = error
            res.redirect('/invalid-search')
        })
    var options = {
        method: 'GET',
        url: 'https://spotify23.p.rapidapi.com/charts/',
        params: { type: 'regional', country: countryCode, recurrence: 'daily', date: 'latest' },
        headers: {
            'X-RapidAPI-Host': 'spotify23.p.rapidapi.com',
            'X-RapidAPI-Key': `${RAPID_KEY}`
        }
    }
    // axios get request to spotify api 
    await axios.request(options)
        .then(function (response) {
            console.log("Culture API data below...\n")
            console.log(JSON.stringify(response.data) + "\n\n")
            cultureData = [];
            for (let i = 0; i < 6 ; i++) {
                cultureData.push(response.data.content[i]) // storing top 5 results in array
            }
        })
        .catch(function (error) {
            console.error(error)
            caughtError = error
            res.redirect('/invalid-search')
        })
    var options = {
        method: 'GET',
        url: 'https://countrystat.p.rapidapi.com/coronavirus/who_latest_stat_by_country.php',
        params: { country: countryName },
        headers: {
            'X-RapidAPI-Host': 'countrystat.p.rapidapi.com',
            'X-RapidAPI-Key': `${RAPID_KEY}`
        }
    }
    // axios get request to country stat api
    await axios.request(options)
        .then(function (response) {
            console.log("Health API data below...\n")
            console.log(JSON.stringify(response.data) + "\n\n")
            healthData = [];
            //  for (let i = 0; i < 6; i++) {
            // pushing the following data into the array
            healthData.push(response.data.recordDate)
            healthData.push(response.data.population)
            healthData.push(response.data.lifeExpectancy)
            healthData.push(response.data.totalDeaths)
            healthData.push(response.data.newDeaths)
            healthData.push(response.data.totalCases)
            healthData.push(response.data.newCases)
                // const myJSON = JSON.stringify(obj);
                // localStorage.setItem("testJSON", myJSON);
            //   }
        })
        .catch(function (error) {
            console.error(error)
            caughtError = error
            res.redirect('/invalid-search')
        })
    //res.send('worked')
    res.redirect('/results') // redirects to results route, which will display results to user
})


// "get" route that targets our results page, and will render results file from views directory
app.get('/results', (req, res) => {
    //res.render('results')
    res.render('results', { newsStories, countryName, countryFacts, cultureData, healthData }) // renders results, { newsStories, countryName } this will pass the newsStories array and country name variable into the file using the ejs package, which is for templating and sending data into files
})

app.get('/invalid-search', (req,res) => {
    res.render('error', { caughtError })
})
 

// starts server, console.log is to ensure things worked properly
app.listen(port, () =>
console.log(`App listening at http://localhost:${port}`)
);
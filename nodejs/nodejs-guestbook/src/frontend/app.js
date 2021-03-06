const express = require('express')
const path = require('path');
const moment = require('moment')
const app = express();
const bodyParser = require('body-parser')
const axios = require('axios')
const util = require('./utils')

//const tracing = require('@opencensus/nodejs');
//const { StackdriverTraceExporter } = require('@opencensus/exporter-stackdriver');
const { globalStats } = require('@opencensus/core');
const { StackdriverStatsExporter } = require('@opencensus/exporter-stackdriver');
//const exporter = new StackdriverTraceExporter();
const exporter = new StackdriverStatsExporter({projectId: "next-csm"});

require('@google-cloud/profiler').start({
  serviceContext: {
      service: 'frontend',
      version: '1.0.0'
  }
});

const GUESTBOOK_API_ADDR = process.env.GUESTBOOK_API_ADDR || 'localhost:8080'

const BACKEND_URI = `http://${GUESTBOOK_API_ADDR}/messages`

const TRANSLATE_API_ADDR = process.env.TRANSLATE_API_ADDR || 'localhost:27017'

const TRANSLATE_URI = `http://${TRANSLATE_API_ADDR}/?text=`

app.set("view engine", "pug")

app.set("views", path.join(__dirname, "views"))

const router = express.Router()

app.use(router)

app.use(express.static('public'))
router.use(bodyParser.urlencoded({ extended: false }))

globalStats.registerExporter(exporter);
//tracing.registerExporter(exporter).start();

// starts an http server on the $PORT environment variable
const PORT = process.env.PORT || 8001;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});

router.get("/", (req, res) => {
    // retrieve list of messages from the backend, and use them to render the HTML template
    axios.get(BACKEND_URI)
      .then(response => {
        console.log('got response: ' + JSON.stringify(response.data))
        var entries = response.data || [];
        var strs = [];
        for (var i = 0; i < entries.length; i++) {
          strs.push(entries[i].body);
        }

        axios.get(encodeURI(TRANSLATE_URI + JSON.stringify(strs)))
          .then(resp => {
            console.log('got response: ' + JSON.stringify(resp.data))
            var translations = resp.data || [];
            var messages = [];
            for (var i = 0; i < translations.length; i++) {
              var e = entries[i];
              var t = translations[i];
              messages.push({
                name: e.name,
                body: e.body,
                timestamp: e.timestamp,
                english: t.english,
                german: t.german
              })
            }
            const result = util.formatMessages(messages)
            res.render("home", {messages: result})
          })
          .catch(err => {
            console.log('error with promise: ' + err)
          })
      }).catch(error => {
        console.log('error with promise: ' + error)
    })
});

router.post('/post', (req, res, next) => {
  // send the new message to the backend and redirect to the homepage
  console.log(req.params)
  console.log(req.body)

  axios.post(BACKEND_URI, {
    name: req.body.name,
    body: req.body.message
  }).then(response => {
      console.log('got response: ' + response.data)
      res.redirect('/')
  }).catch(error => {
      console.log('error with promise: ' + error)
  })
});

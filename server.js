const express = require('express')
const cors = require("cors")
const mongoose = require("mongoose")
const Pusher = require("pusher")
const dbModel = require('./dbModel')

// app config
const app = express()
const port = process.env.PORT || 8080

const pusher = new Pusher({
  appId: '1091160',
  key: '5f367bf3f66a524e6461',
  secret: '56c9528108f03032ed58',
  cluster: 'us2',
  usetls: true
})

//middlewares
app.use(express.json())
app.use(cors())

// DB config
const connection_url = 'mongodb+srv://admin:1C59B8FV5rRAlWih@cluster0.57itj.mongodb.net/instaDB?retryWrites=true&w=majority'
mongoose.connect(connection_url, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true
})

mongoose.connection.once('open', () => {
  console.log('db is connected')

  const changeStream = mongoose.connection.collection('posts').watch()

  changeStream.on('change', (change) => {
    console.log('ChangeStream triggered. on pusher...')
    console.log(change)
    console.log('End of change')

    if(change.operationType === 'insert') {
      console.log('Tiggering pusher ***img upload***')

      const postDetails = change.fullDocument
      pusher.trigger('posts', 'inserted', {
        user: postDetails.user,
        caption: postDetails.caption,
        image: postDetails.image
      })
    } else {
      console.log('Unknow trigger from pusher')
    }
  })
})

//api routes
app.post('/upload', (req, res) => {
  const body = req.body

  dbModel.create(body, (err, data) => {
    if(err) {
      res.status(500).send(err)
    } else {
      res.status(201).send(data)
    }
  })

  /* const dbObj = {
    caption: req.body.caption,
    user: req.body.user,
    image: {
      data: fs.readFileSync(path.join('./uploads/' + req.file.filename)),
      contentType: 'image/*'
    },
    comments: []
  } */
})

app.get('/sync', (req, res) => {
  dbModel.find((err, data) => {
    if(err) {
      res.status(500).send(err)
    } else {
      data.sort((b,a) => {
        return a.timestamp - b.timestamp
      })
      res.status(200).send(data)
    }
  })
})



// listen
app.listen(port, () => console.log(`listening on localhost:${port}`))




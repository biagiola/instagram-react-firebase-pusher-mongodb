const mongoose = require('mongoose')

const instance = mongoose.Schema({
  caption: String,
  user: String,
  image: String,
  comments: [],
  timestamp: String
})

module.exports = mongoose.model('posts', instance)
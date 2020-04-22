const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost:27017/chat-app', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})
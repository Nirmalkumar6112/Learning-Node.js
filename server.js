var express = require('express')
var app = express()
var bodyParser = require('body-parser')
const { Socket } = require('engine.io')
var http = require('http').Server(app)
var io = require('socket.io')(http)
var mongoose = require('mongoose')

app.use(express.static(__dirname))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))

//var dbUrl = 'mongodb+srv://<user>:<passcode>@cluster.qupajp9.mongodb.net/?retryWrites=true&w=majority'
var dbUrl = 'REPLACE WITH YOUR MONGODB CONNECTION URL'

var Message = mongoose.model('Message',{
    name : String,
    message : String
})

const MessageSchema = new mongoose.Schema({
    name: String,
    message: String
});

const message = mongoose.model('message',MessageSchema);


app.get('/messages',(req,res) => {
    Message.find({},(err,messages) => {
        res.send(messages)
    }) 
})

app.post('/messages',(req,res) => {
    var message = new Message(req.body)
    message.save()
        .then(() =>{
            io.emit('message',req.body)
            res.sendStatus(200)
        })
        .catch(err => {
            console.error('Error saving message:', err);
            res.status(500).json({ error: 'Internal server error' });
        })
})

io.on('connection',(Socket)=>{
    console.log('A user connected')
})

mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

var server = http.listen(4000, () => {
    console.log('Server is listening on port', server.address().port)
})



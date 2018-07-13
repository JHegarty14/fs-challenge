const express = require('express'),
      app = express(),
      mongoose = require('mongoose'),
      server = require('http').createServer(app);
      io = require('socket.io')(server);
      bodyParser = require('body-parser')
      Stock = require('./models/stock');
      apiKey = 'ZPEOYN5BB44OLCAK';
      AlphaVantageAPI = require('alpha-vantage-cli').AlphaVantageAPI;
      alphaVantageAPI = new AlphaVantageAPI(apiKey, 'compact', true);
      stockRoutes = require('./routes/stocks');

const router = express.Router();

let timerId = null,
    sockets = new Set();

mongoose
  .connect(
    'mongodb://sa:test123@ds015942.mlab.com:15942/foresight_challenge',
    { useNewUrlParser: true }
  )
  .then(() => {
    console.log('Connected to database!');
  })
  .catch(() => {
    console.log('Connection failed!');
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
  
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(__dirname + '/dist')); 

io.on('connection', socket => {

  sockets.add(socket);
  console.log(`Socket ${socket.id} added`);

  if (!timerId) {
    startTimer();
  }

  socket.on('clientdata', data => {
    console.log(data);
  });

  socket.on('disconnect', () => {
    console.log(`Deleting socket: ${socket.id}`);
    sockets.delete(socket);
    console.log(`Remaining sockets: ${sockets.size}`);
  });

});

function startTimer() {
  timerId = setInterval(() => {
    if (!sockets.size) {
      clearInterval(timerId);
      timerId = null;
      console.log(`Timer stopped`);
    }

    alphaVantageAPI.getIntradayData('TWTR', '1min')
     .then(intradayData => {
      let strData = JSON.stringify(intradayData);
      for (const s of sockets) {
        s.emit('data', { data: intradayData[0] });
      }
    })
  //return new data every minute
  }, 60000);
}

app.use('/api', stockRoutes);

server.listen(8080);
console.log('Visit http://localhost:8080 in your browser');

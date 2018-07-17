const path = require('path'),
      express = require('express'),
      bodyParser = require('body-parser'),
      mongoose = require('mongoose'),
      app = express(),
      server = require('http').createServer(app),
      io = require('socket.io')(server),
      apiKey = 'ZPEOYN5BB44OLCAK',
      AlphaVantageAPI = require('alpha-vantage-cli').AlphaVantageAPI,
      alphaVantageAPI = new AlphaVantageAPI(apiKey, 'compact', true),
      userRoutes = require('./backend/routes/user');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

let timerId = null,
    sockets = new Set();

app.use(express.static(__dirname + '/dist')); 

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

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
    alphaVantageAPI.getIntradayData('TWTR', '1min')
       .then(intradayData => {
        let strData = JSON.stringify(intradayData);
        for (const s of sockets) {
          s.emit('data', { data: intradayData[0] });
        }
      })
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
    }, 10000);
  }

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('*', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, cache-control, pragma'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PATCH, PUT, DELETE, OPTIONS'
  );
  next();
});

app.use('/api/user', userRoutes);

const PORT = process.env.PORT || 8080
console.log(PORT);
server.listen(PORT);

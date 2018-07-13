const express = require('express');
const Stock = require('../models/stock');

const router = express.Router();

module.exports = app => {

  router.get('', (req, res, next) => {
      console.log('route hit.')
      const options = +req.query.pageOptions
      let fetchedStocks;
      if (options !== 'live') {
        if (options === 'one') {
          oneWeek();
        } else {
          twoWeeks();
        }
      }
    })
    
  function oneWeek() {
    Stock.aggregate([
      { $match: 
        {
          date: { $gte: new Date(2018,07,06) }
        }
      },
      {
        $group: {
          _id: '$grp',
          openAvg: { $avg: '$open' },
          highAvg: { $avg: '$high' },
          lowAvg: { $avg: '$low' },
          closeAvg: { $avg: '$close' },
          volAvg: { $avg: '$volume' }
        }
      }
    ])
    .then(documents => {
      fetchedPosts = documents;
      return Post.count();
    })
    .then(count => {
      res.status(200).json({
        message: "Posts fetched successfully!",
        stocks: fetchedStocks
      });
    });
  }
  
  function twoWeeks() {
    Stock.aggregate([
      {
        $group: {
          _id: '$grp',
          openAvg: { $avg: '$open' },
          highAvg: { $avg: '$high' },
          lowAvg: { $avg: '$low' },
          closeAvg: { $avg: '$close' },
          volAvg: { $avg: '$volume' }
        }
      }
    ])
    .then(documents => {
      fetchedPosts = documents;
      return Post.count();
    })
    .then(count => {
      res.status(200).json({
        message: "Posts fetched successfully!",
        stocks: fetchedStocks
      });
    });
  }

}
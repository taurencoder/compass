var path = require('path');
var fs = require('fs');
var servicePath = path.join(__dirname, '../services');
var modelPath = path.join(__dirname, '../models');

var ServiceInitializer = {
  init: function() {
    // Init all services
    fs.readdirSync(servicePath).forEach(function(service) {
      require('../services/' + service);
    });

    // Init all models
    fs.readdirSync(modelPath).forEach(function(model) {
      require('../models/' + model);
    });
  }
};

module.exports = ServiceInitializer;

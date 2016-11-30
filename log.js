
var colors = require('colors/safe');
var moment = require('moment');

function makeLogger(name, color) {
  return function() {
    var prefix = "";
    color = color || colors.green;
    prefix = colors.gray('[' + moment().format("HH:mm:ss.SSS") + ']') + ' ' + color(name) + ' ';

    arguments[0] = prefix + arguments[0];
    console.log.apply(console, arguments);
  };
}


module.exports = makeLogger;


var routie = require('../../3rdparty/routie.min');
var view = require('../views/gamepad.hbs');

module.exports = function() {
  
  $('#page').html(view());
  $('#exit').on('click', function() {
    routie.navigate('/thanks');
  });
  
};
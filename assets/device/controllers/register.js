var routie = require('../../3rdparty/routie.min');
var view = require('../views/register.hbs');

module.exports = function() {
  
  $('#page').attr('class', 'register');
  $('#page').html(view());
  
  $('button').on('click', function() {
    routie.navigate('/wait');
    return false;
  });
  
};

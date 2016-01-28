var React = require('react');
var ReactDOM = require('react-dom');

var Magnolial = require('./magnolial');

document.addEventListener("DOMContentLoaded", function (){
    var content = document.getElementById("content");
    ReactDOM.render(<Magnolial initRoot={{children:[{}]}}/>, content);
});

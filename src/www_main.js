var React = require('react');
var ReactDOM = require('react-dom');

var Magnolial = require('./magnolial');

var TestList = [{}];

document.addEventListener("DOMContentLoaded", function (){
    var content = document.getElementById("content");
    ReactDOM.render(<Magnolial initRoots={TestList}/>, content);
});
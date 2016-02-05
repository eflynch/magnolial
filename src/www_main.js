var React = require('react');
var ReactDOM = require('react-dom');
var _ = require('underscore');

var Magnolial = require('./magnolial');
var ImmutableTree = require('./immutable-tree');

var save = function (root, head, focus){
    var update = {
        focus: focus,
        head: head,
        root: JSON.stringify(root)
    };
}

var render = function (root){
    var content = document.getElementById("content");
    ReactDOM.render(<Magnolial initRoot={root} onUpdate={_.throttle(save, 1000)}/>, content);
};

document.addEventListener("DOMContentLoaded", function (){
    render(undefined);
});

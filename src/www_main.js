var React = require('react');
var ReactDOM = require('react-dom');

var Magnolial = require('./magnolial');

var TestList = [
    {
        title: 'Root Node',
        note: 'This is the root node dude',
        children: [
            {title: 'Sub node 1', collapsed: false},
            {title: 'Sub node 2', note: 'This is another note', children: []},
            {title: 'Sub node 3', children:[{title:'Subsubnode 1'}, {title:'Subsubnode 2'}], collapsed:true}
        ]
    },
    {
        title: 'Root Node 2',
        note: 'This is the root node dude',
        children: [
            {title: 'Sub node 1', collapsed: false},
            {title: 'Sub node 2', note: 'This is another note', children: []},
            {title: 'Sub node 3', children:[{title:'Subsubnode 1'}, {title:'Subsubnode 2'}], collapsed:true}
        ]
    }
]

document.addEventListener("DOMContentLoaded", function (){
    var content = document.getElementById("content");
    ReactDOM.render(<Magnolial initRoots={TestList}/>, content);
});
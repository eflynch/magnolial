var React = require('react');
var ReactDOM = require('react-dom');
var _ = require('underscore');

var Magnolial = require('./magnolial').Magnolial;

var userfolder = window.location.hash.slice(1);

var preferencesFile = '~/.magnolial';

var writeToFile = function (filename, obj){
    if (fs === null || fs === undefined){return;}
    if (filename[0] === '~'){
        filename = userfolder + filename.slice(1);
    }
    fs.writeFile(filename, JSON.stringify(obj)); 
}

var readFromFile = function (filename){
    if (fs === null || fs === undefined){return;}
    if (filename[0] === '~'){
        filename = userfolder + filename.slice(1);
    }
    return JSON.parse(fs.readFileSync(filename, 'utf8'));
}

var FileName = React.createClass({
    getInitialState: function (){
        return {
            filename: ""
        }
    },
    componentWillMount: function (){
        if (this.props.hasOwnProperty('initFilename')){
            this.setState({filename: this.props.initFilename});
            this.doRead(this.props.initFilename);
        }
    },
    handleChange: function (e){
        this.setState({filename: e.target.value});
    },
    doRead: function (filename){
        var doRead = _.throttle(function (){
            var root;
            try{
                root = readFromFile(filename).root;
            } catch(e){
                if (e.code !== 'ENOENT') throw e;
                root = {childs:[{}]};
                writeToFile(filename, {root: root});
            }
            render(root, this.doWrite);
        }.bind(this), 5000);
        doRead();
    },
    doWrite: function (root){
        writeToFile(this.state.filename, {root:root});
    },
    onKeyDown: function (e){
        if (e.key === 'Enter'){
            e.preventDefault();
            this.doRead(this.state.filename);
            writeToFile(preferencesFile, {lastRead: this.state.filename});
        }
    },
    render: function (){
        return (
            <input type="text" value={this.state.filename} onChange={this.handleChange} onKeyDown={this.onKeyDown}/>
        );
    }
});

var render = function (root, onUpdate){
    var content = document.getElementById("content");
    ReactDOM.render(<Magnolial initRoot={root} onUpdate={onUpdate}/>, content);
};

document.addEventListener("DOMContentLoaded", function (){
    var filepath = document.getElementById("filepath");
    var filename = readFromFile(preferencesFile).lastRead;
    ReactDOM.render(<FileName initFilename={filename}/>, filepath);
});

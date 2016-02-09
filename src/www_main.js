var React = require('react');
var ReactDOM = require('react-dom');
var _ = require('underscore');

var Magnolial = require('./magnolial').Magnolial;

var userfolder = window.location.hash.slice(1);

var preferencesFile = '~/.magnolial';

var writeToFile = function (filename, obj){
    if (!window.hasOwnProperty('fs')){return;}
    if (filename[0] === '~'){
        filename = userfolder + filename.slice(1);
    }
    fs.writeFile(filename, JSON.stringify(obj)); 
}

var readFromFile = function (filename){
    if (!window.hasOwnProperty('fs')){return;}
    if (filename[0] === '~'){
        filename = userfolder + filename.slice(1);
    }
    return JSON.parse(fs.readFileSync(filename, 'utf8'));
}

var renderMagnolial = function (trunk, onUpdate, onBlur){
    var content = document.getElementById("content");
    ReactDOM.render(<Magnolial initTrunk={trunk} onUpdate={onUpdate} onBlur={onBlur}/>, content);
};

var FileName = React.createClass({
    getInitialState: function (){
        return {
            filename: "",
            showError: false
        }
    },
    componentWillMount: function (){
        if (this.props.hasOwnProperty('initFilename')){
            this.setState({filename: this.props.initFilename});
            this.doRead(this.props.initFilename);
        }
    },
    componentDidMount: function(){
    },
    handleChange: function (e){
        this.setState({filename: e.target.value});
    },
    handleBlur: function (e){
        if (e.relatedTarget === null){
            document.getElementsByClassName("MAGNOLIAL_focustitle")[0].focus();
        }
    },
    doRead: function (filename){
        if (filename.split('.')[filename.split('.').length - 1] !== 'mgl'){
            this.setState({
                showError: true,
                errorMsg: "File-extension must be '.mgl' -- auto-save disabled"
            });
            return;
        } else {
            this.setState({showError: false});
        }
        var doRead = _.throttle(function (){
            var trunk;
            try{
                trunk = readFromFile(filename).trunk;
            } catch(e){
                if (e.code != 'ENOENT') {throw e;}
                trunk = {childs:[{}]};
                writeToFile(filename, {trunk: trunk});
            }
            renderMagnolial(trunk, this.onChange, this.onBlur);
        }.bind(this), 5000);
        doRead();
    },
    doWrite: function (filename, data){
        if (filename.split('.')[filename.split('.').length - 1] !== 'mgl'){
            return;
        }
        writeToFile(filename, data);
    },
    onChange: function(trunk){
        this.doWrite(this.state.filename, {
            trunk: trunk,
            timestamp: Date.now()
        });
    },
    onBlur: function (e){
        if (e.relatedTarget === null){
            ReactDOM.findDOMNode(this.refs.input).focus();
        }
    },
    onKeyDown: function (e){
        if (e.key === 'Enter'){
            e.preventDefault();
            this.doRead(this.state.filename);
            writeToFile(preferencesFile, {lastRead: this.state.filename});
        }
    },
    render: function (){
        var input = <input ref="input" type="text" value={this.state.filename} onChange={this.handleChange} onKeyDown={this.onKeyDown}/>;
        if (this.state.showError){
            return (
                <div>
                    <div className="MAGNOLIAL_error">{this.state.errorMsg}</div>
                    {input}
                </div>
            );
        }
        return input;
    }
});

var getPreferences = function(){
    var preferences = readFromFile(preferencesFile);
    if (preferences === undefined){
        return {lastRead: "made_a_mistake.mgl"};
    }
    return preferences;
}


document.addEventListener("DOMContentLoaded", function (){
    var filepath = document.getElementById("filepath");
    var filename = getPreferences().lastRead;
    ReactDOM.render(<FileName initFilename={filename}/>, filepath);
});

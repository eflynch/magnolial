var React = require('react');
var ReactDOM = require('react-dom');
var _ = require('underscore');
var FontAwesome = require('react-fontawesome');

var Magnolial = require('./magnolial');
var ImmutableTree = require('./immutable-tree');
var IO = require('./magnolial-io')


var renderMagnolial = function (trunk, onUpdate, onBlur){
    var content = document.getElementById("content");
    ReactDOM.render(<Magnolial initTrunk={trunk} onUpdate={onUpdate} onBlur={onBlur}/>, content);
};

var validateFilename = function(filename){
    return filename.split('.')[filename.split('.').length - 1] === 'mgl';
}

var validateFile = function (file){
    if (file === undefined){
        return false;
    }
    if (file === null){
        return false;
    }
    if (!file.hasOwnProperty('trunk')){
        return false;
    }
    if (!file.trunk.hasOwnProperty('childs')){
        return false;
    }
    return true;
}


var FileName = React.createClass({
    getInitialState: function (){
        return {
            aFilename: "",
            bFilename: "",
            showError: false,
            autoSaveA: false,
            autoSaveB: false

        }
    },
    componentWillMount: function (){
        var prefs = IO.getPrefs();

        this.setState({
            aFilename: prefs.lastReadA,
            bFilename: prefs.lastReadB
        });
        this.doRead(prefs.lastReadA);
        this.setState({autoSaveA: true, autoSaveB: false});
    },
    handleAChange: function (e){
        this.setState({aFilename: e.target.value});
    },
    handleBChange: function (e){
        this.setState({bFilename: e.target.value});
    },
    handleBlur: function (e){
        if (e.relatedTarget === null){
            document.getElementsByClassName("MAGNOLIAL_focustitle")[0].focus();
        }
    },
    doRead: function (filename){
        if (!validateFilename(filename)){
            this.setState({
                showError: true,
                errorMsg: "File-extension must be '.mgl' -- auto-save disabled"
            });
            return;
        } 

        this.setState({showError: false});

        var onSuccess = function(file){
            if (!validateFile(file)){
                return;
            }
            renderMagnolial(file.trunk, this.onChange, this.onBlur);
        }.bind(this);

        var onFailure = function (e){
            if (e.status === 404){
                var trunk = ImmutableTree.makeEmptyTrunk();
                IO.post(filename, {trunk: trunk});
                renderMagnolial(trunk, this.onChange, this.onBlur); 
            } else {
                this.setState({showError: true, errorMsg: "An error occurred"});
            }
        }.bind(this);

        _.throttle(function (){
            IO.get(filename, onSuccess, onFailure);
        }.bind(this), 5000)();
    },
    onChange: function(trunk){
        var timestamp = Date.now();
        if (this.state.autoSaveA){
            if (!validateFilename(this.state.aFilename)){
                return;
            }
            IO.patch(this.state.aFilename, {
                trunk: trunk,
                timestamp: timestamp
            }); 
        }
        if (this.state.autoSaveB){
            if (!validateFilename(this.state.bFilename)){
                return;
            }
            IO.patch(this.state.bFilename, {
                trunk: trunk,
                timestamp: timestamp
            }); 
        }
    },
    onBlur: function (e){
        if (e.relatedTarget === "a"){
            ReactDOM.findDOMNode(this.refs.a).focus();
        }
        if (e.relatedTarget === "b"){
            ReactDOM.findDOMNode(this.refs.b).focus();
        }
    },
    handleAFocus: function (e){
        var tempVal = ReactDOM.findDOMNode(this.refs.a).value;
        ReactDOM.findDOMNode(this.refs.a).value = tempVal;
    },
    handleAFocus: function (e){
        var tempVal = ReactDOM.findDOMNode(this.refs.b).value;
        ReactDOM.findDOMNode(this.refs.b).value = tempVal;
    },
    handleAKeyDown: function (e){
        if (e.key === 'Enter'){
            e.preventDefault();
            this.doRead(this.state.aFilename);
            this.setState({autoSaveA: true, autoSaveB: false});
            IO.updatePrefs({lastReadA: this.state.aFilename});
        }
    },
    handleBKeyDown: function (e){
        if (e.key === 'Enter'){
            e.preventDefault();
            this.doRead(this.state.bFilename);
            this.setState({autoSaveB: true, autoSaveA: false});
            IO.updatePrefs({lastReadB: this.state.bFilename});
        }
    },
    handleClick: function (e){
        IO.sync(this.state.aFilename, this.state.bFilename, function(){
            this.doRead(this.state.aFilename);
            this.setState({autoSaveA: true, autoSaveB: true});
        }.bind(this), function(){console.log("failed");});
    },
    render: function (){
        if (this.state.autoSaveA && this.state.autoSaveB){
            var symbol = <FontAwesome name='link' color={{color:'blue'}}/>;
        } else {
            var symbol = <FontAwesome name='chain-broken' style={{color:'gray'}}/>;
        }
        return (
            <div>
                <div className="MAGNOLIAL_error" style={{display: this.state.showError ? 'none' : 'block'}}>{this.state.errorMsg}</div>
                <input ref="a"
                       className={this.state.autoSaveA ? "MAGNOLIAL_autosave" : ""}
                       type="text"
                       value={this.state.aFilename}
                       onChange={this.handleAChange}
                       onKeyDown={this.handleAKeyDown}
                       onFocus={this.handleAFocus}/>
                <button className="MAGNOLIAL_seperator" onClick={this.handleClick}>{symbol}</button>
                <input ref="b"
                       className={this.state.autoSaveB ? "MAGNOLIAL_autosave" : ""}
                       type="text"
                       value={this.state.bFilename}
                       onChange={this.handleBChange}
                       onKeyDown={this.handleBKeyDown}
                       onFocus={this.handleBFocus}/>
            </div>
        );
    }
});



document.addEventListener("DOMContentLoaded", function (){
    var filepath = document.getElementById("filepath");
    ReactDOM.render(<FileName/>, filepath);
});

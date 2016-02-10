var React = require('react');
var ReactDOM = require('react-dom');

var ContentEditable = require('./contenteditable');

function placeCaretAtEnd(el) {
    el.focus();
    if (typeof window.getSelection != "undefined"
            && typeof document.createRange != "undefined") {
        var range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    } else if (typeof document.body.createTextRange != "undefined") {
        var textRange = document.body.createTextRange();
        textRange.moveToElementText(el);
        textRange.collapse(false);
        textRange.select();
    }
}

var Title = React.createClass({
    componentDidMount() {
        if (this.props.hasFocus){
            var inputNode = ReactDOM.findDOMNode(this.refs.input);
            if (document.activeElement !== inputNode){
                inputNode.focus();
            }
        }
    },
    componentDidUpdate(prevProps, prevState) {
        if (this.props.hasFocus){
            var inputNode = ReactDOM.findDOMNode(this.refs.input);
            if (document.activeElement !== inputNode){
                inputNode.focus();
            }
        }
    },
    onBlur: function(e){
        if (e.relatedTarget === null){
            this.props.setFocus(null);
        }
    },
    onFocus: function(e){
        placeCaretAtEnd(ReactDOM.findDOMNode(this.refs.input));
    },
    setValue: function (e){
        if (e.target.value !== this.props.trunk.value){
            this.props.setValue(this.props.trunk, e.target.value);
        }
    },
    render: function (){
        var className = 'MAGNOLIAL_ce';
        if (this.props.trunk.completed){
            className += ' MAGNOLIAL_completed';
        }
        if (!this.props.entryEnabled){
            className += ' MAGNOLIAL_readonly';
        }
        if (this.props.hasFocus){
            className += ' MAGNOLIAL_focused';
        }
        return (
            <div className="MAGNOLIAL_ce_wrapper">
                <ContentEditable className={className + " MAGNOLIAL_ce_bottom"}
                                 ref="bottom"
                                 html={this.props.trunk.value}
                                 disabled={true}/>
                <ContentEditable ref='input' className={className + " MAGNOLIAL_ce_top"}
                                 html={this.props.trunk.value}
                                 onKeyDown={this.props.onKeyDown}
                                 onBlur={this.onBlur}
                                 onFocus={this.onFocus}
                                 onChange={this.setValue}/>
            </div>
        );
    }
});

module.exports = Title;

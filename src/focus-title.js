var React = require('react');
var ReactDOM = require('react-dom');
var rb = require('react-bootstrap');

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

var FocusTitle = React.createClass({
    componentDidMount() {
        this.componentDidUpdate();
    },
    componentDidUpdate(prevProps, prevState) {
        if (this.props.hasFocus){
            var inputNode = ReactDOM.findDOMNode(this.refs.input);
            if (document.activeElement !== inputNode){
                inputNode.focus();
            }
        }
    },
    onFocus: function (){
        this.props.setFocus(this.props.head);
        placeCaretAtEnd(ReactDOM.findDOMNode(this.refs.input));
    },
    onKeyDown: function (e){
        this.props.keyDownHandler(e, this.props.head);
    },
    render: function (){
        var className = "MAGNOLIAL_ce MAGNOLIAL_focustitle";
        if (this.props.hasFocus){
            className += " MAGNOLIAL_focused";
        }
        if (!this.props.entryEnabled){
            className += ' MAGNOLIAL_readonly';
        }
        return (
            <h1 onFocus={this.onFocus}>
                <div className="MAGNOLIAL_ce_wrapper">
                    <ContentEditable ref='input' className={className + ' MAGNOLIAL_ce_bottom'} html={this.props.head.value} disabled={true}/>
                    <ContentEditable ref='input' className={className + ' MAGNOLIAL_ce_top'} html={this.props.head.value} onChange={function (e){
                        this.props.setValue(this.props.head, e.target.value);
                    }.bind(this)} onKeyDown={this.onKeyDown}/>
                </div>
            </h1>
        );
    }
});

module.exports = FocusTitle;

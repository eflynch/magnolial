var React = require('react');

var ContentEditable = React.createClass({
    getInitialState: function (){
        return {
            lastHTML: null
        }
    },
    render: function() {
        return React.createElement(
            this.props.tagName || 'div',
            Object.assign({}, this.props, {
                ref: function(e){ this.htmlEl = e}.bind(this),
                onInput: this.emitChange,
                onBlur: this.emitChange,
                contentEditable: !this.props.disabled,
                dangerouslySetInnerHTML: {__html: this.props.html}
            }),
            this.props.children
        );
    },

    shouldComponentUpdate: function(nextProps) {
        return !this.htmlEl || nextProps.html !== this.htmlEl.innerHTML ||
                this.props.disabled !== nextProps.disabled || this.props.className !== nextProps.className;
    },

    componentDidUpdate: function() {
        if ( this.htmlEl && this.props.html !== this.htmlEl.innerHTML ) {
            this.htmlEl.innerHTML = this.props.html;
        }
    },

    emitChange: function(evt) {
        if (!this.htmlEl) return;
        var html = this.htmlEl.innerHTML;
        if (this.props.onChange && html !== this.state.lastHTMLl) {
            evt.target = { value: html };
            this.props.onChange(evt);
        }
        this.setState({lastHTML: html});
    }
});


module.exports = ContentEditable;

import React from 'react';

class ContentEditable extends React.Component { 
    constructor(props){
        super(props);
        this.state = {lastHTML: null};
        this.emitChange = this.emitChange.bind(this);
    }

    render() {
        const {html, ...rest } = this.props;
        return React.createElement(
            this.props.tagName || 'div',
            Object.assign({}, rest, {
                ref: function(e){ this.htmlEl = e}.bind(this),
                onInput: this.emitChange,
                onBlur: this.emitChange,
                contentEditable: !this.props.disabled,
                spellCheck: false,
                dangerouslySetInnerHTML: {__html: html}
            }),
            this.props.children
        );
    }

    shouldComponentUpdate(nextProps) {
        return !this.htmlEl || nextProps.html !== this.htmlEl.innerHTML ||
                this.props.disabled !== nextProps.disabled || this.props.className !== nextProps.className;
    }

    componentDidUpdate() {
        if ( this.htmlEl && this.props.html !== this.htmlEl.innerHTML ) {
            this.htmlEl.innerHTML = this.props.html;
        }
    }

    emitChange(evt) {
        if (!this.htmlEl) return;
        var html = this.htmlEl.innerHTML;
        if (this.props.onChange && html !== this.state.lastHTMLl) {
            evt.target = { value: html };
            this.props.onChange(evt);
        }
        this.setState({lastHTML: html});
    }
}


module.exports = ContentEditable;

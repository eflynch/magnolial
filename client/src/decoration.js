import React from 'react';

import FontAwesome from 'react-fontawesome';

class Decoration extends React.Component {
    onClick (e){
        if (e.metaKey){
            this.props.setHead(this.props.trunk);
        } else if (this.props.collapseable) {
            this.props.toggleCollapsed();
        } else if (this.props.hasContent) {
            this.props.setHead(this.props.trunk);
        } else if (this.props.hasLink) {
            window.location = this.props.trunk.value.link; 
        } else {
            this.props.setFocus(this.props.trunk);
        }
    }

    render (){
        var className = "MAGNOLIAL_decoration";
        if (this.props.collapseable){
            if (this.props.collapsed){
                var name = 'chevron-circle-right';
            } else {
                var name = 'chevron-down';
            }
        } else {
            var name = 'circle';
        }
        return (
            <FontAwesome name={name} className={className} onClick={this.onClick.bind(this)}/>
        );
    }
}

module.exports = Decoration;

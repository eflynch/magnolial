import React from 'react';

import FontAwesome from 'react-fontawesome';

const Decoration = ({setHead, collapseable, collapsed, toggleCollapsed, setFocus, trunk, hasLink}) => {
    const className = "decoration";
    const name = collapseable ? (collapsed ? 'chevron-circle-right' : 'chevron-down') : 'circle';
    return (
        <FontAwesome name={name} className={className} onClick={(e) => {
            if (e.metaKey){
                setHead(trunk);
            } else if (collapseable) {
                toggleCollapsed();
            } else if (hasContent) {
                setHead(trunk);
            } else if (hasLink) {
                window.location = trunk.value.link; 
            } else {
                setFocus(this.props.trunk);
            }
        }}/>
    );
}
export default Decoration;

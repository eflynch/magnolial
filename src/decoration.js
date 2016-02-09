var React = require('react');
var ReactDOM = require('react-dom');

var FontAwesome = require('react-fontawesome');

var Decoration = React.createClass({
    onClick: function (e){
        if (e.metaKey){
            this.props.toggleCollapsed();
        } else {
            this.props.setHead();
        }
    },
    render: function (){
        var className = "MAGNOLIAL_decoration";
        if (this.props.completed){
            className += " MAGNOLIAL_completed";
        }
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
            <FontAwesome name={name} className={className} onClick={this.onClick}/>
        );
    }
});

module.exports = Decoration;

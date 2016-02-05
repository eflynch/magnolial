var React = require('react');
var ReactDOM = require('react-dom');

var FontAwesome = require('react-fontawesome');

var Decoration = React.createClass({
    render: function (){
        if (this.props.collapseable){
            if (this.props.collapsed){
                var name = 'bug';
            } else {
                var name = 'lemon-o';
            }
        } else {
            var name = 'paw'
        }
        return (
            <FontAwesome name={name} className="MAGNOLIAL_decoration" onClick={this.props.toggleCollapsed}/>
        );
    }
});

module.exports = Decoration;

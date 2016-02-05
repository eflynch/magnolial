var React = require('react');
var rb = require('react-bootstrap');

var Breadcrumbs = React.createClass({
    shouldComponentUpdate: function(nextProps, nextState){
        if (this.props === nextProps){
            return false;
        }
        return true;
    },
    render: function (){
        var breadcrumbs = this.props.ancestors.map(function(parent){
            var onClick = function (e){
                this.props.setHead(parent);
                this.props.setFocus(parent);
            }.bind(this);
            if (!parent.value){
                var text = '...';
            } else if (parent.value.length > 20){
                var text = parent.value.substring(0, 20) + '...';
            } else {
                var text = parent.value;
            }
            return (
                <span key={parent._serial}>
                    <span className="MAGNOLIAL_breadcrumb" onClick={onClick}>
                        {text}
                    </span>
                    <span className="MAGNOLIAL_breadcrumb_sym">‣</span>
                </span>
            );
        }.bind(this));
        return (
            <h3>
                {breadcrumbs}
            </h3>
        );
    }   
});

module.exports = Breadcrumbs;

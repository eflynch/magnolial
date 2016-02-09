var React = require('react');
var rb = require('react-bootstrap');


var strip = function(html)
{
   var tmp = document.createElement("DIV");
   tmp.innerHTML = html;
   return tmp.textContent || tmp.innerText || "";
}

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
            } else {
                var strippedValue = strip(parent.value);
                if (strippedValue.length > 20){
                    var text = strippedValue.substring(0, 20) + '...';
                } else {
                    var text = strippedValue;
                }
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
            <h2>
                {breadcrumbs}
            </h2>
        );
    }   
});

module.exports = Breadcrumbs;

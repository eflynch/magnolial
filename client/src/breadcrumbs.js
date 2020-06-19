import React from 'react';

var strip = function(html)
{
   var tmp = document.createElement("DIV");
   tmp.innerHTML = html;
   return tmp.textContent || tmp.innerText || "";
}

class Breadcrumbs extends React.PureComponent {
    render (){
        var breadcrumbs = this.props.ancestors.map(function(parent){
            var onClick = function (e){
                this.props.setHead(parent);
            }.bind(this);
            if (!parent.value.title){
                var text = '...';
            } else {
                var strippedValue = strip(parent.value.title);
                if (strippedValue.length > 20){
                    var text = strippedValue.substring(0, 20) + '...';
                } else {
                    var text = strippedValue;
                }
            }
            return (
                <span key={parent._serial}>
                    <span className="breadcrumb-text" onClick={onClick}>
                        {text}
                    </span>
                    <span className="breadcrumb-sym">‣</span>
                </span>
            );
        }.bind(this));
        return (
            <div className="breadcrumb-wrapper">
                {breadcrumbs}
            </div>
        );
    }   
}

module.exports = Breadcrumbs;

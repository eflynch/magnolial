var React = require('react');

var Item = React.createClass({
    genChildren: function(){
        if (this.props.children === undefined){
            return [];
        }
        return this.props.children.map(function(child, i){
            return <Item title={child.title}
                         note={child.note}
                         children={child.children}
                         serial={child.serial}
                         key={child.serial}
                         collapsed={child.collapsed}
                         collapse={this.props.collapse}/>;
        }.bind(this));
    },
    toggleCollapsed: function (){
        this.props.collapse(this.props.serial, !this.props.collapsed);
    },
    renderDecoration: function (){
        var symbol;
        if (this.props.children.length){
            if (this.props.collapsed){
                symbol = '❧';
            } else {
                symbol = '❦';
            }
        } else {
            symbol = '❀'
        }
        return <span className='MAGNOLIAL_decoration'
                     onClick={this.toggleCollapsed}>{symbol}</span>;
    },
    render: function(){
        return (
            <li>
                <h1>{this.renderDecoration()}{this.props.title}</h1>
                <p>{this.props.note}</p>
                <ul className={this.props.collapsed ? 'MAGNOLIAL_hidden' : ''}>
                    {this.genChildren()}
                </ul>
            </li>
        );
    }
});

module.exports = Item;

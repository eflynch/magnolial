var React = require('react');
var ReactDOM = require('react-dom');
var rb = require('react-bootstrap');

var Title = require('./title');
var Decoration = require('./decoration');

var Item = React.createClass({
    shouldComponentUpdate: function (nextProps, nextState){
        if (this.props.root !== nextProps.root){
            return true;
        }
        if (nextProps.focus === nextProps.root){
            return true;
        }
        if (this.props.focus !== nextProps.focus){
            if (nextProps.focusAncestors.indexOf(nextProps.root) > -1){
                return true;
            } 
        }
        
        return false;
    },
    genChildren: function(){
        if (this.props.root.childs === undefined){
            return [];
        }
        if (this.props.root.collapsed){
            return [];
        }
        return this.props.root.childs.map(function(child){
            return <Item root={child}
                         key={child._serial}
                         focus={this.props.focus}
                         focusAncestors={this.props.focusAncestors}
                         allFocus={this.props.allFocus}
                         setFocus={this.props.setFocus}
                         keyDownHandler={this.props.keyDownHandler}
                         setCollapsed={this.props.setCollapsed}
                         setValue={this.props.setValue}/>;
        }.bind(this));
    },
    toggleCollapsed: function (){
        this.props.setCollapsed(this.props.root, !this.props.root.collapsed);
    },
    onFocus: function (){
        this.props.setFocus(this.props.root);
    },
    onKeyDown: function (e){
        this.props.keyDownHandler(e, this.props.root);
    },
    render: function(){
        return (
            <li>
                <rb.Col lg={12}>
                    <rb.Row onFocus={this.onFocus} onKeyDown={this.onKeyDown}>
                        <Decoration collapseable={this.props.root.childs.length > 0} 
                                    collapsed={this.props.root.collapsed}
                                    toggleCollapsed={this.toggleCollapsed}/>
                        <Title root={this.props.root}
                               setValue={this.props.setValue}
                               setFocus={this.props.setFocus}
                               focus={this.props.focus === this.props.root}/>
                    </rb.Row>
                    <rb.Row>
                        <ul>
                            {this.genChildren()}
                        </ul>
                    </rb.Row>
                </rb.Col>
            </li>
        );
    }
});

module.exports = Item;

var React = require('react');
var ReactDOM = require('react-dom');
var rb = require('react-bootstrap');

var Title = require('./title');
var Decoration = require('./decoration');

var Item = React.createClass({
    shouldComponentUpdate: function (nextProps, nextState){
        if (this.props.trunk !== nextProps.trunk){
            return true;
        }
        if (nextProps.focus === nextProps.trunk){
            return true;
        }
        if (this.props.focus !== nextProps.focus){
            if (nextProps.focusAncestors.indexOf(nextProps.trunk) > -1){
                return true;
            } 
        }
        return false;
    },
    genChildren: function(){
        if (this.props.trunk.childs === undefined){
            return [];
        }
        if (this.props.trunk.collapsed){
            return [];
        }
        return this.props.trunk.childs.map(function(child){
            return <Item trunk={child}
                         key={child._serial}
                         focus={this.props.focus}
                         focusAncestors={this.props.focusAncestors}
                         setHead={this.props.setHead}
                         setFocus={this.props.setFocus}
                         keyDownHandler={this.props.keyDownHandler}
                         setCollapsed={this.props.setCollapsed}
                         entryEnabled={this.props.entryEnabled}
                         setValue={this.props.setValue}/>;
        }.bind(this));
    },
    toggleCollapsed: function (){
        this.props.setCollapsed(this.props.trunk, !this.props.trunk.collapsed);
    },
    setHead: function (){
        this.props.setHead(this.props.trunk);
    },
    onFocus: function (){
        this.props.setFocus(this.props.trunk);
    },
    onKeyDown: function (e){
        this.props.keyDownHandler(e, this.props.trunk);
    },
    render: function(){
        return (
            <li>
                <rb.Col lg={12}>
                    <rb.Row onFocus={this.onFocus} onKeyDown={this.onKeyDown}>
                        <Decoration collapseable={this.props.trunk.childs.length > 0} 
                                    collapsed={this.props.trunk.collapsed}
                                    completed={this.props.trunk.completed}
                                    toggleCollapsed={this.toggleCollapsed}
                                    setHead={this.setHead}/>
                        <Title trunk={this.props.trunk}
                               setValue={this.props.setValue}
                               setFocus={this.props.setFocus}
                               readOnly={!this.props.entryEnabled}
                               focus={this.props.focus === this.props.trunk}/>
                    </rb.Row>
                    <rb.Row className="MAGNOLIAL_list">
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

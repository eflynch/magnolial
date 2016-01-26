var React = require('react');

var Item = require('./item');

var Magnolial = React.createClass({
    getInitialState() {
        return {
            roots: [],
            nextSerial: 0
        };
    },
    componentWillMount() {
       if (this.props.hasOwnProperty('initRoots')){
            this.initializeTree(this.props.initRoots);
        }      
    },
    componentWillReceiveProps(nextProps) {
        if (nextProps.hasOwnProperty('initRoots')){
            this.initializeTree(nextProps.initRoots);
        }  
    },
    initializeTree: function (roots){
        // add serials and missing fields
        var serial = 0;
        var node_hash = {};
        var process = function (child){
            if (child.title === undefined){
                child.title = "";
            }
            if (child.note === undefined){
                child.note = "";
            }
            if (child.children === undefined){
                child.children = [];
            }
            if (child.collapsed === undefined){
                child.collapsed = false;
            }
            child.serial = serial;
            node_hash[serial] = child;
            serial += 1;
            for (var i=0; i < child.children.length; i++){
                process(child.children[i]);
            }
        };
        for (var i=0; i < roots.length; i++){
            process(roots[i]);
        }

        this.setState({
            roots: roots,
            node_hash: node_hash,
            nextSerial: serial
        });
    },
    collapse: function (serial, state){
        this.state.node_hash[serial].collapsed = state;
        this.setState({
            roots: this.state.roots
        });
    },
    renderRoots: function (){
        if (this.state.roots === undefined){
            return [];
        }
        return this.state.roots.map(function(root, i){
            return <Item title={root.title}
                         note={root.note}
                         children={root.children}
                         serial={root.serial}
                         key={root.serial}
                         collapsed={root.collapsed}
                         collapse={this.collapse}/>;
        }.bind(this));
    },
    render: function(){
        return (
            <div className="MAGNOLIAL">
                {this.renderRoots()}
            </div>
        );
    }
});

module.exports = Magnolial;

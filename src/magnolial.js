var React = require('react');

var Item = require('./item');

var Magnolial = React.createClass({
    getInitialState() {
        return {
            roots: [],
            nextSerial: 0,
            focus: null,
            allFocus: false
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
        var process = function (child, parentSerial){
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

            child.parentSerial = parentSerial;
            child.serial = serial;
            node_hash[serial] = child;
            serial += 1;
            for (var i=0; i < child.children.length; i++){
                process(child.children[i], child.serial);
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
    setTitle: function (serial, title){
        this.state.node_hash[serial].title = title;
        this.setState({
            roots: this.state.roots
        });
    },
    newItemBelow: function (serial){
        var child = this.state.node_hash[serial];
        if (child.parentSerial === undefined){
            var siblings = this.state.roots;
        } else {
            var siblings = this.state.node_hash[child.parentSerial].children;
        }
        var childIdx = siblings.indexOf(child);
        var newItem = {
            title: '',
            collapsed: false,
            note: '',
            serial: this.state.nextSerial,
            parentSerial: child.parentSerial,
            children: []
        }
        siblings.splice(childIdx + 1, 0, newItem);
        this.state.node_hash[this.state.nextSerial] = newItem;
        this.setState({
            roots: this.state.roots,
            node_hash: this.state.node_hash,
            focus: this.state.nextSerial,
            nextSerial: this.state.nextSerial + 1
        });
    },
    deleteItem: function (serial){
        var child = this.state.node_hash[serial];
        if (child.parentSerial === undefined){
            var siblings = this.state.roots;
        } else {
            var siblings = this.state.node_hash[child.parentSerial].children;
        }
        var childIdx = siblings.indexOf(child);
        if (child.parentSerial === undefined && childIdx === 0){
            return false;
        }
        siblings.splice(childIdx, 1);
        delete this.state.node_hash[serial];

        this.setState({
            roots: this.state.roots,
            node_hash: this.state.node_hash
        });

        if (childIdx <= 0){
            this.setFocus(child.parentSerial);
        } else {
            var upperSib = siblings[childIdx - 1];
            this.setFocus(upperSib.serial);
        }
        return true;
    },
    indentItem: function (serial){ // move to end of children of upper sibling
        var child = this.state.node_hash[serial];
        if (child.parentSerial === undefined){
            var siblings = this.state.roots;
        } else {
            var siblings = this.state.node_hash[child.parentSerial].children;
        }
        var childIdx = siblings.indexOf(child);
        if (childIdx <= 0){
            return false;
        }
        var upperSib = siblings[childIdx - 1];
        upperSib.children.push(child);
        upperSib.collapsed = false;
        child.parentSerial = upperSib.serial;
        siblings.splice(childIdx, 1);
        this.setState({roots: this.state.roots});
        return true;
    },
    outdentItem: function (serial){ // move to below parent
        var child = this.state.node_hash[serial];
        if (child.parentSerial === undefined){
            return false;
        }
        var parent = this.state.node_hash[child.parentSerial];
        if (parent.parentSerial === undefined){
            var parentSiblings = this.state.roots;
        } else {
            var parentSiblings = this.state.node_hash[parent.parentSerial].children;
        }
        var parentIdx = parentSiblings.indexOf(parent);
        parentSiblings.splice(parentIdx+1, 0, child);
        child.parentSerial = parent.parentSerial;
        parent.children.splice(parent.children.indexOf(child), 1);
        this.setState({roots: this.state.roots});
        return true;
    },
    moveItemUp: function (serial){ // move to above upper sibling
        var child = this.state.node_hash[serial];
        if (child.parentSerial === undefined){
            var siblings = this.state.roots;
        } else {
            var siblings = this.state.node_hash[child.parentSerial].children;
        }
        var childIdx = siblings.indexOf(child);
        if (childIdx <= 0){
            return false;
        }
        siblings.splice(childIdx, 1);
        siblings.splice(childIdx-1, 0, child);
        this.setState({roots: this.state.roots});
        return true;
    },
    moveItemDown: function (serial){ // move to below lower sibling
        var child = this.state.node_hash[serial];
        if (child.parentSerial === undefined){
            var siblings = this.state.roots;
        } else {
            var siblings = this.state.node_hash[child.parentSerial].children;
        }
        var childIdx = siblings.indexOf(child);
        if (childIdx == siblings.length-1){
            return false;
        }
        siblings.splice(childIdx, 1);
        siblings.splice(childIdx+1, 0, child);
        this.setState({roots: this.state.roots});
        return true;
    },
    setFocus: function (serial){
        if (serial !== null){
            this.state.node_hash[serial].collapsed = false;
        }
        this.setState({
            roots: this.state.roots,
            focus: serial
        });
    },
    onFocus: function(e){
        this.setState({allFocus: true});
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
                         focus={this.state.focus}
                         allFocus={this.state.allFocus}
                         collapse={this.collapse}
                         newItemBelow={this.newItemBelow}
                         deleteItem={this.deleteItem}
                         indentItem={this.indentItem}
                         outdentItem={this.outdentItem}
                         moveItemDown={this.moveItemDown}
                         moveItemUp={this.moveItemUp}
                         setFocus={this.setFocus}
                         setTitle={this.setTitle}/>;

        }.bind(this));
    },
    render: function(){
        return (
            <div className="MAGNOLIAL" onBlur={this.onBlur} onFocus={this.onFocus}>
                {this.renderRoots()}
            </div>
        );
    }
});

module.exports = Magnolial;

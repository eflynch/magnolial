var React = require('react');

var Item = require('./item');

var readFromFile = function (filename){
    if (fs === null || fs === undefined){return;}
    return JSON.parse(fs.readFileSync(filename, 'utf8'));
}

var writeToFile = function (filename, obj){
    if (fs === null || fs === undefined){return;}
    fs.writeFile(filename, JSON.stringify(obj)); 
}

var makeSerial = function(size) {
    var num, possible, text;
    if (size == null) {
        size = 5;
    }
    possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    text = (function() {
        var _i, _results;
        _results = [];
        for (num = _i = 1; 1 <= size ? _i <= size : _i >= size; num = 1 <= size ? ++_i : --_i) {
            _results.push(possible.charAt(Math.floor(Math.random() * possible.length)));
        }
        return _results;
    })();
    return text.join();
};

var Magnolial = React.createClass({displayName: "Magnolial",
    getInitialState() {
        return {
            root: {},
            headSerial: null,
            focus: null,
            allFocus: false
        };
    },
    componentWillMount() {
        if (this.props.hasOwnProperty('initRoot')){
            this.initializeTree(this.props.initRoot);
        } else {
            this.initializeTree({childs:[{}]});
        }
    },
    componentWillReceiveProps(nextProps) {
        if (nextProps.hasOwnProperty('initRoot')){
            this.initializeTree(nextProps.initRoot);
        }  
    },
    openFile: function (){
        if (remote === null || remote === undefined){return;}
        var dialog = remote.require('dialog');
        dialog.showOpenDialog(function (fileNames){
            if (fileNames.length){
                var root = readFromFile(fileNames[0]);
                this.initializeTree(root);
            }
        }.bind(this));
    },
    saveFile: function (){
        if (remote === null || remote === undefined){return;}
        var dialog = remote.require('dialog');
        dialog.showSaveDialog(function (fileName){
            writeToFile(fileName, this.state.root);
        }.bind(this));
    },
    initializeTree: function (root){
        // add serials and missing fields
        var node_hash = {};
        var formatChild = function (child, parentSerial){
            if (child.title === undefined){
                child.title = "";
            }
            if (child.note === undefined){
                child.note = "";
            }
            if (child.childs === undefined){
                child.childs = [];
            }
            if (child.collapsed === undefined){
                child.collapsed = false;
            }

            child.parentSerial = parentSerial;
            child.serial = makeSerial();
            node_hash[child.serial] = child;
            for (var i=0; i < child.childs.length; i++){
                formatChild(child.childs[i], child.serial);
            }
        };
        formatChild(root);

        this.setState({
            root: root,
            node_hash: node_hash,
            headSerial: root.serial
        });
    },
    collapse: function (serial, state){
        this.state.node_hash[serial].collapsed = state;
        this.setState({
            root: this.state.root
        });
    },
    setHead: function (serial){
        this.setState({
            headSerial: serial
        });
    },
    setHeadBack: function (serial){
        if (this.state.headSerial === this.state.root.serial){
            return false;
        }
        var child = this.state.node_hash[this.state.headSerial];
        this.setState({
            headSerial: child.parentSerial
        });
    },
    setTitle: function (serial, title){
        this.state.node_hash[serial].title = title;
        this.setState({
            root: this.state.root
        });
    },
    newItemBelow: function (serial){
        var child = this.state.node_hash[serial];
        var siblings = this.state.node_hash[child.parentSerial].childs;
        var childIdx = siblings.indexOf(child);
        var newItem = {
            title: '',
            collapsed: false,
            note: '',
            serial: makeSerial(),
            parentSerial: child.parentSerial,
            childs: []
        }
        siblings.splice(childIdx + 1, 0, newItem);
        this.state.node_hash[newItem.serial] = newItem;
        this.setState({
            root: this.state.root,
            node_hash: this.state.node_hash,
            focus: newItem.serial
        });
    },
    deleteItem: function (serial){
        var child = this.state.node_hash[serial];
        var siblings = this.state.node_hash[child.parentSerial].childs;
        var childIdx = siblings.indexOf(child);
        if (child.parentSerial === this.state.headSerial && this.state.node_hash[this.state.headSerial].childs.length <= 1){
            return false;
        }
        siblings.splice(childIdx, 1);
        delete this.state.node_hash[serial];

        this.setState({
            root: this.state.root,
            node_hash: this.state.node_hash
        });

        if (childIdx <= 0){
            if (child.parentSerial === this.state.headSerial){
                this.setFocus(siblings[childIdx].serial);
            } else {
                this.setFocus(child.parentSerial);
            }
        } else {
            var upperSib = siblings[childIdx - 1];
            var getNewFocus = function (sib){
                if (sib.collapsed || sib.childs.length === 0){
                    return sib.serial;
                }
                return getNewFocus(sib.childs[sib.childs.length-1]);
            }
            this.setFocus(getNewFocus(upperSib));
        }
        return true;
    },
    indentItem: function (serial){ // move to end of childs of upper sibling
        var child = this.state.node_hash[serial];
        var siblings = this.state.node_hash[child.parentSerial].childs;
        var childIdx = siblings.indexOf(child);
        if (childIdx <= 0){
            return false;
        }
        var upperSib = siblings[childIdx - 1];
        upperSib.childs.push(child);
        upperSib.collapsed = false;
        child.parentSerial = upperSib.serial;
        siblings.splice(childIdx, 1);
        this.setState({root: this.state.root});
        return true;
    },
    outdentItem: function (serial){ // move to below parent
        var child = this.state.node_hash[serial];
        if (child.parentSerial === this.state.headSerial){
            return false;
        }
        var parent = this.state.node_hash[child.parentSerial];
        var parentSiblings = this.state.node_hash[parent.parentSerial].childs;
        var parentIdx = parentSiblings.indexOf(parent);
        parentSiblings.splice(parentIdx+1, 0, child);
        child.parentSerial = parent.parentSerial;
        parent.childs.splice(parent.childs.indexOf(child), 1);
        this.setState({root: this.state.root});
        return true;
    },
    moveItemUp: function (serial){ // move to above upper sibling
        var child = this.state.node_hash[serial];
        var siblings = this.state.node_hash[child.parentSerial].childs;
        var childIdx = siblings.indexOf(child);
        if (childIdx <= 0){
            return false;
        }
        siblings.splice(childIdx, 1);
        siblings.splice(childIdx-1, 0, child);
        this.setState({root: this.state.root});
        return true;
    },
    moveItemDown: function (serial){ // move to below lower sibling
        var child = this.state.node_hash[serial];
        var siblings = this.state.node_hash[child.parentSerial].childs;
        var childIdx = siblings.indexOf(child);
        if (childIdx == siblings.length-1){
            return false;
        }
        siblings.splice(childIdx, 1);
        siblings.splice(childIdx+1, 0, child);
        this.setState({root: this.state.root});
        return true;
    },
    setFocusUp: function (serial){
        var child = this.state.node_hash[serial];
        var siblings = this.state.node_hash[child.parentSerial].childs;
        var childIdx = siblings.indexOf(child);
        if (child.parentSerial === this.state.headSerial && childIdx === 0){
            return false;
        }
        if (childIdx <= 0){
            this.setFocus(child.parentSerial);
        } else {
            var upperSib = siblings[childIdx - 1];
            var getNewFocus = function (sib){
                if (sib.collapsed || sib.childs.length === 0){
                    return sib.serial;
                }
                return getNewFocus(sib.childs[sib.childs.length-1]);
            }
            this.setFocus(getNewFocus(upperSib));
        }
        return true;
    },
    setFocusDown: function (serial){
        var child = this.state.node_hash[serial];
        if (!child.collapsed && child.childs.length){
            this.setState({focus: child.childs[0].serial});
            return true;
        }

        var siblings = this.state.node_hash[child.parentSerial].childs;
       
        var childIdx = siblings.indexOf(child);
        if (childIdx < siblings.length - 1){
            this.setState({focus: siblings[childIdx + 1].serial});
            return true;
        }

        if (child.parentSerial === this.state.headSerial){
            return false;
        }

        var parent = this.state.node_hash[child.parentSerial];
        var getNewFocus = function (parent){
            // If parent has lower sibling return that
            if (parent.parentSerial === this.state.headSerial){
                var siblings = this.state.node_hash[this.state.headSerial].childs;
            } else {
                var siblings = this.state.node_hash[parent.parentSerial].childs;
            }
            var parentIdx = siblings.indexOf(parent);
            if (parentIdx < siblings.length - 1){
                return siblings[parentIdx + 1].serial;
            }

            if (parent.parentSerial === this.state.headSerial){
                return undefined;
            }

            return getNewFocus(this.state.node_hash[parent.parentSerial]);
        }.bind(this);

        var focus = getNewFocus(parent)
        if (focus === undefined){
            return false;
        }
        this.setState({focus: focus});

        return true;
    },
    expandAllParents: function (child){
        if (child.parentSerial === this.state.headSerial || child.parentSerial === undefined){
            return;
        }
        var parent = this.state.node_hash[child.parentSerial];
        parent.collapsed = false;
        return this.expandAllParents(parent.serial);
    },
    getParentList: function (child){
        if (child.parentSerial === undefined){
            return [];
        }
        if (child.parentSerial === this.state.root.serial){
            return [this.state.root];
        }
        var parent = this.state.node_hash[child.parentSerial];
        var parents = this.getParentList(parent);
        parents.push(parent);
        return parents;
    },
    setFocus: function (serial){
        if (serial !== null){
            var child = this.state.node_hash[serial];
            this.expandAllParents(child);
        }
        this.setState({
            root: this.state.root,
            focus: serial
        });
    },
    onFocus: function(e){
        this.setState({allFocus: true});
    },
    renderroot: function (){
        var head = this.state.node_hash[this.state.headSerial];
        var items = head.childs.map(function(root, i){
            return React.createElement(Item, {title: root.title, 
                         note: root.note, 
                         childs: root.childs, 
                         serial: root.serial, 
                         key: root.serial, 
                         collapsed: root.collapsed, 
                         focus: this.state.focus, 
                         allFocus: this.state.allFocus, 
                         collapse: this.collapse, 
                         newItemBelow: this.newItemBelow, 
                         deleteItem: this.deleteItem, 
                         indentItem: this.indentItem, 
                         outdentItem: this.outdentItem, 
                         moveItemDown: this.moveItemDown, 
                         moveItemUp: this.moveItemUp, 
                         setHead: this.setHead, 
                         setHeadBack: this.setHeadBack, 
                         setFocus: this.setFocus, 
                         setFocusDown: this.setFocusDown, 
                         setFocusUp: this.setFocusUp, 
                         setTitle: this.setTitle});

        }.bind(this));

        var parentList = this.getParentList(head);
        var breadcrumbs = parentList.map(function(parent){
            var onClick = function (e){
                this.setHead(parent.serial);
                this.setFocus(parent.serial);
            }.bind(this);
            return (
                React.createElement("span", {key: parent.serial}, 
                    React.createElement("span", {className: "MAGNOLIAL_breadcrumb", onClick: onClick}, 
                        parent.title || '...'
                    ), 
                    React.createElement("span", {className: "MAGNOLIAL_breadcrumb_sym"}, "‣")
                )
            );
        }.bind(this));
        return (
            React.createElement("div", null, 
                React.createElement("h3", null, 
                    breadcrumbs
                ), 
                React.createElement("h2", null, 
                    React.createElement("input", {value: head.title, onChange: function (e){
                            this.setTitle(this.state.headSerial, e.currentTarget.value);
                        }.bind(this)})
                ), 
                React.createElement("p", null, head.note), 

                items
            )
        );
    },
    onKeyDown: function (e){
        if (e.keyCode === 83 && e.metaKey){
            e.preventDefault();
            this.saveFile();
        }
        if (e.keyCode === 79 && e.metaKey){
            e.preventDefault();
            this.openFile();
        }
    },
    render: function(){
        return (
            React.createElement("div", {className: "MAGNOLIAL", onBlur: this.onBlur, onFocus: this.onFocus, onKeyDown: this.onKeyDown}, 
                this.renderroot()
            )
        );
    }
});

module.exports = Magnolial;

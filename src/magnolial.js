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



var Magnolial = React.createClass({
    getInitialState() {
        return {
            root: {},
            headSerial: 0,
            nextSerial: 1,
            focus: null,
            allFocus: false
        };
    },
    componentWillMount() {
        if (this.props.hasOwnProperty('initRoot')){
            this.initializeTree(this.props.initRoot);
        } else {
            this.initializeTree({children:[{}]});
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
        process(root);

        this.setState({
            root: root,
            node_hash: node_hash,
            nextSerial: serial
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
        if (this.state.headSerial === 0){
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
        var siblings = this.state.node_hash[child.parentSerial].children;
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
            root: this.state.root,
            node_hash: this.state.node_hash,
            focus: this.state.nextSerial,
            nextSerial: this.state.nextSerial + 1
        });
    },
    deleteItem: function (serial){
        var child = this.state.node_hash[serial];
        var siblings = this.state.node_hash[child.parentSerial].children;
        var childIdx = siblings.indexOf(child);
        if (child.parentSerial === this.state.headSerial && this.state.node_hash[this.state.headSerial].children.length <= 1){
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
                if (sib.collapsed || sib.children.length === 0){
                    return sib.serial;
                }
                return getNewFocus(sib.children[sib.children.length-1]);
            }
            this.setFocus(getNewFocus(upperSib));
        }
        return true;
    },
    indentItem: function (serial){ // move to end of children of upper sibling
        var child = this.state.node_hash[serial];
        var siblings = this.state.node_hash[child.parentSerial].children;
        var childIdx = siblings.indexOf(child);
        if (childIdx <= 0){
            return false;
        }
        var upperSib = siblings[childIdx - 1];
        upperSib.children.push(child);
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
        var parentSiblings = this.state.node_hash[parent.parentSerial].children;
        var parentIdx = parentSiblings.indexOf(parent);
        parentSiblings.splice(parentIdx+1, 0, child);
        child.parentSerial = parent.parentSerial;
        parent.children.splice(parent.children.indexOf(child), 1);
        this.setState({root: this.state.root});
        return true;
    },
    moveItemUp: function (serial){ // move to above upper sibling
        var child = this.state.node_hash[serial];
        var siblings = this.state.node_hash[child.parentSerial].children;
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
        var siblings = this.state.node_hash[child.parentSerial].children;
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
        var siblings = this.state.node_hash[child.parentSerial].children;
        var childIdx = siblings.indexOf(child);
        if (child.parentSerial === this.state.headSerial && childIdx === 0){
            return false;
        }
        if (childIdx <= 0){
            this.setFocus(child.parentSerial);
        } else {
            var upperSib = siblings[childIdx - 1];
            var getNewFocus = function (sib){
                if (sib.collapsed || sib.children.length === 0){
                    return sib.serial;
                }
                return getNewFocus(sib.children[sib.children.length-1]);
            }
            this.setFocus(getNewFocus(upperSib));
        }
        return true;
    },
    setFocusDown: function (serial){
        var child = this.state.node_hash[serial];
        if (!child.collapsed && child.children.length){
            this.setState({focus: child.children[0].serial});
            return true;
        }

        var siblings = this.state.node_hash[child.parentSerial].children;
       
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
                var siblings = this.state.node_hash[this.state.headSerial].children;
            } else {
                var siblings = this.state.node_hash[parent.parentSerial].children;
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
        if (child.parentSerial === 0){
            return [];
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
        var items = head.children.map(function(root, i){
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
                         setHead={this.setHead}
                         setHeadBack={this.setHeadBack}
                         setFocus={this.setFocus}
                         setFocusDown={this.setFocusDown}
                         setFocusUp={this.setFocusUp}
                         setTitle={this.setTitle}/>;

        }.bind(this));
        if (this.state.headSerial === 0){
            return items;
        }

        var parentList = this.getParentList(head);
        var breadcrumbs = parentList.map(function(parent){
            var onClick = function (e){
                this.setHead(parent.serial);
                this.setFocus(parent.serial);
            }.bind(this);
            return (
                <span key={parent.serial}>
                    <span className="MAGNOLIAL_breadcrumb" onClick={onClick}>
                        {parent.title}
                    </span>
                    <span className="MAGNOLIAL_breadcrumb_sym">‣</span> 
                </span>
            );
        }.bind(this));
        return (
            <div>
                <h2>
                    <span className="MAGNOLIAL_breadcrumb" onClick={function(){
                        this.setHead(0);
                        this.setFocus(0);
                    }.bind(this)}>
                        home
                    </span>
                    <span className="MAGNOLIAL_breadcrumb_sym">‣</span> 
                    {breadcrumbs}
                    <input value={head.title} onChange={function (e){
                        this.setTitle(this.state.headSerial, e.currentTarget.value);
                    }.bind(this)}/>
                </h2>
                <p>{head.note}</p>

                {items}
            </div>
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
            <div className="MAGNOLIAL" onBlur={this.onBlur} onFocus={this.onFocus} onKeyDown={this.onKeyDown}>
                {this.renderroot()}
            </div>
        );
    }
});

module.exports = Magnolial;

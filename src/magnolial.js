var React = require('react');
var rb = require('react-bootstrap');

var Item = require('./item');
var Breadcrumbs = require('./breadcrumbs');
var FocusTitle = require('./focus-title');

var ImmutableTree = require('./immutable-tree');

var Magnolial = React.createClass({
    getInitialState() {
        return {
            root: {},
            headSerial: null,
            focusSerial: null,
            allFocus: false
        };
    },
    getDefaultProps() {
        return {
            initRoot: {childs:[{}]},
            onUpdate: function (){},
        };
    },
    componentWillMount() {
        if (this.props.hasOwnProperty('initRoot')){
            this.initRoot(this.props.initRoot);
        }
        if (this.props.hasOwnProperty('initHead')){
            this.setState({headSerial: this.props.initHead});
        }
        if (this.props.hasOwnProperty('initFocus')){
            this.setState({focusSerial: this.props.initFocus});
        }
    },
    componentWillReceiveProps(nextProps) {
        if (nextProps.hasOwnProperty('initRoot')){
            this.initRoot(nextProps.initRoot);
        }
        if (nextProps.hasOwnProperty('initHead')){
            this.setState({headSerial: nextProps.initHead});
        }
        if (nextProps.hasOwnProperty('initFocus')){
            this.setState({focusSerial: nextProps.initFocus});
        }
    },
    initRoot: function (initRoot){
        this.t = new ImmutableTree(initRoot, function (root){
            this.props.onUpdate(root, this.state.headSerial, this.state.focusSerial);
            this.setState({root: root});
        }.bind(this));
        this.setState({
            root: this.t.getRoot(),
            headSerial: this.t.getRoot()._serial,
            focusSerial: this.t.getRoot()._serial
        });
    },
    // Mutators
    setValue: function (child, value){
        return this.t.setValue(child, value);
    },
    setCollapsed: function (child, state){
        return this.t.setCollapsed(child, state);
    },
    keyDownHandler: function (e, child){
        if (e.keyCode === 32){ // Spacebar
            if (e.shiftKey){
                e.preventDefault();
                this.t.setCollapsed(child, !child.collapsed);
            }
        }
        if (e.key === 'Tab'){
            e.preventDefault();
            if (e.shiftKey){
                this.t.outdentItem(child);
            } else {
                this.t.indentItem(child);
            }
        }
        if (e.key === 'ArrowRight'){
            if (e.shiftKey){
                e.preventDefault();
                this.t.indentItem(child); 
            }
        }
        if (e.key === 'ArrowLeft'){
            if (e.shiftKey){
                e.preventDefault();
                this.t.outdentItem(child); 
            }
        }
        if (e.key === 'ArrowUp'){
            e.preventDefault();
            if (e.shiftKey){
                this.t.moveItemUp(child);
            } else {
                this.setFocus(this.t.predOf(child));
            }
        }
        if (e.key === 'ArrowDown'){
            e.preventDefault();
            if (e.shiftKey){
                if (!this.t.moveItemDown(child)){
                    this.t.indentItem(child);
                }
            } else {
                this.setFocus(this.t.succOf(child));
            }
        }
        if (e.key === 'Enter'){
            if (e.shiftKey){
                return;
            }
            e.preventDefault();
            if (child.value === ''){
                if (!this.t.outdentItem(child)){
                    this.setFocus(this.t.newItemBelow(child));
                }
            } else {
                this.setFocus(this.t.newItemBelow(child));
            }
        }
        if (e.key === 'Escape'){
            e.preventDefault();
            if (e.shiftKey){
                if (child.childs.length > 0){
                    this.setHead(child);
                    this.setFocus(child.childs[0]);
                }
            } else {
                if (child === this.state.root || this.t.parentOf(child) === this.state.root){
                    return;
                }
                this.setHead(this.t.parentOf(this.t.parentOf(child)));
            }
        }
        if (e.key === 'Backspace'){
            if (e.shiftKey){
                e.preventDefault();
                this.setFocus(this.t.predOf(child));
                this.t.deleteItem(child);
            } else {
                if (child.value === '' && child.childs.length === 0){
                    e.preventDefault();
                    this.setFocus(this.t.predOf(child));
                    this.t.deleteItem(child);
                }
            }
            
        }
    },

    // Focus Relevant (internal state)
    setHead: function (child){
        this.props.onUpdate(this.state.root, child._serial, this.state.focusSerial);
        this.setState({
            headSerial: child._serial
        });
    },
    setFocus: function (child){
        if (child === undefined){
            return;
        }
        this.props.onUpdate(this.state.root, this.state.headSerial, child._serial);
        this.setState({
            focusSerial: child._serial
        });
    },

    onFocus: function(e){
        this.setState({allFocus: true});
    },

    // Render
    render: function (){
        var head = this.t.node_hash[this.state.headSerial];
        var focus = this.t.node_hash[this.state.focusSerial];
        var items = head.childs.map(function(child, i){
            return <Item root={child}
                         key={child._serial}
                         focus={focus}
                         focusAncestors={this.t.ancestorsOf(focus)}
                         allFocus={this.state.allFocus}
                         setFocus={this.setFocus}
                         keyDownHandler={this.keyDownHandler}
                         setCollapsed={this.setCollapsed}
                         setValue={this.setValue}/>;

        }.bind(this));
        return (
            <rb.Grid className="MAGNOLIAL" onBlur={this.onBlur} onFocus={this.onFocus} onKeyDown={this.onKeyDown}>
                <rb.Row>
                    <rb.Col xs={12} lg={12}>
                        <Breadcrumbs setHead={this.setHead} setFocus={this.setFocus} ancestors={this.t.ancestorsOf(head)}/>
                    </rb.Col>
                </rb.Row>
                <rb.Row>
                    <rb.Col xs={12} lg={12}>
                        <FocusTitle setValue={this.setValue} setFocus={this.setFocus} focus={focus} head={head} keyDownHandler={this.keyDownHandler}/>
                    </rb.Col>
                </rb.Row>
                <rb.Row>
                    <rb.Col xs={12} lg={12}>
                        {items}
                    </rb.Col>
                </rb.Row>
            </rb.Grid>
        );
    }
});

module.exports = {
    Magnolial: Magnolial,
    ImmutableTree: ImmutableTree
}

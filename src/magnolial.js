var React = require('react');
var rb = require('react-bootstrap');

var Item = require('./item');
var Breadcrumbs = require('./breadcrumbs');
var FocusTitle = require('./focus-title');

var ImmutableTree = require('./immutable-tree');

var Magnolial = React.createClass({
    getInitialState() {
        return {
            trunk: {},
            headSerial: null,
            focusSerial: null,
            MODE: 'vim-default'
        };
    },
    getDefaultProps() {
        return {
            initTrunk: {childs:[{}]},
            onUpdate: function (){},
        };
    },
    componentWillMount() {
        if (this.props.hasOwnProperty('initTrunk')){
            this.initTrunk(this.props.initTrunk);
        }
        if (this.props.hasOwnProperty('initHead')){
            this.setState({headSerial: this.props.initHead});
        }
        if (this.props.hasOwnProperty('initFocus')){
            this.setState({focusSerial: this.props.initFocus});
        }
    },
    componentWillReceiveProps(nextProps) {
        if (nextProps.hasOwnProperty('initTrunk')){
            this.initTrunk(nextProps.initTrunk);
        }
        if (nextProps.hasOwnProperty('initHead')){
            this.setState({headSerial: nextProps.initHead});
        }
        if (nextProps.hasOwnProperty('initFocus')){
            this.setState({focusSerial: nextProps.initFocus});
        }
    },
    initTrunk: function (initTrunk){
        this.t = new ImmutableTree(initTrunk, function (trunk){
            this.props.onUpdate(trunk, this.state.headSerial, this.state.focusSerial);
            this.setState({trunk: trunk});
        }.bind(this));
        this.setState({
            trunk: this.t.getTrunk(),
            headSerial: this.t.getTrunk()._serial,
            focusSerial: this.t.getTrunk()._serial
        });
    },
    // Mutators
    setValue: function (child, value){
        return this.t.setValue(child, value);
    },
    setCollapsed: function (child, state){
        return this.t.setCollapsed(child, state);
    },
    setCompleted: function (child, state){
        return this.t.setCompleted(child, state);
    },
    keyDownHandler: function (e, child){
        switch (this.state.MODE){
            case 'vim-default':
                this.keyDownVimDefault(e, child);
                break;
            case 'vim-input':
                this.keyDownVimInput(e, child);
                break;
            case 'standard':
                this.keyDownStandard(e, child);
                break;
            default:
                this.keyDownStandard(e, child);
                break;
        }
        this.keyDownCommon(e, child);
    },
    keyDownCommon(e, child){
        if (e.key === 'Backspace'){
            if (e.shiftKey){
                e.preventDefault();
                this.setFocus(this.t.prefOf(child));
                this.t.deleteItem(child);
            } else {
                if (child.value === '' && child.childs.length === 0){
                    e.preventDefault();
                    this.setFocus(this.t.predOf(child));
                    this.t.deleteItem(child);
                }
            }
        }
        if (e.key === 'Enter'){
            if (e.shiftKey){
                return;
            }
            e.preventDefault();
            if (e.metaKey){
                this.setCompleted(child, !child.completed);
                return;
            }
            if (child.value === ''){
                if (!this.t.outdentItem(child)){
                    this.setFocus(this.t.newItemBelow(child));
                }
            } else {
                this.setFocus(this.t.newItemBelow(child));
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
    },
    keyDownVimDefault: function (e, child){
        e.preventDefault();
        if (e.keyCode === 72){ // h
            if (e.shiftKey){
                this.t.outdentItem(child); 
            }
        }
        if (e.keyCode === 74){ // j
            if (e.shiftKey){
                if (!this.t.moveItemDown(child)){
                    this.t.indentItem(child);
                }
            } else {
                this.setFocus(this.t.succOf(child));
            }
        }
        if (e.keyCode === 75){ // k
            if (e.shiftKey){
                this.t.moveItemUp(child);
            } else {
                this.setFocus(this.t.predOf(child));
            }
        }
        if (e.keyCode === 76){ // l
            if (e.shiftKey){
                this.t.indentItem(child); 
            }
        }
        if (e.keyCode === 79){ // o
            if (e.shiftKey){
                this.setFocus(this.t.newItemBelow(this.t.predOf(child)));
            } else {
                this.setFocus(this.t.newItemBelow(child));
            }
        }
        if (e.keyCode === 81){ // q
            this.exit();
        }
        if (e.keyCode === 85){ // u
            this.t.undo();
        }
        if (e.keyCode === 82){ // r
            this.t.redo();
        }
        if (e.keyCode === 73){ // i
            this.setState({MODE: 'vim-input'});
        }
        if (e.keyCode === 65){ // a
        }
        if (e.keyCode === 88){ // x
            this.setCompleted(child, !child.completed);
        }
        if (e.keyCode === 68){ // d
            this.setFocus(this.t.predOf(child));
            this.t.deleteItem(child);
        }
        if (e.keyCode === 32){ // space
            this.setCollapsed(child, !child.collapsed);
        }
        if (e.keyCode === 190){ // >
            if (child.childs.length > 0){
                this.setHead(child);
                this.setFocus(child.childs[0]);
            } 
        }
        if (e.keyCode === 188){ // <
            var head = this.t.node_hash[this.state.headSerial];
            if (head === this.state.trunk){
                return;
            }
            this.setHead(this.t.parentOf(head));
            this.setFocus(this.t.parentOf(head));
        }
    },
    keyDownVimInput: function (e, child){
        if (e.key === 'Escape'){
            e.preventDefault();
            this.setState({MODE: 'vim-default'});
        }
    },
    keyDownStandard: function (e, child){
        if (e.keyCode === 32){ // Spacebar
            if (e.shiftKey){
                e.preventDefault();
                this.setCollapsed(child, !child.collapsed);
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
                var head = this.t.node_hash[this.state.headSerial];
                if (head === this.state.trunk){
                    return;
                }
                this.setHead(this.t.parentOf(head));
                this.setFocus(this.t.parentOf(head));
            }
        }
    },

    // Focus Relevant (internal state)
    setHead: function (child){
        this.props.onUpdate(this.state.trunk, child._serial, this.state.focusSerial);
        this.t.setCollapsed(child, false);
        this.setState({
            headSerial: child._serial
        });
    },
    setFocus: function (child){
        if (child === undefined){
            return;
        }
        this.props.onUpdate(this.state.trunk, this.state.headSerial, child._serial);
        this.setState({
            focusSerial: child._serial
        });
    },
    exit: function (){
        this.props.onBlur({relatedTarget: null});
    },
    onBlur: function(e){
        this.setState({focusSerial: null});
        this.props.onBlur(e);
    },
    // Render
    render: function (){
        var head = this.t.node_hash[this.state.headSerial];
        var focus = this.t.node_hash[this.state.focusSerial];
        var items = head.childs.map(function(child, i){
            return <Item trunk={child}
                         key={child._serial}
                         focus={focus}
                         focusAncestors={this.t.ancestorsOf(focus)}
                         setHead={this.setHead}
                         setFocus={this.setFocus}
                         keyDownHandler={this.keyDownHandler}
                         setCollapsed={this.setCollapsed}
                         entryEnabled={this.state.MODE !== 'vim-default'}
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

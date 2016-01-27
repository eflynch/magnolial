var React = require('react');
var ReactDOM = require('react-dom');

var Title = React.createClass({
    componentDidMount() {
        this.componentDidUpdate();
    },
    componentDidUpdate(prevProps, prevState) {
        if (this.props.allFocus && this.props.serial === this.props.focus){
            ReactDOM.findDOMNode(this.refs.input).focus();
        }
    },
    onBlur: function(e){
        if (this.props.allFocus && e.relatedTarget === null){
            this.props.setFocus(null);
        }
    },
    setTitle: function (e){
        this.props.setTitle(this.props.serial, e.currentTarget.value);
    },
    render: function (){
        return <input ref='input'
                      value={this.props.title}
                      onBlur={this.onBlur}
                      onChange={this.setTitle}/>;
    }
});

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
                         focus={this.props.focus}
                         allFocus={this.props.allFocus}
                         collapse={this.props.collapse}
                         newItemBelow={this.props.newItemBelow}
                         deleteItem={this.props.deleteItem}
                         indentItem={this.props.indentItem}
                         outdentItem={this.props.outdentItem}
                         moveItemDown={this.props.moveItemDown}
                         moveItemUp={this.props.moveItemUp}
                         setFocus={this.props.setFocus}
                         setTitle={this.props.setTitle}/>;
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
    onFocus: function (){
        this.props.setFocus(this.props.serial);
    },
    handleKeyDown: function (e){
        if (e.key === 'Tab'){
            e.preventDefault();
            if (e.shiftKey){
                this.props.outdentItem(this.props.serial);
            } else {
                this.props.indentItem(this.props.serial);
            }
        }
        if (e.key === 'ArrowUp'){
            e.preventDefault();
            if (e.shiftKey){
                this.props.moveItemUp(this.props.serial);
            } else {
            }
        }
        if (e.key === 'ArrowDown'){
            e.preventDefault();
            if (e.shiftKey){
                this.props.moveItemDown(this.props.serial);
            } else {
            }
        }
        if (e.key === 'Enter'){
            e.preventDefault();
            if (e.shiftKey){
                this.toggleCollapsed();
            } else {
                if (this.props.title === ''){
                    if (!this.props.outdentItem(this.props.serial)){
                        this.props.newItemBelow(this.props.serial);
                    }
                } else {
                    this.props.newItemBelow(this.props.serial);
                }
            }
        }
        if (e.key === 'Backspace'){
            if (this.props.title === '' && this.props.children.length === 0){

                e.preventDefault();
                this.props.deleteItem(this.props.serial);
            }
        }
    },
    render: function(){
        return (
            <li>
                <h1 onFocus={this.onFocus} onKeyDown={this.handleKeyDown}>
                    {this.renderDecoration()}
                    <Title title={this.props.title}
                           serial={this.props.serial}
                           setTitle={this.props.setTitle}
                           setFocus={this.props.setFocus}
                           focus={this.props.focus}
                           allFocus={this.props.allFocus}/>
                </h1>
                <p>{this.props.note}</p>
                <ul className={this.props.collapsed ? 'MAGNOLIAL_hidden' : ''}>
                    {this.genChildren()}
                </ul>
            </li>
        );
    }
});

module.exports = Item;

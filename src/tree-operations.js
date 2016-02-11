
function outdent(child){
    this.t.outdentItem(child);
}

function indent(child){
    this.t.indentItem(child); 
}

function moveDown(child){
    if(!this.t.moveItemUp(child)){
        this.t.indentItem(child);
    }
}

function focusUp(child){
    if (this.state.headSerial === child._serial){
        return;
    }
    this.setFocus(this.t.predOf(child));
}

function focusDown(child){
    this.setFocus(this.t.succOf(child));
}

function newBelow(child){
    if (child.value === ''){
        if (!this.t.outdentItem(child)){
            this.setFocus(this.t.newItemBelow(child));
        }
    } else {
        this.setFocus(this.t.newItemBelow(child));
    }
}

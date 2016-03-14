var update = require('react-addons-update');

class ImmutableTree {
    constructor(trunk, onMutate){
        this.undos = [trunk];
        this.redos = [];
        this.trunk = trunk;
        this.node_hash = ImmutableTree.formatTrunk(trunk);
        this.onMutate = onMutate || function (newTrunk){};
    }

    static makeEmptyTrunk(){
        return {
            childs: [{childs:[], collapsed: false, completed: false, value:""}],
            value: "",
            collapsed: false,
            completed: false
        }
    }

    static makeChild(parentSerial){
        return {
            value: '',
            collapsed: false,
            completed: false,
            _serial: ImmutableTree.makeSerial(),
            _parent: parentSerial,
            childs: []
        }
    }

    static makeSerial(size) {
        if (size == null) {
            size = 5;
        }
        var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var text = (function() {
            var results = [];
            for (var i=0; i < size; i++) {
                results.push(possible.charAt(Math.floor(Math.random() * possible.length)));
            }
            return results;
        })();
        return text.join('');
    }

    static formatTrunk(trunk){
        var node_hash = {};
        var formatChild = function (child, _parent){
            if (child.value === undefined){
                child.value = "";
            }
            if (child.childs === undefined){
                child.childs = [];
            }
            if (child.collapsed === undefined){
                child.collapsed = false;
            }
            if (child.completed === undefined){
                child.completed = false;
            }

            child._parent = _parent;
            child._serial = ImmutableTree.makeSerial();
            node_hash[child._serial] = child;
            for (var i=0; i < child.childs.length; i++){
                formatChild(child.childs[i], child._serial);
            }
        };
        formatChild(trunk, undefined);
        return node_hash;
    }

    _fixNodeHash(trunk){
        if (trunk === this.node_hash[trunk._serial]){
            return;
        }
        this.node_hash[trunk._serial] = trunk;
        for (var i=0; i < trunk.childs.length; i++){
            this._fixNodeHash(trunk.childs[i]);
        }
    }

    generateHash(target){
        var parents = this.ancestorsOf(target);
        parents.push(target);
        var hash = {};
        var iter = hash;
        var previousParent;
        for (var i=1; i < parents.length; i++){
            var previousParent = parents[i-1];
            var parent = parents[i];
            var parentIdx = previousParent.childs.indexOf(parent);
            var newHash = {};
            iter.childs = {
                [parentIdx]: newHash
            };
            iter = newHash;
        }
        return {
            hashTrunk: hash,
            target: iter
        };
    }

    applyHash(hash){
        var newTrunk = update(this.trunk, hash.hashTrunk);
        this._fixNodeHash(newTrunk);
        this.onMutate(newTrunk);
        if (this.undos.length > 10){
            this.undos.pop();
        }
        this.undos.unshift(this.trunk);
        this.redos = [];
        this.trunk = newTrunk;
    }

    undo(){
        if (this.undos.length){
            if (this.redos.length > 10){
                this.redos.pop();
            }
            this.redos.unshift(this.trunk);
            var newTrunk = this.undos.shift();
            this._fixNodeHash(newTrunk);
            this.onMutate(newTrunk);
            this.trunk = newTrunk;
        }
    }

    redo(){
        if (this.redos.length){
            var newTrunk = this.redos.shift();
            this._fixNodeHash(newTrunk);
            this.onMutate(newTrunk);
            if (this.undos.length > 10){
                this.undos.pop();
            }
            this.undos.unshift(this.trunk);
            this.trunk = newTrunk;
        }
    }

    ancestorsOf(target){
        if (target === undefined){
            return [];
        }
        var ancestors = [];
        var parent = this.parentOf(target);
        while (parent !== undefined){
            ancestors.unshift(parent);
            parent = this.parentOf(parent);
        }
        return ancestors;
    }

    parentOf(child){
        if (child._parent === undefined){
            return undefined;
        }
        return this.node_hash[child._parent];
    }

    predOf(child){
        if (child === this.trunk){
            return undefined;
        }
        if (this.indexOf(child) === 0){
            return this.parentOf(child);
        }
        var lowestOpenLeaf = function (trunk){
            if (trunk.collapsed || trunk.childs.length === 0){
                return trunk;
            }
            return lowestOpenLeaf(trunk.childs[trunk.childs.length - 1]);
        }
        return lowestOpenLeaf(this.parentOf(child).childs[this.indexOf(child) - 1]);

    }

    succOf(child){
        if (!child.collapsed && child.childs.length > 0){
            return child.childs[0];
        }

        var childIdx = this.indexOf(child);
        if (childIdx < this.parentOf(child).childs.length - 1){
            return this.parentOf(child).childs[childIdx + 1];
        }

        var findIt = function (trunk){
            if (trunk === this.trunk){
                return undefined;
            }
            var parent = this.parentOf(trunk);
            var childIdx = this.indexOf(trunk);
            if (childIdx < parent.childs.length - 1){
                return parent.childs[childIdx + 1];
            }

            return findIt(parent);
        }.bind(this);
        return findIt(this.parentOf(child));

    }

    indexOf(child){
        if (child._parent === undefined){return 0;}
        return this.parentOf(child).childs.indexOf(child);
    }

    getTrunk(){
        return this.trunk;
    }

    setCollapsed(child, state){
        var hash = this.generateHash(child);
        hash.target.collapsed = {$set: state};
        this.applyHash(hash);
    }

    setCompleted(child, state){
        var hash = this.generateHash(child);
        hash.target.completed = {$set: state};
        this.applyHash(hash);
    }

    setValue(child, value){
        if (child.value === value){return;}
        var hash = this.generateHash(child);
        hash.target.value = {$set: value};
        this.applyHash(hash);
    }

    newItemBelow(child){
        // Ignore if Trunk
        if (child === this.trunk){
            return false;
        }

        var childIdx = this.indexOf(child);
        var newItem = ImmutableTree.makeChild(child._parent);
        this.node_hash[newItem._serial] = newItem;
        var hash = this.generateHash(this.parentOf(child));
        hash.target.childs = {$splice: [[childIdx + 1, 0, newItem]]};
        this.applyHash(hash);
        return newItem;
    }

    newItemAbove(child){
        // Ignore if Trunk
        if (child === this.trunk){
            return false;
        }

        var childIdx = this.indexOf(child);
        var newItem = ImmutableTree.makeChild(child._parent);
        this.node_hash[newItem._serial] = newItem;
        var hash = this.generateHash(this.parentOf(child));
        hash.target.childs = {$splice: [[childIdx, 0, newItem]]};
        this.applyHash(hash);
        return newItem;
    }

    deleteItem(child){
        // Ignore if Trunk
        if (child === this.trunk){
            return false;
        }
        if (this.parentOf(child) === this.trunk && this.trunk.childs.length === 1){
            return false;
        }
        var childIdx = this.indexOf(child);

        var hash = this.generateHash(this.parentOf(child));
        hash.target.childs = {$splice: [[childIdx, 1]]};
        this.applyHash(hash);

        return true;
    }

    indentItem(child){
        // Ignore if Trunk
        if (child === this.trunk){
            return false;
        }
        // Ignore if First Child
        var childIdx = this.indexOf(child);
        if (childIdx === 0){
            return false;
        }

        var newChild = update(child, {_parent: {$set: this.parentOf(child).childs[childIdx - 1]._serial}});
        var hash = this.generateHash(this.parentOf(child));
        hash.target.childs = {
            $splice: [[childIdx,1]],
            [childIdx - 1]: {
                childs: {$push: [newChild]},
                collapsed: {$set: false}
            },
        };
        this.applyHash(hash);

        return true;
    }

    outdentItem(child){
        // Ignore if Trunk
        if (child === this.trunk){
            return false;
        }

        // Ignore if Child of Trunk
        if (this.parentOf(child) === this.trunk){
            return false;
        }

        var parentIdx = this.indexOf(this.parentOf(child));
        var childIdx = this.indexOf(child);

        var newChild = update(child, {_parent: {$set: this.parentOf(this.parentOf(child))._serial}});

        var hash = this.generateHash(this.parentOf(this.parentOf(child)));
        hash.target.childs = {
            $splice: [[parentIdx + 1, 0, newChild]],
            [parentIdx]: {
                childs: {$splice: [[childIdx,1]]}
            }
        };
        this.applyHash(hash);

        return true;
    }

    moveItemUp(child){
        // Ignore if Trunk
        if (child === this.trunk){
            return false;
        }

        var childIdx = this.indexOf(child);

        // Ignore if top Child
        if (childIdx === 0){
            return false;
        }

        var hash = this.generateHash(this.parentOf(child));
        hash.target.childs = {
            $splice: [[childIdx, 1], [childIdx - 1, 0, child]]
        }
        this.applyHash(hash);
        return true;
    }

    moveItemDown(child){
        // Ignore if Trunk
        if (child === this.trunk){
            return false;
        }

        var childIdx = this.indexOf(child);

        // Ignore if bottom Child
        if (childIdx === this.parentOf(child).childs.length - 1){
            return false;
        }

        var hash = this.generateHash(this.parentOf(child));
        hash.target.childs = {
            $splice: [[childIdx, 1], [childIdx + 1, 0, child]]
        }
        this.applyHash(hash);
        return true;
    }
}

module.exports = ImmutableTree;

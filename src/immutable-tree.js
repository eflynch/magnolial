var update = require('react-addons-update');

class ImmutableTree {
    constructor(root, onMutate){
        this.root = root;
        this.node_hash = ImmutableTree.formatRoot(root);
        this.onMutate = onMutate || function (){};
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

    static formatRoot(root){
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

            child._parent = _parent;
            child._serial = ImmutableTree.makeSerial();
            node_hash[child._serial] = child;
            for (var i=0; i < child.childs.length; i++){
                formatChild(child.childs[i], child._serial);
            }
        };
        formatChild(root, undefined);
        return node_hash;
    }

    _fixNodeHash(root){
        if (root === this.node_hash[root._serial]){
            return;
        }
        this.node_hash[root._serial] = root;
        for (var i=0; i < root.childs.length; i++){
            this._fixNodeHash(root.childs[i]);
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
            hashRoot: hash,
            target: iter
        };
    }

    applyHash(hash){
        var newRoot = update(this.root, hash.hashRoot);
        this._fixNodeHash(newRoot);
        this.onMutate(newRoot);
        this.root = newRoot;
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
        if (child === this.root){
            return undefined;
        }
        if (this.indexOf(child) === 0){
            return this.parentOf(child);
        }
        var lowestOpenLeaf = function (root){
            if (root.collapsed || root.childs.length === 0){
                return root;
            }
            return lowestOpenLeaf(root.childs[root.childs.length - 1]);
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

        var findIt = function (root){
            if (root === this.root){
                return undefined;
            }
            var parent = this.parentOf(root);
            var childIdx = this.indexOf(root);
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

    getRoot(){
        return this.root;
    }

    setCollapsed(child, state){
        var hash = this.generateHash(child);
        hash.target.collapsed = {$set: state};
        this.applyHash(hash);
    }

    setValue(child, value){
        var hash = this.generateHash(child);
        hash.target.value = {$set: value};
        this.applyHash(hash);
    }

    newItemBelow(child){
        // Ignore if Root
        if (child === this.root){
            return false;
        }

        var childIdx = this.indexOf(child);
        var newItem = {
            value: '',
            collapsed: false,
            _serial: ImmutableTree.makeSerial(),
            _parent: child._parent,
            childs: []
        }
        this.node_hash[newItem._serial] = newItem;
        var hash = this.generateHash(this.parentOf(child));
        hash.target.childs = {$splice: [[childIdx + 1, 0, newItem]]};
        this.applyHash(hash);
        return newItem;
    }

    deleteItem(child){
        // Ignore if Root
        if (child === this.root){
            return false;
        }
        if (this.parentOf(child) === this.root && this.root.childs.length === 1){
            return false;
        }
        var childIdx = this.indexOf(child);

        var hash = this.generateHash(this.parentOf(child));
        hash.target.childs = {$splice: [[childIdx, 1]]};
        this.applyHash(hash);

        return true;
    }

    indentItem(child){
        // Ignore if Root
        if (child === this.root){
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
        // Ignore if Root
        if (child === this.root){
            return false;
        }

        // Ignore if Child of Root
        if (this.parentOf(child) === this.root){
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
        // Ignore if Root
        if (child === this.root){
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
        // Ignore if Root
        if (child === this.root){
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

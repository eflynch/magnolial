import update from 'immutability-helper';

export const createSerialGenerator = size => () => {
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var text = (function() {
        var results = [];
        for (var i=0; i < size; i++) {
            results.push(possible.charAt(Math.floor(Math.random() * possible.length)));
        }
        return results;
    })();
    return text.join('');
};

export const parseTrunk = (trunk, createBaseValue, makeSerial=createSerialGenerator(5)) => {
    const lookup = {};
    const formatChild = (child, _parent) => {
        if (child.value === undefined){
            child.value = createBaseValue();
        }
        if (child.childs === undefined){
            child.childs = [];
        }
        if (child.collapsed === undefined){
            child.collapsed = false;
        }

        child._parent = _parent;
        if (child._serial === undefined){
            child._serial = makeSerial();
        }
        lookup[child._serial] = child;
        for (var i=0; i < child.childs.length; i++){
            formatChild(child.childs[i], child._serial);
        }
    };
    formatChild(trunk, undefined);
    return {
        undo: [],
        redo: [],
        trunk: trunk,
        lookup: lookup,
        createBaseValue: createBaseValue,
        makeSerial: makeSerial
    };
}


export const makeEmptyTree = (createBaseValue, makeSerial=createSerialGenerator(5)) => {
    return parseTrunk({
        childs: [{childs:[], collapsed: false, value: undefined}],
        value: undefined,
        collapsed: false
    }, createBaseValue, makeSerial);
};


const updateLookup = (tree, deletedSerials) => {
    const hash = {
        lookup: {
            $unset: []
        }
    };

    const fixNodeHash = (trunk) => {
        if (tree.lookup[trunk._serial] === undefined) {
            hash.lookup[trunk._serial] = {$set: trunk}
        } else if (tree.lookup[trunk._serial] === trunk) {
            return;
        }
        hash.lookup[trunk._serial] = {$set: trunk};
        trunk.childs.forEach((child)=>{
            fixNodeHash(child);
        });
    };
    fixNodeHash(tree.trunk);
    if (deletedSerials !== undefined) {
        deletedSerials.forEach(serial => {
            hash.lookup["$unset"].push(serial);
        });
    }

    return update(tree, hash);
};

export const applyHash = (tree, forwardHash, backwardHash) => {
    // First modify Trunk
    const hash = {
        undo: {$push: [{forwardHash, backwardHash}]},
        redo: {$set: []}
    };
    if (forwardHash.trunkHash){
        hash.trunk = forwardHash.trunkHash;
    }
    return updateLookup(update(tree, hash), forwardHash.deletedSerials);
}

export const undo = (tree) => {
    if (tree.undo.length) {
        const {forwardHash, backwardHash} = tree.undo[tree.undo.length - 1];
        return updateLookup(update(tree, {
            trunk: backwardHash.trunkHash,
            undo: {$splice: [[tree.undo.length - 1, 1]] },
            redo: {$push: {forwardHash, backwardHash}},
        }), backwardHash.deletedSerials);
    } else {
        return tree;
    }
};

export const redo = (tree) => {
    if (tree.redo.length) {
        const {forwardHash, backwardHash} = tree.redo[tree.redo.length - 1];
        return updateLookup(update(tree, {
            trunk: forwardHash.trunkHash,
            undo: {$push: {forwardHash, backwardHash}},
            redo: {$splice: [[tree.redo.length - 1, 1]] },
        }), forwardHash.deletedSerials);
    } else {
        return tree;
    }
};


const makeChild = (makeSerial, parentSerial) => {
    return {
        value: undefined,
        collapsed: false,
        _serial: makeSerial(),
        _parent: parentSerial,
        childs: []
    }
};


export const parentOf = (tree, child) => {
    if (child._parent === undefined){
        return undefined;
    }
    return tree.lookup[child._parent];
};

export const indexOf = (tree, child) => {
    if (child._parent === undefined){return 0;}
    return parentOf(tree, child).childs.indexOf(child);
};

export const ancestorsOf = (tree, target) => {
    if (target === undefined){
        return [];
    }
    var ancestors = [];
    var parent = parentOf(tree, target);
    while (parent !== undefined){
        ancestors.unshift(parent);
        parent = parentOf(tree, parent);
    }
    return ancestors;
};

export const predOf = (tree, child) => {
    if (child === tree.trunk){
        return undefined;
    }
    if (indexOf(tree, child) === 0){
        return parentOf(tree, child);
    }
    const lowestOpenLeaf = (trunk) => {
        if (trunk.collapsed || trunk.childs.length === 0){
            return trunk;
        }
        return lowestOpenLeaf(trunk.childs[trunk.childs.length - 1]);
    }
    return lowestOpenLeaf(parentOf(tree, child).childs[indexOf(tree, child) - 1]);
};

export const succOf = (tree, child) => {
    if (!child.collapsed && child.childs.length > 0){
        return child.childs[0];
    }

    const childIdx = indexOf(tree, child);
    if (childIdx < parentOf(tree, child).childs.length - 1){
        return parentOf(tree, child).childs[childIdx + 1];
    }

    const findIt = (trunk) => {
        if (trunk === tree.trunk){
            return undefined;
        }
        const parent = parentOf(tree, trunk);
        const childIdx = indexOf(tree, trunk);
        if (childIdx < parent.childs.length - 1){
            return parent.childs[childIdx + 1];
        }

        return findIt(parent);
    };

    return findIt(parentOf(tree, child));
};

export const lookup = (tree, serial) => {
    return tree.lookup[serial];
};

const generateTrunkHash = (tree, target, callback) => {
    const parents = ancestorsOf(tree, target);
    parents.push(target);
    const hash = {};
    let iter = hash;
    let previousParent;
    for (let i=1; i < parents.length; i++){
        let previousParent = parents[i-1];
        let parent = parents[i];
        let parentIdx = previousParent.childs.indexOf(parent);
        let newHash = {};
        iter.childs = {
            [parentIdx]: newHash
        };
        iter = newHash;
    }
    callback(iter);
    return hash;
};

export const setCollapsed = (tree, child, state) => {
    const oldState = child.collapsed;
    const forwardTrunkHash = generateTrunkHash(tree, child, targetHash => {
        targetHash.collapsed = {$set: state}
    });
    const backwardTrunkHash = generateTrunkHash(tree, child, targetHash => {
        targetHash.collapsed = {$set: oldState}
    });
    return applyHash(tree, {trunkHash: forwardTrunkHash}, {trunkHash: backwardTrunkHash});
};

export const setValue = (tree, child, value) => {
    const oldValue = child.value;
    if (value === oldValue){return tree;}

    // Weird hack
    if (value.title !== undefined && value.title === "<br>"){
        value.title = "";
    }

    const forwardTrunkHash = generateTrunkHash(tree, child, targetHash => {
        targetHash.value = {$set: value};
    });
    const backwardTrunkHash = generateTrunkHash(tree, child, targetHash => {
        targetHash.value = {$set: oldValue};
    });
    return applyHash(tree, {trunkHash: forwardTrunkHash}, {trunkHash: backwardTrunkHash});
};


export const newChild = (tree, child) => {
    const newItem = makeChild(tree.makeSerial, child._serial);
    newItem.value = tree.createBaseValue();


    const forwardTrunkHash = generateTrunkHash(tree, parentOf(tree, child), targetHash => {
        targetHash.childs = {$splice: [[0, 0, newItem]]};
    });

    const backwardTrunkHash  = generateTrunkHash(tree, parentOf(tree, child), targetHash => {
        targetHash.childs = {$splice: [[0, 1]]};
    });
    return {
        tree: applyHash(tree,
            {trunkHash: forwardTrunkHash},
            {trunkHash: backwardTrunkHash, deletedSerials: [newItem._serial]}),
        newItem: newItem
    };
};

export const newSibling = (tree, child, index) => {
    if (child === tree.trunk){
        return tree;
    }

    const newItem = makeChild(tree.makeSerial, child._parent);
    newItem.value = tree.createBaseValue();


    const forwardTrunkHash = generateTrunkHash(tree, parentOf(tree, child), targetHash => {
        targetHash.childs = {$splice: [[index, 0, newItem]]};
    });

    const backwardTrunkHash  = generateTrunkHash(tree, parentOf(tree, child), targetHash => {
        targetHash.childs = {$splice: [[index, 1]]};
    });
    return {
        tree: applyHash(tree,
            {trunkHash: forwardTrunkHash},
            {trunkHash: backwardTrunkHash, deletedSerials: [newItem._serial]}),
        newItem: newItem
    };
};

export const newItemBelow = (tree, child) => {
    return newSibling(tree, child, indexOf(tree, child) + 1); 
};

export const newItemAbove = (tree, child) => {
    return newSibling(tree, child, indexOf(tree, child)); 
};

export const deleteItem = (tree, child) => {
    if (child === tree.trunk) {
        return tree;
    }

    if (parentOf(tree, child) === tree.trunk && tree.trunk.childs.length === 1) {
        return tree;
    }

    let childIndex = indexOf(tree, child);

    const forwardTrunkHash = generateTrunkHash(tree, parentOf(tree, child), targetHash => {
        targetHash.childs = {$splice: [[childIndex, 1]]};
    });
    const backwardTrunkHash = generateTrunkHash(tree, parentOf(tree, child), targetHash => {
        targetHash.childs = {$splice: [[childIndex, 0, child]]};
    });

    return applyHash(tree,
        {trunkHash: forwardTrunkHash, deletedSerials: [child._serial]},
        {trunkHash: backwardTrunkHash});
};

export const indentItem = (tree, child) => {
    if (child === tree.trunk){
        return tree;
    }

    const oldIndex = indexOf(tree, child);
    if (oldIndex === 0){
        return tree;
    }

    const newParent = parentOf(tree, child).childs[oldIndex - 1];
    const newParentOldCollapsedState = newParent.collapsed;
    const newParentOldChildCount = newParent.childs.length;

    const newChild = update(child, {
        _parent: {$set: newParent._serial}
    });

    const forwardTrunkHash = generateTrunkHash(tree, parentOf(tree, child), targetHash => {
        targetHash.childs = {
            [oldIndex - 1]: {
                childs: {$push: [newChild]},
                collapsed: {$set: false}
            },
            $splice: [[oldIndex, 1]],
        };
    });

    const backwardTrunkHash = generateTrunkHash(tree, parentOf(tree, child), targetHash => {
        targetHash.childs = {
            [oldIndex - 1]: {
                childs: {$splice: [newParentOldChildCount, 1]},
                collapsed: {$set: newParentOldCollapsedState}
            },
            $splice: [[oldIndex, 0, child]],
        };
    });

    return applyHash(tree,
        {trunkHash: forwardTrunkHash},
        {trunkHash: backwardTrunkHash});
}

export const outdentItem = (tree, child) => {
    if (child === tree.trunk){
        return tree;
    }

    if (parentOf(tree, child) === tree.trunk) {
        return tree;
    }

    const childIndex = indexOf(tree, child);
    const parentIndex = indexOf(tree, parentOf(tree, child));

    const newParent = parentOf(tree, parentOf(tree, child));

    const newChild = update(child, {
        _parent: {$set: newParent._serial}
    });

    const forwardTrunkHash = generateTrunkHash(tree, newParent, targetHash => {
        targetHash.childs = {
            $splice: [[parentIndex + 1, 0, newChild]],
            [parentIndex]: {
                childs: {$splice: [[childIndex, 1]]}
            }
        };
    });

    const backwardTrunkHash = generateTrunkHash(tree, newParent, targetHash => {
        targetHash.childs = {
            $splice: [[parentIndex + 1, 1]],
            [parentIndex]: {
                childs: {$splice: [[childIndex, 0, child]]}
            }
        };
    });

    return applyHash(tree,
        {trunkHash: forwardTrunkHash},
        {trunkHash: backwardTrunkHash});
}

export const moveItem = (tree, child, index) => {
    if (child === tree.trunk){
        return tree;
    }

    const parent = parentOf(tree, child);
    let newIndex = Math.max(index, 0);
    if (index >= parent.childs.length) {
        newIndex = parent.childs.length - 1;
    }
    const oldIndex = indexOf(tree, child);

    if (oldIndex === newIndex) {
        return tree;
    }

    const forwardTrunkHash = generateTrunkHash(tree, parent, targetHash => {
        let spliceOp;
        if (oldIndex > newIndex) {
            spliceOp = [[oldIndex, 1], [newIndex, 0, child]];
        } else {
            spliceOp = [[newIndex, 0, child], [oldIndex, 1]];
        }
        targetHash.childs = {$splice : spliceOp};
    });

    const backwardTrunkHash = generateTrunkHash(tree, parent, targetHash => {
        let spliceOp;
        if (newIndex > oldIndex) {
            spliceOp = [[newIndex, 1], [oldIndex, 0, child]];
        } else {
            spliceOp = [[oldIndex, 0, child], [newIndex, 1]];
        }
        targetHash.childs = {$splice : spliceOp};
    });

    return applyHash(tree, {trunkHash: forwardTrunkHash}, {trunkHash: backwardTrunkHash});
};

export const moveItemUp = (tree, child) => {
    const newIndex = indexOf(tree, child) - 1;
    return moveItem(tree, child, newIndex);
};

export const moveItemDown = (tree, child) => {
    const newIndex = indexOf(tree, child) + 1;
    return moveItem(tree, child, newIndex);
};

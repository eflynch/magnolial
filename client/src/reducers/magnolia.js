import update from 'immutability-helper';
import {lookup, ancestorsOf, deleteItem} from '../immutable-tree';
import {indentItem, outdentItem, makeEmptyTree, parentOf, setCollapsed, newChild} from '../immutable-tree';
import {predOf, succOf, moveItemUp, moveItemDown, newItemAbove, newItemBelow, undo, redo, setValue} from '../immutable-tree';

const setHead = (state, child) => {
    return update(state, {
        headSerial: {$set: child._serial},
        focusSerial: {$set: child._serial}
    });
};

const setFocus = (state, child) => {
    if (child === undefined || child === null) {
        return setFocus(state, lookup(state.tree, state.headSerial));
    }

    const currentHead = lookup(state.tree, state.headSerial);
    if (ancestorsOf(state.tree, child).indexOf(currentHead) < 0) {
        if (child !== currentHead) {
            return state;
        }
    }

    return update(state, {focusSerial: {$set: child._serial}});
};

const magnolia = (state, action) => {
    if (action == undefined) {
        const tree = makeEmptyTree(()=>{
                return {
                    title: "",
                    link:"",
                    content: ""
                };
            });
        return {
            tree: tree,
            headSerial: tree.trunk._serial,
            focusSerial: tree.trunk._serial
        };
    }
    switch (action.type) {
        case 'DELETE':
            if (lookup(state.tree, state.headSerial) === action.child) {
                return state;
            }

            const intermediate = setFocus(state, predOf(state.tree, action.child));
            return update(intermediate, {
                tree: {$set: deleteItem(intermediate.tree, action.child)}
            });
        case 'INDENT':
            return update(state, {
                tree: {$set: indentItem(state.tree, action.child)}
            });
        case 'OUTDENT':
            return update(state, {
                tree: {$set: outdentItem(state.tree, action.child)}
            });
        case 'SET_FOCUS':
            return setFocus(state, action.child);
        case 'FOCUS_UP':
            return setFocus(state, predOf(state.tree, action.child));
        case 'FOCUS_DOWN':
            if (action.child === lookup(state.tree, state.headSerial)) {
                return setFocus(state, action.child.childs[0]);
            }
            const successor = succOf(state.tree, action.child);
            if (successor === undefined) {
                return state;
            }
            return setFocus(state, successor);
        case 'SHIFT_UP':
            return update(state, {
                tree: {$set: moveItemUp(state.tree, action.child)}
            });
        case 'SHIFT_DOWN':
            let newTree = moveItemDown(state.tree, action.child);
            if (state.tree === newTree) {
                newTree = indentItem(state.tree, action.child);
            }
            return update(state, {
                tree: {$set: newTree}
            });
        case 'NEW_ABOVE': {
            const {tree, newItem} = newItemAbove(state.tree, action.child);
            return setFocus(update(state, {
                tree: {$set: tree}
            }), newItem);
        }
        case 'NEW_BELOW': {
            const head = lookup(state.tree, state.headSerial);
            if (action.child === head) {
                const {tree, newItem} = newChild(state.tree, action.child);
                return setFocus(update(state, {
                    tree: {$set: tree}
                }), newItem);
            }
            const {tree, newItem} = newItemBelow(state.tree, action.child);
            return setFocus(update(state, {
                tree: {$set: tree}
            }), newItem);
        }
        case 'NEW': {
            // Try outdenting if we aren't a child of head
            const head = lookup(state.tree, state.headSerial);
            if (head !== parentOf(state.tree, action.child)) {
                const tree = outdentItem(state.tree, action.child);
                if (state.tree !== tree) {
                    return update(state, {tree: {$set: tree}});
                }
            }

            // otherwise just newItemBelow
            const {tree, newItem} = newItemBelow(state.tree, action.child);
            return setFocus(update(state, {
                    tree: {$set: tree}
                }), newItem);
        }
        case 'UNDO':
            return update(state, {tree: {$set: undo(state.tree, action.child)}});
        case 'REDO':
            return update(state, {tree: {$set: redo(state.tree, action.child)}});
        case 'MODIFY':
            return update(state, {tree: {$set: setValue(state.tree, action.child, action.value)}});
        case 'SET_COLLAPSED':
            return update(state, {tree: {$set: setCollapsed(state.tree, action.child, action.collapsed)}});
        case 'SET_HEAD':
            return setHead(state, action.child);
        case 'DELVE_IN':
            return setFocus(setHead(state, action.child), action.child.childs[0]);
        case 'DELVE_OUT':
            const head = lookup(state.tree, state.headSerial);
            if (head === state.tree.trunk) {
                return state;
            }
            return setFocus(setHead(state, parentOf(state.tree, head)), head);
        default:
            return state;
    }
}
export default magnolia;
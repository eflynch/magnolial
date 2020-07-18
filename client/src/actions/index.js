export const SYNC = () => ({
    type: 'SYNC'
});
export const SYNC_FAILED = () => ({
    type: 'SYNC_FAILED'
});
export const SYNC_SUCCEEDED = () => ({
    type: 'SYNC_SUCCEEDED'
});


export const DELETE = (child) => ({
    type: 'DELETE',
    child
});
export const INDENT = (child) => ({
    type: 'INDENT',
    child
});
export const OUTDENT = (child) => ({
    type: 'OUTDENT',
    child
});
export const SET_FOCUS = (child) => ({
    type: 'SET_FOCUS',
    child
});
export const FOCUS_UP = (child) => ({
    type: 'FOCUS_UP',
    child
});
export const FOCUS_DOWN = (child) => ({
    type: 'FOCUS_DOWN',
    child
});
export const SHIFT_UP = (child) => ({
    type: 'SHIFT_UP',
    child
});
export const SHIFT_DOWN = (child) => ({
    type: 'SHIFT_DOWN',
    child
});
export const NEW_ABOVE = (child) => ({
    type: 'NEW_ABOVE',
    child
});
export const NEW_BELOW = (child) => ({
    type: 'NEW_BELOW',
    child
});
export const NEW = (child) => ({
    type: 'NEW',
    child
});
export const UNDO = () => ({
    type: 'UNDO',
});
export const REDO = () => ({
    type: 'REDO',
});
export const MODIFY = (child, value) => ({
    type: 'MODIFY',
    child,
    value
});
export const SET_COLLAPSED = (child, collapsed) => ({
    type: 'SET_COLLAPSED',
    child,
    collapsed
});

export const SET_HEAD = (child) => ({
    type: 'SET_HEAD',
    child
});

export const DELVE_IN = (child) => ({
    type: 'DELVE_IN',
    child
});
export const DELVE_OUT = (child) => ({
    type: 'DELVE_OUT',
    child
});


export default {
    SYNC:SYNC,
    SYNC_FAILED:SYNC_FAILED,
    SYNC_SUCCEEDED:SYNC_SUCCEEDED,
    DELETE:DELETE,
    INDENT:INDENT,
    OUTDENT:OUTDENT,
    SET_FOCUS:SET_FOCUS,
    FOCUS_UP:FOCUS_UP,
    FOCUS_DOWN:FOCUS_DOWN,
    SHIFT_UP:SHIFT_UP,
    SHIFT_DOWN:SHIFT_DOWN,
    NEW_ABOVE:NEW_ABOVE,
    NEW_BELOW:NEW_BELOW,
    NEW:NEW,
    UNDO:UNDO,
    REDO:REDO,
    MODIFY:MODIFY,
    SET_COLLAPSED:SET_COLLAPSED,
    SET_HEAD:SET_HEAD,
    DELVE_IN:DELVE_IN,
    DELVE_OUT:DELVE_OUT,
};

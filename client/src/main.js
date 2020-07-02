import React, { useReducer, useEffect } from 'react';
import { render } from 'react-dom';

import App from './components/app';
import rootReducer from './reducers';
import MagnoliaContext from './context';

import {SYNC, SYNC_FAILED, SYNC_SUCCEEDED} from './actions';

import PromiseQueue from './promise-queue';

import {makeEmptyTree} from './immutable-tree';

const syncEffect = (tree, dispatch) => () => {
    const syncMagnolia = (tree) => {
        return PromiseQueue.enqueue(() =>
            new Promise((resolve, reject) =>{
                setTimeout(()=>{
                    // TODO: API CALL
                    resolve();
                }, 20);
            })
       );
    };

    dispatch(SYNC());
    syncMagnolia(tree).then(() => {
        dispatch(SYNC_SUCCEEDED());
    }).catch(() => {
        dispatch(SYNC_FAILED());
    });
}

const Main = ({initialState}) => {
    const [state, dispatch] = useReducer(rootReducer, initialState);
    useEffect(syncEffect(state.magnolia.tree, dispatch), [state.magnolia.tree])

    return (
        <MagnoliaContext.Provider value={{state, dispatch}} >
            <App />
            {state.synchronize === 'ok' ? "√" : "..."}
        </MagnoliaContext.Provider>
    );
};

const loadMagnolia = () => {
    // TODO: API CALL
    render(<Main initialState={{
        magnolia: {
            tree: makeEmptyTree(()=>{
                return {
                    title: "",
                    link:"",
                    content: ""
                };
            }),
            headSerial: null,
            focusSerial: null
        },
        synchronize: 'ok'
    }}/>, document.getElementById('content'));
}


document.addEventListener("DOMContentLoaded", () => {
    loadMagnolia();
});

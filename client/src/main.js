import React, { useReducer, useEffect } from 'react';
import { render } from 'react-dom';
import axios from 'axios';

import App from './components/app';
import rootReducer from './reducers';
import MagnoliaContext from './context';

import {SYNC, SYNC_FAILED, SYNC_SUCCEEDED} from './actions';

import PromiseQueue from './promise-queue';

import {makeEmptyTree, parseTrunk} from './immutable-tree';

const syncEffect = (tree, dispatch) => () => {
    if (!window.bootstrap.magnolia_id){
        return;
    }

    const syncMagnolia = (tree) => {
        return PromiseQueue.enqueue(() => {
            return axios.patch(`/api/magnolia/${window.bootstrap.magnolia_id}`, {
                    magnolia: tree
                });
        });
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
    useEffect(syncEffect(state.magnolia.tree.trunk, dispatch), [state.magnolia.tree.trunk])

    return (
        <MagnoliaContext.Provider value={{state, dispatch}} >
            <App />
            {state.synchronize === 'ok' ? "√" : "..."}
        </MagnoliaContext.Provider>
    );
};

const loadMagnolia = () => {
    const makeBaseValue = () => ({title:"", link:"", content:""});
    let tree;
    if (window.bootstrap.magnolia) {
        tree = parseTrunk(window.bootstrap.magnolia, makeBaseValue)
    } else {
        tree = makeEmptyTree(makeBaseValue);
    }
    render(<Main initialState={{
        magnolia: {
            tree: tree,
            headSerial: null,
            focusSerial: null
        },
        synchronize: 'ok'
    }}/>, document.getElementById('content'));
}


document.addEventListener("DOMContentLoaded", () => {
    loadMagnolia();
});

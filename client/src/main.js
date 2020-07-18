import React, { useReducer, useEffect } from 'react';
import { render } from 'react-dom';
import axios from 'axios';

import App from './components/app';
import rootReducer from './reducers';
import MagnoliaContext from './context';
import FontAwesome from 'react-fontawesome';

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

    const syncLogo = (state.synchronize === 'ok') ?  <FontAwesome name="check"/> : (<FontAwesome name="spinner" pulse={true}/>);
    return (
        <MagnoliaContext.Provider value={{state, dispatch}} >
            <App />
            <div className="sync">
                {syncLogo}
            </div>
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



const Header = () => {
    return (
        <div className="header">
            Magnolia
            <img src="static/app/icon.png"/>
        </div>
    );
};

const loadHeader = () => {
    render(<Header/>, document.getElementById('header'));
}


document.addEventListener("DOMContentLoaded", () => {
    loadMagnolia();
    loadHeader();
});

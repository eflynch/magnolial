import React, { useReducer, useEffect } from 'react';
import { render } from 'react-dom';

import App from './components/app';
import rootReducer from './reducers';
import MagnoliaContext from './context';

import {SYNC, SYNC_FAILED, SYNC_SUCCEEDED} from './actions';

import PromiseQueue from './promise-queue';

import {makeEmptyTree} from './magnolia';


const initialTree = makeEmptyTree(()=>{
    return {
        title: "",
        link:"",
        content: ""
    };
});


const syncEffect = (state, dispatch) => () => {
    // const Sync = (state) => {
    //     return PromiseQueue.enqueue( () =>{});
    // };
    // dispatch(SYNC);
    // Sync(state).then(() => {
    //     dispatch(SYNC_SUCCEEDED);
    // }, () => {
    //     dispatch(SYNC_FAILED);
    // });
}

const Main = ({initialState}) => {
    const [state, dispatch] = useReducer(rootReducer, initialState);
    useEffect(syncEffect(state, dispatch), [state.magnolia])

    return (
        <MagnoliaContext.Provider value={{state, dispatch}} >
            <App />
        </MagnoliaContext.Provider>
    );
};



document.addEventListener("DOMContentLoaded", () => {
    render(<Main initialState={{
        magnolia: {
            tree: initialTree,
            headSerial: initialTree.trunk._serial,
            focusSerial: initialTree.trunk._serial
        },
        synchronize: 'ok'
    }}/>, document.getElementById('content'));
});

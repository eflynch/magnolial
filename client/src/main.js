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

function fetch(url, options) {
  // Somewhat pleasant wrapper around XHR.

  options = options || {};
  return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
      if (xhr.status >= 400) {
        reject(new Error("XHR returned status " + xhr.status + ":\n" + xhr.responseText));
      } else {
        resolve(xhr);
      }
    };
    xhr.onerror = function(e) { reject(e); };
    if (options.hasOwnProperty('responseType'))
      xhr.responseType = options.responseType;
    var method = 'get';
    if (options.hasOwnProperty('method'))
      method = options.method;
    xhr.open(method, url)
    var data = undefined;
    if (options.hasOwnProperty('data'))
      data = options.data;
    xhr.send(data);
  });
}

const syncEffect = (tree, dispatch) => () => {
    const syncMagnolia = (tree) => {
        return PromiseQueue.enqueue(() => {
            return fetch(`/var/content`, {
                method: "put",
                data: JSON.stringify({magnolia: tree})
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
    const createBaseValue = () => ({title:"", link:"", content:""});
    fetch(`/var/content`, {method:"get"}).then((data) => {
        const trunk = JSON.parse(data.responseText).magnolia;
        let tree = parseTrunk(trunk, createBaseValue);
        render(<Main initialState={{
            magnolia: {
                tree: tree,
                headSerial: null,
                focusSerial: null
            },
            synchronize: 'ok'
        }}/>, document.getElementById('content'));
    }).catch(()=>{
        const tree = makeEmptyTree(createBaseValue);
        render(<Main initialState={{
            magnolia: {
                tree: tree,
                headSerial: null,
                focusSerial: null
            },
            synchronize: 'ok'
        }}/>, document.getElementById('content'));
    });
}

document.addEventListener("DOMContentLoaded", () => {
    loadMagnolia();
});

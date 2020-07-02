import React, {useState, useContext, useEffect, useRef} from 'react';
import Item from './item';
import Breadcrumbs from './breadcrumbs';
import Title from './title';
import MagnoliaContext from '../context';

import {MODIFY, SET_COLLAPSED, SET_FOCUS, SET_HEAD} from '../actions';
import KeyDownHandler from '../keybindings';

import {lookup, ancestorsOf, parentOf} from '../immutable-tree';

const Magnolia = () => {
    const [mode, setMode] = useState('vim-default');
    const {state, dispatch} = useContext(MagnoliaContext);
    const {magnolia, synchronize} = state;
    const {tree, headSerial, focusSerial} = magnolia;

    const ensureHeadAndFocus = ()=> {
        if (headSerial === null || headSerial === undefined) {
            dispatch(SET_HEAD(tree.trunk));
        }
        if (focusSerial === null || focusSerial === undefined) {
            dispatch(SET_FOCUS(tree.trunk));
        }
    };
    useEffect(ensureHeadAndFocus, [headSerial, focusSerial]);
    const head = headSerial ? lookup(tree, headSerial) : tree.trunk;
    const focus = focusSerial ? lookup(tree, focusSerial) : tree.trunk;

    useEffect(()=>{
        const content = head.value.content;
        const focusCapture = content === null || content === undefined || content === "";
        if (focusCapture && focusSerial === null) {
            dispatch(SET_FOCUS(head));
        }
        if (!head.content && head.childs.length === 0 && parentOf(tree, head) !== undefined) {
            dispatch(SET_HEAD(parentOf(tree, head)));
            dispatch(SET_FOCUS(head));
        }
    }, [tree, focusSerial, headSerial]);

    const setTitle = (child, title) => {
        dispatch(MODIFY(
            child,
            {
                title: title,
                content: child.value.content,
                link: child.value.link
            }));
    };

    const setCollapsed = (child, collapsedState) => {
        dispatch(SET_COLLAPSED(child, collapsedState));
    };

    const setHead = (child) => {
        dispatch(SET_HEAD(child));
    };

    const setFocus = (child) => {
        dispatch(SET_FOCUS(child));
    };

    const onKeyDown = KeyDownHandler(focus, mode, setMode, dispatch);
    const items = head.childs.map((child, i) => {
         return <Item trunk={child}
                      key={child._serial}
                     focus={focus}
                     setHead={setHead}
                     setFocus={setFocus}
                     setCollapsed={setCollapsed}
                     entryEnabled={mode !== 'vim-default'}
                     setTitle={setTitle}/>;

    });

    return (
        <div className="magnolia" onKeyDown={onKeyDown}>
            <div>
                <Breadcrumbs setHead={setHead} setFocus={setFocus}
                             ancestors={ancestorsOf(tree, head)}/>
                <div className="head">
                    <Title trunk={head}
                           setTitle={setTitle}
                           setFocus={setFocus}
                           setHead={setHead}
                           collapseable={false}
                           entryEnabled={mode !== 'vim-default'}
                           focus={focus}/>
                </div>
            </div>
            <div>
                {items}
            </div>
        </div>
    );
}
export default Magnolia;

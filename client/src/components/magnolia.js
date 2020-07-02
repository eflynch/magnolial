import React, {useState, useContext, useEffect, useRef} from 'react';
import Item from './item';
import Breadcrumbs from './breadcrumbs';
import Title from './title';
import MagnoliaContext from '../context';

import {MODIFY, SET_COLLAPSED, SET_FOCUS, SET_HEAD} from '../actions';
import KeyDownHandler from '../keybindings';

import {lookup, ancestorsOf, parentOf} from '../magnolia';

const Magnolia = () => {
    const [mode, setMode] = useState('vim-default');
    const {state, dispatch} = useContext(MagnoliaContext);
    const {magnolia, synchronize} = state;
    const {tree, headSerial, focusSerial} = magnolia;

    useEffect(()=>{
        const content = lookup(tree, headSerial).value.content;
        const focusCapture = content === null || content === undefined || content === "";
        if (focusCapture && focusSerial === null) {
            console.log("focus head");
            dispatch(SET_FOCUS(head));
        }
        const head = lookup(tree, headSerial);
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

    const head = lookup(tree, headSerial);
    const focus = lookup(tree, focusSerial);

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
            </div>
            <div>
                <div >
                    {items}
                </div>
            </div>
        </div>
    );
}
export default Magnolia;

import React, { useRef, useEffect, useState } from 'react';

import ContentEditable from './content-editable';

function placeCaretAtEnd(el) {
    el.focus();
    if (typeof window.getSelection != "undefined"
            && typeof document.createRange != "undefined") {
        var range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    } else if (typeof document.body.createTextRange != "undefined") {
        var textRange = document.body.createTextRange();
        textRange.moveToElementText(el);
        textRange.collapse(false);
        textRange.select();
    }
}

const Title = ({focus, setFocus, setHead, setTitle, entryEnabled, trunk, hasLink, hasContent}) => {
    const inputNode = useRef(null);
    const bottomNode = useRef(null);

    const [active, setActive] = useState(false);
    useEffect(() => {
        if (focus === trunk) {
            setActive(true);
            if (entryEnabled) {
                inputNode.current.focus();
            } else {
                bottomNode.current.focus();
            }
        }
    }, [focus, trunk, entryEnabled, active]);

    const onClick = (e) => {
        setFocus(trunk);
        e.preventDefault();
    };
    const onBlur = (e) => {
        setActive(false);
    };
    const onFocus = (e) => {
        placeCaretAtEnd(inputNode.current);
    };
    const setValue = (e) => {
        if (e.target.value !== trunk.value.title) {
            setTitle(trunk, e.target.value);
        }
    };

    const className = 'title-input' + (!entryEnabled ? ' readonly' : '')
                                   + (focus === trunk ? ' focused': '');

    const Input = ContentEditable;
    return (
        <div className="title" onClick={onClick}>
            <Input className={className + " bottom"}
                             ref={bottomNode}
                             tabIndex={-1}
                             onBlur={onBlur}
                             value={trunk.value.title}
                             readOnly />
            <Input ref={inputNode} className={className + " top"}
                             value={trunk.value.title}
                             onBlur={onBlur}
                             onFocus={onFocus}
                             onChange={setValue}/>
        </div>
    );
};

export default Title;

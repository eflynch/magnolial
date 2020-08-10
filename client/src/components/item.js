import React, {useMemo} from 'react';

import Title from './title';
import Decoration from './decoration';

const Item = React.memo(({trunk, focus, setFocus, setHead, setTitle, setCollapsed, entryEnabled}) => {
    const hasContent = trunk.value.content !== null && trunk.value.content !== undefined;
    const hasLink = trunk.value.link !== null && trunk.value.link !== undefined;

    const className = hasLink ? "link" : (hasContent ? "iframe-link" : "normal");

    const children = (trunk.collapsed || trunk.childs === undefined) ? [] : trunk.childs.map(child =>{
        return <Item trunk={child}
                     key={child._serial}
                     focus={focus}
                     setHead={setHead}
                     setFocus={setFocus}
                     setCollapsed={setCollapsed}
                     entryEnabled={entryEnabled}
                     setTitle={setTitle}/>;
    });

    return (
        <div className={className}>
            <li>
                <div className="item" onFocus={()=>{setFocus(trunk);}}>
                    <Decoration trunk={trunk}
                                collapseable={trunk.childs.length > 0} 
                                collapsed={trunk.collapsed}
                                toggleCollapsed={()=>setCollapsed(trunk, !trunk.collapsed)}
                                hasContent={hasContent}
                                hasLink={hasLink}
                                setHead={setHead}
                                setFocus={setFocus}/>
                    <Title trunk={trunk}
                           setTitle={setTitle}
                           setFocus={setFocus}
                           setHead={setHead}
                           collapseable={trunk.childs.length > 0}
                           toggleCollapsed={()=>setCollapsed(trunk, !trunk.collapsed)}
                           entryEnabled={entryEnabled}
                           hasContent={hasContent}
                           hasLink={hasLink}
                           focus={focus}/>
                </div>
                <ul>
                    {children}
                </ul>
            </li>
        </div>
    );
});

export default Item;

import React, { useRef, useEffect, useState, useMemo } from 'react';


const InnerContentEditable = React.memo(React.forwardRef(({value, onChange, onBlur, readOnly, children, ...rest}, ref) => {
    const emit = (e) => {
        const newValue = ref.current.innerHTML;
        if (value !== newValue && onChange){
            onChange({target:{value:newValue}});
        }
    };
    return (
        <div {...rest}
            ref={ref}
            spellCheck={false}
            contentEditable={!readOnly}
            dangerouslySetInnerHTML={{__html: value}}
            onInput={emit}
            onBlur={(e)=>{emit(e); if(onBlur){onBlur(e);}}} >
            {children}
        </div>
    );
}));

const ContentEditable = React.forwardRef(({value, ...props}, ref) => {
    const oldValue = useRef(null);
    const fakeValue = (ref.current === null || value !== ref.current.innerHTML) ? value : oldValue.current; 

    useEffect(() => {
        oldValue.current = fakeValue;
    });

    return <InnerContentEditable value={fakeValue} {...props} ref={ref} />;
});

export default ContentEditable;

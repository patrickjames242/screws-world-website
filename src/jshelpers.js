import { useRef, useEffect } from 'react';


export function useUpdateEffect(effect, dependencies) {

    const flag = useRef(true);

    useEffect(() => {
        if (flag.current === true) {
            flag.current = false;
        } else {
            return effect();
        }
        // eslint-disable-next-line
    }, dependencies);
}


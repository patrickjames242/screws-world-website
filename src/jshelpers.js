
import { useRef, useEffect } from 'react';



export const SCREWS_WORLD_EMAIL = "info@screwsworldbahamas.com";
export const SCREWS_WORLD_NUMBER = "(242) 326-1976";

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



export function fixScrollingIssueBecauseOfTransitionAnimation(){

    const scrollPositionKey = "scroll-position";
    const cachedScrollPosition = Number(sessionStorage.getItem(scrollPositionKey)) || 0;
    (function scrollPageToCachedScrollPosition(){
        const timeout = 150;
        let iterations = 0;
        const interval = 5;

        const intervalID = setInterval(() => {
            iterations += 1;
            const currentTime = iterations * interval;

            if (document.documentElement.scrollTop !== cachedScrollPosition) {
                document.documentElement.scrollTop = cachedScrollPosition;
            }

            if (currentTime >= timeout) {
                clearInterval(intervalID);
            }

        }, interval);
    })();

    (function storeScrollPositionOnScroll(){
        let timer;
        window.addEventListener('scroll', () => {
            timer && clearTimeout(timer);
            timer = setTimeout(() => {
                const scrollPosition = document.documentElement.scrollTop;
                sessionStorage.setItem(scrollPositionKey, scrollPosition);
            }, 100);
        });
    })();

}



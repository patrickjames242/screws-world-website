import { useRef, useEffect } from "react";
import { useHistory } from "react-router-dom";

// The title will be set when the component mounts. if you pass null or undefined, the title will be set to simply "Screws World". If you pass anything else, the title will be "Screws World | <the string you passed>"
export function useSetTitleFunctionality(titleString) {
  titleString = titleString.trim();
  const screwsWorldText = "Screws World";

  useEffect(() => {
    if (titleString == null || titleString === "") {
      document.title = screwsWorldText;
    } else {
      document.title = screwsWorldText + " | " + titleString;
    }
    // eslint-disable-next-line
  }, []);
}

export function useIsInitialRender() {
  const isInitialRenderRef = useRef(true);
  useEffect(() => {
    isInitialRenderRef.current = false;
  }, []);
  return isInitialRenderRef.current;
}

export const SCREWS_WORLD_EMAIL = "screwsworld@gmail.com";
export const SCREWS_WORLD_NUMBER = "(242) 326-1976";

export function isValidEmail(email) {
  // I got this regex from here: https://emailregex.com/
  //eslint-disable-next-line no-control-regex
  const emailRegex =
    /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
  return emailRegex.test(email);
}

// works just like useEffect, except that the effect is not called after the first render, as is the case with useEffect.
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

export function useBlockHistoryWhileMounted(message, shouldBlock = true) {
  const history = useHistory();

  useEffect(() => {
    if (shouldBlock === false) {
      return;
    }
    const unblock = history.block(message);
    const unlistenToNotification = allHistoryBlocksShouldBeRemoved.addListener(
      () => {
        unblock();
      }
    );
    const func = () => {
      if (unlistenToNotification) {
        unlistenToNotification();
      }

      unblock();
    };
    return func;
  }, [history, message, shouldBlock]);
}

export function getIntegerArray(upper, lower) {
  upper = Math.round(upper);
  lower = Math.round(lower);
  const numbers = [];
  for (let x = upper; x <= lower; x++) {
    numbers.push(x);
  }
  return numbers;
}

export class Notification {
  constructor() {
    let listeners = [];
    this.post = (info) => {
      listeners.forEach((l) => l(info));
    };
    this.addListener = (listener) => {
      listeners.push(listener);
      return () => this.removeListener(listener);
    };
    this.removeListener = (listener) => {
      listeners = listeners.filter((x) => x !== listener);
    };
  }
}

export const allHistoryBlocksShouldBeRemoved = new Notification();

// export function fixScrollingIssueBecauseOfTransitionAnimation() {

//     const scrollPositionKey = "scroll-position";
//     const cachedScrollPosition = Number(sessionStorage.getItem(scrollPositionKey)) || 0;
//     (function scrollPageToCachedScrollPosition() {
//         const timeout = 150;
//         let iterations = 0;
//         const interval = 5;

//         const intervalID = setInterval(() => {
//             iterations += 1;
//             const currentTime = iterations * interval;

//             if (document.documentElement.scrollTop !== cachedScrollPosition) {
//                 document.documentElement.scrollTop = cachedScrollPosition;
//             }

//             if (currentTime >= timeout) {
//                 clearInterval(intervalID);
//             }

//         }, interval);
//     })();

//     (function storeScrollPositionOnScroll() {
//         let timer;
//         window.addEventListener('scroll', () => {
//             timer && clearTimeout(timer);
//             timer = setTimeout(() => {
//                 const scrollPosition = document.documentElement.scrollTop;
//                 sessionStorage.setItem(scrollPositionKey, scrollPosition);
//             }, 100);
//         });
//     })();

// }

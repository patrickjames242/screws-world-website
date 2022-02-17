import { Notification, Optional } from "jshelpers";
import React, { useContext, useRef, useState } from "react";
import { animated, useTransition } from "react-spring";

export interface ScreenDimmerFunctions {
  setVisibility?: (isVisible: boolean, animate: boolean) => void;
  dimmerWasClickedNotification?: Notification;
}

const ScreenDimmerFunctionsContext =
  React.createContext<Optional<ScreenDimmerFunctions>>(null);

export function useScreenDimmerFunctions(): ScreenDimmerFunctions {
  const functions = useContext(ScreenDimmerFunctionsContext);
  if (!functions) {
    throw new Error(
      "you tried to access the screen dimmer functions outside of a screen dimmer context provider. This is not allowed."
    );
  }
  return functions;
}

export function ScreenDimmerProvider(props: { children: React.ReactNode }) {
  const screenDimmerFunctionsRef = useRef<ScreenDimmerFunctions>({}).current;

  return (
    <ScreenDimmerFunctionsContext.Provider value={screenDimmerFunctionsRef}>
      {props.children}
      <ScreenDimmer functionsRef={screenDimmerFunctionsRef} />
    </ScreenDimmerFunctionsContext.Provider>
  );
}

function ScreenDimmer(props: { functionsRef: ScreenDimmerFunctions }) {
  const [shouldBeVisible, setVisibilityState] = useState(false);
  const shouldAnimateVisibilityChange = useRef(true);

  function setVisibility(isVisible: boolean, animate: boolean) {
    shouldAnimateVisibilityChange.current = animate;
    document.body.style.overflow = isVisible ? "hidden" : "initial";
    setVisibilityState(isVisible);
  }

  const dimmerWasClickedNotification = useRef(new Notification()).current;

  props.functionsRef.setVisibility = setVisibility;
  props.functionsRef.dimmerWasClickedNotification =
    dimmerWasClickedNotification;

  function respondToOnClick() {
    setVisibility(false, true);
    dimmerWasClickedNotification.post({});
  }

  const backgroundDimmerTransition = useTransition(shouldBeVisible, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    immediate: !shouldAnimateVisibilityChange,
  });

  return (
    <>
      {backgroundDimmerTransition((styles, item, _, index) => {
        if (item === false) {
          return undefined;
        }
        return (
          <animated.div
            key={index}
            onClick={respondToOnClick}
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              position: "fixed",
              top: "0",
              left: "0",
              bottom: "0",
              right: "0",
              zIndex: 10,
              ...styles,
            }}
          />
        );
      })}
    </>
  );
}

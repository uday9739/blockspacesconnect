// debounceEvent is a method to delay and control execution of browser events
export const debounceEvent = (updateCallback, setState, setAssets) => {
  const optionsCallback: IdleRequestOptions = { timeout: 200 };
  const update = () => updateCallback(setState(setAssets));
  const cb = () => requestAnimationFrame(update);
  const rIC = () => cb();

  rIC();
};

const setDisplayName = (component, on) => {
  return (component.displayName = `${getDisplayName(component)}(${getDisplayName(on)})`);
};

const mergeRefs = (...refs) => {
  return (node) => {
    for (const ref of refs) {
      ref.current = node;
    }
  };
};

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || "Component";
}

export type PropsAreEqual<P> = (prevProps: Partial<P>, nextProps: Partial<P>) => boolean;

// `isEqual` does a shallow comparison of two objects
export const isEqual = (object1, object2) =>
{
  if (Object.keys(object1).length > 0) {
    for (const key in object1) {
      if (object1[key] !== object2[key]) {
        return false;
      }
    }
  } else {
    return false;
  }
  return true;
};

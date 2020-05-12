import { useEffect, useState } from "react";
import { throttle } from "lodash";

const useWindowResize = (callback) => {
  const [width, setWidth] = useState(window.innerWidth);
  const [height, setHeight] = useState(window.innerHeight);
  const throttledHandleResize = throttle(handleResize, 200);

  useEffect(() => {
    window.addEventListener("resize", throttledHandleResize);
    return () => window.removeEventListener("resize", throttledHandleResize);
  }, []);

  function handleResize() {
    setWidth(window.innerWidth);
    setHeight(window.innerHeight);
    if (callback) {
      callback();
    }
  }

  return [width, height];
};

export default useWindowResize;

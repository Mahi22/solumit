import { useState, useCallback, useLayoutEffect } from "react";

function getDimensionObject(node, selector) {
  const rect = node.getBoundingClientRect();

  return {
      [`${selector}Width`]: rect.width,
      [`${selector}Height`]: rect.height,
      [`${selector}Top`]: "x" in rect ? rect.x : rect.top,
      [`${selector}Left`]: "y" in rect ? rect.y : rect.left,
      [`${selector}x`]: "x" in rect ? rect.x : rect.left,
      [`${selector}y`]: "y" in rect ? rect.y : rect.top,
      [`${selector}Right`]: rect.right,
      [`${selector}Bottom`]: rect.bottom
  };
}

function useDimensions({
  liveMeasure = true,
  selector = 'el'
} = {}) {
  const [dimensions, setDimensions] = useState({});
  const [node, setNode] = useState(null);

  const ref = useCallback(node => {
      setNode(node);
  }, []);

  useLayoutEffect(() => {
      if (node) {
          const measure = () =>
              window.requestAnimationFrame(() =>
                  setDimensions(getDimensionObject(node, selector))
              );
          measure();

          if (liveMeasure) {
              window.addEventListener("resize", measure);
              window.addEventListener("scroll", measure);

              return () => {
                  window.removeEventListener("resize", measure);
                  window.removeEventListener("scroll", measure);
              };
          }
      }
  }, [liveMeasure, node, selector]);

  return [ref, dimensions, node];
}

export default useDimensions;

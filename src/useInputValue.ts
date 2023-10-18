import { useState, useCallback } from "react";

function useInputValue(initialValue) {
  let [value, setValue] = useState(initialValue);
  let onChange = useCallback(function(event) {
    setValue(event.currentTarget.value);
  }, []);

  return {
    value,
    onChange
  };
}

export { useInputValue }

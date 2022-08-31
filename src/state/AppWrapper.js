import React, { useReducer,useMemo } from "react";
import reducer from "./reducer";
import { initialState, AppContext } from "./context";

export default function AppWrapper({ children }) {
  const [ state, dispatch ] = useReducer(reducer, initialState);

  const contextValue = useMemo(() => {
   return { state, dispatch };
}, [state, dispatch]);

  return (
  <AppContext.Provider value={contextValue}>
     {children}
  </AppContext.Provider>
  );
}

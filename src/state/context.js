import { createContext, useContext} from "react";

export const initialState = {
  currentAttributeId:0,
  currentLayerId:0,
  originalData:[],
  organizeData: [],
  currentLayers: [],
  currentAttributes: [],
  sourceZip:'',
  collection:{
    collectionName:'',
    total:10,
    mintType:0,
    creator:'',
    mintPrice:1,
    royalties:"5%",
    description:'',
    whiteList:[],
    mintStart:'',
    premintEnd:'',
  },
  loading:false
}

export const AppContext = createContext(initialState);
export function useAppContext() {
   return useContext(AppContext);
}

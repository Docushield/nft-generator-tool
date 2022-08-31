import * as actionTypes from "./actions";
const reducer = (state, action) => {
  switch (action.type) {
    case actionTypes.UPDATE_CURRENT_ATTRIBUTE_ID: {
      return { ...state, currentAttributeId: action.payload };
    }
    case actionTypes.UPDATE_CURRENT_LAYER_ID: {
      return { ...state, currentLayerId: action.payload };
    }
    case actionTypes.CREATE_ORIGINAL_DATA: {
      console.log("CREATE_ORIGINAL_DATA:", action.payload);
      return { ...state, originalData: action.payload };
    }
    case actionTypes.CREATE_ORGANIZE_DATA: {
      console.log("CREATE_ORGANIZE_DATA:", action.payload);
      return { ...state, organizeData: action.payload };
    }
    case actionTypes.UPDATE_ORGANIZE_DATA: {
      return { ...state, organizeData: action.payload };
    }
    case actionTypes.UPDATE_CURRENT_LAYERS: {
      return { ...state, currentLayers: action.payload };
    }
    case actionTypes.UPDATE_CURRENT_ATTRIBUTES: {
      return { ...state, currentAttributes: action.payload };
    }
    case actionTypes.UPDATE_COLLECTION: {
      return { ...state, collection: action.payload };
    }
    case actionTypes.GET_SOURCE_ZIP_FILE: {
      return { ...state, sourceZip: action.payload };
    }
    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
};

export default reducer;

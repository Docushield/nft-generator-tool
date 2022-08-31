export const UPDATE_CURRENT_ATTRIBUTE_ID = "UPDATE_CURRENT_ATTRIBUTE_ID";
export const UPDATE_CURRENT_LAYER_ID = "UPDATE_CURRENT_LAYER_ID";
export const CREATE_ORIGINAL_DATA = "CREATE_ORIGINAL_DATA"
export const CREATE_ORGANIZE_DATA = "CREATE_ORGANIZE_DATA";
export const UPDATE_ORGANIZE_DATA = "UPDATE_ORGANIZE_DATA"
export const UPDATE_CURRENT_LAYERS = "UPDATE_CURRENT_LAYERS"
export const UPDATE_CURRENT_ATTRIBUTES = "UPDATE_CURRENT_ATTRIBUTES"
export const UPDATE_COLLECTION = "UPDATE_COLLECTION"
export const GET_SOURCE_ZIP_FILE = "GET_SOURCE_ZIP_FILE"


export const updateCurrentAttributeId = (attrId) => ({
  type: UPDATE_CURRENT_ATTRIBUTE_ID,
  payload:attrId,
});

export const updateCurrentLayerId = (layerId) => ({
  type: UPDATE_CURRENT_LAYER_ID,
  payload:layerId,
});

export const createOriginalData = (originalData) => ({
  type: CREATE_ORIGINAL_DATA,
  payload: originalData,
});

export const createOrganizeData = (organizeData) => ({
  type: CREATE_ORGANIZE_DATA,
  payload: organizeData,
});
export const updateOrganizeData = (organizeData) => ({
  type: UPDATE_ORGANIZE_DATA,
  payload: organizeData,
});
export const updateCurrentLayers = (layers) => ({
  type: UPDATE_CURRENT_LAYERS,
  payload:layers
});
export const updateCurrentAttributes = (attributes) => ({
  type: UPDATE_CURRENT_ATTRIBUTES,
  payload:attributes
});

export const updateCollection = (collection) => ({
  type: UPDATE_COLLECTION,
  payload:collection
});

export const getSourceZipFile = (zipFile) => ({
  type: GET_SOURCE_ZIP_FILE,
  payload:zipFile
});

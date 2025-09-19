import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ObjectKey, PropertyItem } from "../../app/dashboard/[step]/components/types/propertyTypes";

interface PropertiesState {
  customProperties: Record<ObjectKey, PropertyItem[]>;
}

const initialState: PropertiesState = {
  customProperties: {
    contacts: [],
    companies: [],
    deals: [],
    tickets: [],
  },
};

const propertiesSlice = createSlice({
  name: "properties",
  initialState,
  reducers: {
    setCustomProperties: (
      state,
      action: PayloadAction<Record<ObjectKey, PropertyItem[]>>
    ) => {
      state.customProperties = {
        ...state.customProperties,
        ...action.payload,
      };
    },
    clearCustomProperties: (state) => {
      state.customProperties = initialState.customProperties;
    },
  },
});

export const { setCustomProperties, clearCustomProperties } = propertiesSlice.actions;
export default propertiesSlice.reducer;

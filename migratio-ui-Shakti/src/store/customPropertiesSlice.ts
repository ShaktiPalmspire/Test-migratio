import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// objects: contacts, companies, deals, tickets
export type PropertyItem = {
  name: string;
  label: string;
  type: string;
  fieldType: string;
};

export type CustomPropertiesState = {
  contacts: PropertyItem[];
  companies: PropertyItem[];
  deals: PropertyItem[];
  tickets: PropertyItem[];
};

const initialState: CustomPropertiesState = {
  contacts: [],
  companies: [],
  deals: [],
  tickets: [],
};

const customPropertiesSlice = createSlice({
  name: "customProperties",
  initialState,
  reducers: {
    // payload can include any subset of the 4 keys; we merge them
    setCustomProperties: (
      state,
      action: PayloadAction<Partial<CustomPropertiesState>>
    ) => {
      if (action.payload.contacts) state.contacts = action.payload.contacts;
      if (action.payload.companies) state.companies = action.payload.companies;
      if (action.payload.deals) state.deals = action.payload.deals;
      if (action.payload.tickets) state.tickets = action.payload.tickets;
    },
    resetCustomProperties: () => initialState,
  },
});

export const { setCustomProperties, resetCustomProperties } =
  customPropertiesSlice.actions;

export default customPropertiesSlice.reducer;

import {
  configureStore,
  combineReducers,
  createAction,
  AnyAction,
} from '@reduxjs/toolkit';

import contactsReducer from './slices/contactsSlice';
import companiesReducer from './slices/companiesSlice';
import dealsReducer from './slices/dealsSlice';
import ticketsReducer from './slices/ticketsSlice';

const appReducer = combineReducers({
  contacts: contactsReducer,
  companies: companiesReducer,
  deals: dealsReducer,
  tickets: ticketsReducer,
});

// optional global reset
export const resetApp = createAction('app/reset');

const rootReducer = (
  state: ReturnType<typeof appReducer> | undefined,
  action: AnyAction
) => {
  if (resetApp.match(action)) state = undefined;
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
  devTools: process.env.NODE_ENV !== 'production', // ✅ ensure DevTools integration
  middleware: (getDefault) =>
    getDefault({
      serializableCheck: {
        ignoredActions: ['contacts/setContactsCache'],
        ignoredActionPaths: ['payload.timestamp'],
        ignoredPaths: ['contacts.lastFetchTime'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// (debug helper) so you can test in console
if (typeof window !== 'undefined') (window as any).store = store;

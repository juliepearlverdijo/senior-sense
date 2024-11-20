import { configureStore, Tuple } from "@reduxjs/toolkit";
import ConversationReducer from "./features/conversation-slice";
import HistoryReducer from "./features/history-slice";
import { TypedUseSelectorHook, useSelector } from "react-redux";
import storage from "redux-persist/lib/storage";
import thunk from 'redux-thunk';
import { combineReducers } from "@reduxjs/toolkit";
import { persistReducer, persistStore, FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER, } from "redux-persist";



const persistConfig = {
  key: "root",
  version: 1,
  storage,
};

const reducer = combineReducers({
  ConversationReducer,
  HistoryReducer
});

const persistedReducer = persistReducer(persistConfig, reducer);



export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

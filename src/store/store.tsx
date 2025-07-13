"use client";

import { Provider } from "react-redux";
import { ReactNode } from "react";
import { store } from "./slice";

export default function ReduxStoreProvider({
  children,
}: {
  children: ReactNode;
}) {
  return <Provider store={store}>{children}</Provider>;
}

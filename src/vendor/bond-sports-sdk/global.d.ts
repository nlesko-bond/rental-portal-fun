import type * as BondSportsSdkModule from "./index";

declare global {
  interface Window {
    BondSportsSdk?: typeof BondSportsSdkModule;
  }
}

export {};

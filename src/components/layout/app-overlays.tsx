"use client";

import { Toaster } from "../ui/toaster";
import { CartDrawer } from "./cart-drawer";
import { CompareTray } from "./compare-tray";
import { SearchCommand } from "./search-command";

/** Global overlays mounted once in the root layout. */
export function AppOverlays() {
  return (
    <>
      <SearchCommand />
      <CartDrawer />
      <CompareTray />
      <Toaster />
    </>
  );
}

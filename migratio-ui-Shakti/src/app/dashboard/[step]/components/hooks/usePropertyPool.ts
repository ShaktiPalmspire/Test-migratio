"use client";

import { useState } from "react";
import type { ObjectKey, PropertyItem } from "../types/propertyTypes";

/**
 * Local state holder for property lists shown in Step 4.
 * Not Redux — simple and predictable to reduce errors.
 */
export function usePropertyPool() {
  const [propPool, setPropPool] = useState<Record<ObjectKey, PropertyItem[]>>({
    contacts: [],
    companies: [],
    deals: [],
    tickets: [],
  });

  const [loadedLists, setLoadedLists] = useState<Record<ObjectKey, boolean>>({
    contacts: false,
    companies: false,
    deals: false,
    tickets: false,
  });

  /**
   * Accepts either an array OR a record of arrays.
   * loadProps(obj, defaultMapModal, ...)  ✅
   * loadProps(obj, someArray, ...)        ✅
   */
  const loadProps = (
    objectType: ObjectKey,
    listOrMap: PropertyItem[] | Record<ObjectKey, PropertyItem[]>,
    _defaultMetaByName?: Record<
      ObjectKey,
      Record<string, { type?: string; fieldType?: string }>
    >
  ) => {
    const list = Array.isArray(listOrMap) ? listOrMap : (listOrMap[objectType] ?? []);
    setPropPool((prev) => ({ ...prev, [objectType]: list }));
    setLoadedLists((prev) => ({ ...prev, [objectType]: true }));
  };

  return { propPool, loadedLists, loadProps, setPropPool };
}

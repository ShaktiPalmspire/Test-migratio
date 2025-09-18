import { ObjectKey, PropertyItem, PropPoolState } from '../types/propertyTypes';

export const slugify = (s: string): string => {
  if (!s) return "";
  
  const result = s.toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/^(\d)/, "_$1");
  
  console.log('🔧 [SLUGIFY] Input:', s, '→ Output:', result);
  return result;
};

export const getDisplayText = (val: any): string => {
  if (!val) return "";
  if (typeof val === "string" || typeof val === "number") return String(val);
  if (typeof val === "object") {
    return val.label || val.title || val.displayName || val.name || val.value || "";
  }
  return "";
};

export const getPropertyLabel = (object: ObjectKey, internalName: string, labelMap: Record<ObjectKey, Record<string, string>>): string =>
  labelMap[object]?.[internalName] || internalName;

export const getInternalNameForLabel = (
  object: ObjectKey, 
  label: string, 
  propPool: PropPoolState,
  defaultMapModal: Record<ObjectKey, PropertyItem[]>
): string | undefined => {
  try {
    if (!label) {
      console.warn('⚠️ [GET_INTERNAL_NAME] Empty label provided');
      return undefined;
    }
    
    const list = (propPool?.[object] ?? defaultMapModal[object]) as PropertyItem[];
    
    if (!list || !Array.isArray(list)) {
      console.warn('⚠️ [GET_INTERNAL_NAME] No property list available for:', object);
      return slugify(label);
    }

    // Try multiple matching strategies
    let found = list.find((p) => p.label === label);  // Exact label match first
    if (!found) {
      found = list.find((p) => p.name === label);     // Then try name match
    }
    if (!found) {
      found = list.find((p) => (p.label || p.name) === label); // Original logic as fallback
    }

    console.log('🔍 [GET_INTERNAL_NAME] Looking for label:', label, 'in object:', object);
    console.log('🔍 [GET_INTERNAL_NAME] List length:', list?.length);
    console.log('🔍 [GET_INTERNAL_NAME] Found match:', found ? { label: found.label, name: found.name } : 'none');

    // If not found, generate proper internal name from label
    if (!found?.name) {
      console.warn('⚠️ [GET_INTERNAL_NAME] Property not found, using slugified fallback for:', label);
      const slugifiedFallback = slugify(label);
      console.log('🔧 [GET_INTERNAL_NAME] Generated fallback:', label, '→', slugifiedFallback);
      return slugifiedFallback;
    }

    return found.name;
  } catch (error) {
    console.error('❌ [GET_INTERNAL_NAME] Error:', error);
    const slugifiedFallback = slugify(label);
    console.log('🔧 [GET_INTERNAL_NAME] Error fallback:', label, '→', slugifiedFallback);
    return slugifiedFallback;
  }
};

export const validateInternalName = (name: string, obj: ObjectKey, propPool: PropPoolState, defaultMapModal: Record<ObjectKey, PropertyItem[]>): string => {
  if (!name || !name.trim()) {
    return "Internal name is required";
  }
  
  const list = (propPool[obj] ?? defaultMapModal[obj]) as PropertyItem[];
  const existing = new Set(list?.map((p) => p.name) || []);

  if (!/^[a-z0-9_]+$/.test(name)) {
    return "Internal name can only contain lowercase letters, numbers, and underscores";
  }

  if (existing.has(name)) {
    return "This internal name already exists";
  }

  return "";
};

export const ensureUniqueName = (base: string, obj: ObjectKey, propPool: PropPoolState, defaultMapModal: Record<ObjectKey, PropertyItem[]>): string => {
  const list = (propPool[obj] ?? defaultMapModal[obj]) as PropertyItem[];
  const existing = new Set(list?.map((p) => p.name) || []);
  let candidate = base || "new_property";
  let i = 1;
  while (existing.has(candidate)) candidate = `${base}_${i++}`;
  return candidate;
};

export const fixCorruptedProperties = (list: PropertyItem[]): PropertyItem[] => {
  if (!list || !Array.isArray(list)) {
    console.warn('⚠️ [FIX_CORRUPTED] Invalid list provided:', list);
    return [];
  }
  
  return list.map(prop => {
    if (!prop || typeof prop !== 'object') {
      console.warn('⚠️ [FIX_CORRUPTED] Invalid property:', prop);
      return prop;
    }
    
    // Check multiple corruption patterns
    const isCorrupted = (
      (prop.name === prop.label && /[A-Z\s]/.test(prop.name)) || // name === label with spaces/caps
      (/[A-Z\s]/.test(prop.name) && prop.name.includes(' ')) ||   // name has spaces (should be slugified)
      (prop.name.includes(' ') && !prop.name.includes('_'))      // spaces without underscores
    );

    if (isCorrupted) {
      const fixedName = slugify(prop.label || prop.name);
      console.log('🔧 [FIX_CORRUPTED] Fixing corrupted property:');
      console.log('🔧 [FIX_CORRUPTED] Original:', { name: prop.name, label: prop.label });
      console.log('🔧 [FIX_CORRUPTED] Fixed name:', fixedName);
      return { ...prop, name: fixedName };
    }
    return prop;
  });
};

export const norm = (v?: string): string => (v || "").toString().trim().toLowerCase();

export const getTotalPropertiesCount = (objectType: ObjectKey, hubspotContactProperties: any[], hubspotCompanyProperties: any[], hubspotDealProperties: any[], hubspotTicketProperties: any[]): number => {
  switch (objectType) {
    case "contacts":
      return hubspotContactProperties?.length || 0;
    case "companies":
      return hubspotCompanyProperties?.length || 0;
    case "deals":
      return hubspotDealProperties?.length || 0;
    case "tickets":
      return hubspotTicketProperties?.length || 0;
    default:
      return 0;
  }
};

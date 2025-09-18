import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from "react";
import {
  PreviewRow,
  ObjectKey,
  PendingJsonState,
  PropertyItem,
} from "../types/propertyTypes";
import { StepIndex } from "../../types/dashboard";
import Button from "@/components/Buttons/button";
import {
  hubspotContactProperties,
  hubspotCompanyProperties,
  hubspotDealProperties,
  hubspotTicketProperties,
  HubSpotDefaultProperty,
} from "@/context/hubspotdefaultproperties";

interface PropertyTableProps {
  rows: PreviewRow[];
  filteredRows: PreviewRow[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  editingRow: number | null;
  editForm: { target: string };
  onEditChange: (field: "target", value: string) => void;
  onStartEditing: (index: number, row: PreviewRow) => void;
  onSaveEditing: (index: number) => void;
  onCancelEditing: () => void;
  onDeleteUserDefined: (index: number) => void;
  onReverseCustomProperty?: (index: number) => void;
  selectedObjects: Set<ObjectKey>;
  onAddProperty?: () => void;
  onRowUpdate?: (index: number, updatedRow: PreviewRow) => void;
  setRows: (rows: PreviewRow[]) => void;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
  setPendingJson: (
    updater: (prev: PendingJsonState) => PendingJsonState
  ) => void;
  propPool?: Record<ObjectKey, PropertyItem[]>;
  defaultMapModal?: Record<ObjectKey, PropertyItem[]>;
}

/* =========================
Helpers for default props
========================= */

const getPropertiesForObject = (
  objectType: ObjectKey
): HubSpotDefaultProperty[] => {
  switch (objectType) {
    case "contacts":
      return hubspotContactProperties;
    case "companies":
      return hubspotCompanyProperties;
    case "deals":
      return hubspotDealProperties;
    case "tickets":
      return hubspotTicketProperties;
    default:
      return [];
  }
};

// Source property type (HubSpot schema type)
const getSourcePropertyType = (
  sourcePropertyName: string,
  objectType: ObjectKey
): string | undefined => {
  const properties = getPropertiesForObject(objectType);
  const sourceProperty = properties.find(
    (prop) =>
      prop.label === sourcePropertyName || prop.name === sourcePropertyName
  );
  return sourceProperty?.type;
};

// Source property fieldType (HubSpot UI field type)
const getSourceFieldType = (
  sourcePropertyName: string,
  objectType: ObjectKey
): string | undefined => {
  const properties = getPropertiesForObject(objectType);
  const sourceProperty = properties.find(
    (prop) =>
      prop.label === sourcePropertyName || prop.name === sourcePropertyName
  );
  return sourceProperty?.fieldType;
};

/* ==============================
Target Property Dropdown (UI)
============================== */

const TargetPropertyDropdown: React.FC<{
  value: string;
  onChange: (value: string) => void;
  objectType: ObjectKey;
  sourcePropertyType?: string;
  sourceFieldType?: string;
  placeholder?: string;
  userDefinedProperties?: string[];
  disabled?: boolean;
  propPool?: Record<ObjectKey, PropertyItem[]>;
  defaultMapModal?: Record<ObjectKey, PropertyItem[]>;
  rowIndex?: number;
  totalRows?: number;
}> = ({
  value,
  onChange,
  objectType,
  sourcePropertyType,
  sourceFieldType,
  placeholder = "Select property...",
  userDefinedProperties = [],
  disabled = false,
  propPool,
  rowIndex,
  totalRows,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  // const [openUpwards, setOpenUpwards] = useState(false);
  const isLastSix =
    totalRows && rowIndex !== undefined && rowIndex >= totalRows - 6;
  // Get default properties

  // Combine defaults + user-defined (user-defined carry current source types)
  const properties = useMemo(() => {
    const defaultProps = getPropertiesForObject(objectType);
    const customProps = (propPool?.[objectType] || []) as PropertyItem[];

    // FIX HERE 👇 keep real type/fieldType for custom
    const userDefined = (userDefinedProperties || []).map((name) => {
      const match = customProps.find((c) => c.name === name);
      return {
        name,
        label: name,
        type: match?.type || sourcePropertyType || "string",
        fieldType: match?.fieldType || sourceFieldType || "text",
        required: false,
      };
    }) as PropertyItem[];

    const merged = [...defaultProps, ...customProps, ...userDefined];
    return merged.filter(
      (p, i, self) => self.findIndex((x) => x.name === p.name) === i
    );
  }, [
    objectType,
    propPool,
    userDefinedProperties,
    sourcePropertyType,
    sourceFieldType,
  ]);

  // Filter: same type + same fieldType + not required
  const filteredProperties = useMemo(() => {
    return properties.filter((p: any) => {
      const notRequired = p.required !== true; // include when false/undefined

      // ✅ STRICT TYPE FILTERING - Only show if both type AND fieldType match
      if (sourcePropertyType && sourceFieldType) {
        const typeMatches = p.type === sourcePropertyType;
        const fieldMatches = p.fieldType === sourceFieldType;
        return notRequired && typeMatches && fieldMatches;
      }

      // If no source type info, show all non-required
      return notRequired;
    });
  }, [properties, sourcePropertyType, sourceFieldType]);

  // Apply search term to filtered list
  const searchedList = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return filteredProperties;
    return filteredProperties.filter((p: any) =>
      (p.label || p.name).toLowerCase().includes(q)
    );
  }, [filteredProperties, searchTerm]);

  // Current value (value may be internal name or label)
  const currentProperty = useMemo(() => {
    let prop =
      properties.find((p) => p.name === value) ||
      properties.find((p) => p.label === value);

    if (!prop && userDefinedProperties.includes(value)) {
      prop = {
        name: value,
        label: value,
        type: sourcePropertyType || "string",
        fieldType: sourceFieldType || "text",
        required: false,
      } as any;
    }
    return prop;
  }, [
    properties,
    value,
    userDefinedProperties,
    sourcePropertyType,
    sourceFieldType,
  ]);

  // Auto flip dropdown if not enough space
  // const recalcDirection = useCallback(() => {
  //   const el = triggerRef.current;
  //   if (!el) return;
  //   const rect = el.getBoundingClientRect();
  //   const spaceBelow = window.innerHeight - rect.bottom;
  //   const spaceAbove = rect.top;
  //   const needed = 320;
  //   setOpenUpwards(spaceBelow < needed && spaceAbove > spaceBelow);
  // }, []);

  // useEffect(() => {
  //   if (!isOpen) return;
  //   // recalcDirection();
  //   // const onScrollOrResize = () => recalcDirection();
  //   window.addEventListener("scroll", onScrollOrResize, true);
  //   window.addEventListener("resize", onScrollOrResize);
  //   return () => {
  //     window.removeEventListener("scroll", onScrollOrResize, true);
  //     window.removeEventListener("resize", onScrollOrResize);
  //   };
  // }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
        setSelectedIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard nav
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;
      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setSelectedIndex((prev) =>
            prev < searchedList.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          event.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : searchedList.length - 1
          );
          break;
        case "Enter":
          event.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < searchedList.length) {
            handleSelect(searchedList[selectedIndex] as HubSpotDefaultProperty);
          }
          break;
        case "Escape":
          event.preventDefault();
          setIsOpen(false);
          setSearchTerm("");
          setSelectedIndex(-1);
          break;
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, searchedList, selectedIndex]);

  const handleSelect = (prop: HubSpotDefaultProperty) => {
    // store internal name; UI shows label via currentProperty
    onChange(prop.name);
    setIsOpen(false);
    setSearchTerm("");
    setSelectedIndex(-1);
  };

  if (properties.length === 0) {
    return (
      <div className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-50 text-gray-500">
        Loading properties...
      </div>
    );
  }

  return (
    <div className="relative overflow-visible" ref={dropdownRef}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() =>
          !disabled &&
          setIsOpen((o) => {
            const n = !o;
            // if (!o) recalcDirection();
            return n;
          })
        }
        disabled={disabled}
        className={`w-full px-3 py-2 text-left border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          disabled
            ? "bg-gray-100 cursor-not-allowed text-gray-900-important"
            : "bg-white hover:bg-gray-50"
        }`}
      >
        {currentProperty ? currentProperty.label : value || placeholder}
        {disabled ? (
          <svg
            className="w-5 h-5 ml-2 float-right"
            fill="#1447e6"
            viewBox="0 0 24 24"
          >
            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM15.1 8H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
          </svg>
        ) : (
          <svg
            className="w-5 h-5 ml-2 float-right"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        )}
      </button>

      {isOpen && (
        <div
          className={`absolute z-20 w-full bg-white border border-gray-300 rounded-md shadow-lg ${
            isLastSix ? "bottom-full mb-1" : "mt-5"
          }`}
          style={{ maxHeight: 320 }}
        >
          <div className="p-2 border-b border-gray-200">
            <input
              type="text"
              placeholder="Search properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
              className="w-full px-2 py-1 text-sm border border-gray-200 rounded placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="max-h-64 overflow-y-auto">
            {searchedList.map((prop, index) => {
              const isSelected =
                (!!currentProperty && prop.name === currentProperty.name) ||
                prop.label === value ||
                prop.name === value;

              return (
                <button
                  key={prop.name}
                  type="button"
                  onClick={() => handleSelect(prop as HubSpotDefaultProperty)}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 focus:outline-none focus:bg-gray-100 ${
                    index === selectedIndex ? "bg-gray-100" : ""
                  } ${
                    isSelected ? "bg-blue-50 text-blue-700" : "text-gray-900"
                  }`}
                >
                  <div className="font-medium">{(prop as any).label}</div>
                  <div className="text-xs text-gray-500">
                    {(prop as any).type} • {(prop as any).fieldType}
                    {(prop as any).required ? " • required" : ""}
                  </div>
                </button>
              );
            })}
            {searchedList.length === 0 && (
              <div className="px-3 py-2 text-sm text-gray-500">
                No properties found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* =======================
Property Table Wrapper
======================= */

export const PropertyTable: React.FC<PropertyTableProps> = ({
  rows,
  filteredRows,
  editingRow,
  editForm,
  onEditChange,
  onDeleteUserDefined,
  onReverseCustomProperty,
  onAddProperty,
  onRowUpdate,
  propPool,
  defaultMapModal,
}) => {
  // Collect user-defined properties by object to surface in dropdown
  const userDefinedProperties = useMemo(() => {
    const result: Record<ObjectKey, string[]> = {
      contacts: [],
      companies: [],
      deals: [],
      tickets: [],
    };
    rows
      .filter((row) => row.type === "userdefined")
      .forEach((row) => {
        if (result[row.object] && !result[row.object].includes(row.source)) {
          result[row.object].push(row.source);
        }
      });
    return result;
  }, [rows]);

  // Filter out custom props that duplicate a user-defined (same object+name)
  const filteredRowsWithoutDuplicates = useMemo(() => {
    const userDefinedByObject: Record<ObjectKey, Set<string>> = {
      contacts: new Set(),
      companies: new Set(),
      deals: new Set(),
      tickets: new Set(),
    };
    rows
      .filter((row) => row.type === "userdefined")
      .forEach((row) => userDefinedByObject[row.object].add(row.source));

    return filteredRows.filter((row) => {
      if (row.type === "custom") {
        return !userDefinedByObject[row.object].has(row.source);
      }
      return true;
    });
  }, [filteredRows, rows]);

  // Split in visual groups (keeps editing index stable)
  const groups = useMemo(() => {
    return {
      default: filteredRowsWithoutDuplicates.filter(
        (r) => r.type === "default"
      ),
      userdefined: filteredRowsWithoutDuplicates.filter(
        (r) => r.type === "userdefined"
      ),
      custom: filteredRowsWithoutDuplicates.filter((r) => r.type === "custom"),
    };
  }, [filteredRowsWithoutDuplicates]);

  // Render a row (shared)
  const renderRow = (row: PreviewRow) => {
    const idx = filteredRowsWithoutDuplicates.indexOf(row);
    let sourceType = getSourcePropertyType(row.source, row.object);
    let sourceFieldType = getSourceFieldType(row.source, row.object);

    // If it's a custom property, use its actual type/fieldType
    if (row.type === "custom") {
      const customProp = (propPool?.[row.object] || []).find(
        (p) => p.name === row.source || p.label === row.source
      );
      if (customProp) {
        sourceType = customProp.type || sourceType;
        sourceFieldType = customProp.fieldType || sourceFieldType;
      }
    }

    const sourceProperty = getPropertiesForObject(row.object).find(
      (prop) => prop.label === row.source || prop.name === row.source
    );
    const isRequired = sourceProperty?.required === true;
    return (
      <tr key={`${row.object}|${row.source}|${idx}`}>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
          {row.source}
          {(() => {
            const sourceProperty = getPropertiesForObject(row.object).find(
              (prop) => prop.label === row.source || prop.name === row.source
            );
            return sourceProperty?.required ? (
              <span className="text-red-500 ml-1">*</span>
            ) : null;
          })()}
        </td>
        <td className="px-3 py-4 text-sm text-gray-500">
          {editingRow === idx ? (
            <div className="flex items-center gap-2">
              <TargetPropertyDropdown
                value={editForm.target}
                onChange={(value) => onEditChange("target", value)}
                objectType={row.object}
                sourcePropertyType={sourceType}
                sourceFieldType={sourceFieldType}
                placeholder="Select target property..."
                userDefinedProperties={userDefinedProperties[row.object]}
                disabled={isRequired}
                propPool={propPool}
                defaultMapModal={defaultMapModal}
                rowIndex={idx}
                totalRows={filteredRowsWithoutDuplicates.length}
              />
            </div>
          ) : (
            <TargetPropertyDropdown
              value={row.target}
              onChange={(value) => {
                const updatedRow = { ...row, target: value };
                onRowUpdate?.(idx, updatedRow);
              }}
              objectType={row.object}
              sourcePropertyType={sourceType}
              sourceFieldType={sourceFieldType}
              placeholder="Select target property..."
              userDefinedProperties={userDefinedProperties[row.object]}
              disabled={isRequired}
              propPool={propPool}
              defaultMapModal={defaultMapModal}
              rowIndex={idx}
              totalRows={filteredRowsWithoutDuplicates.length}
            />
          )}
        </td>

        <td className="px-3 py-4 text-sm text-gray-500 capitalize">
          {row.object}
        </td>

        <td className="px-3 py-4 text-sm text-gray-500">
          <span
            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              row.type === "default"
                ? "bg-green-100 text-green-800"
                : row.type === "custom"
                ? "bg-blue-100 text-blue-800"
                : "bg-purple-100 text-purple-800"
            }`}
          >
            {row.type}
          </span>
        </td>

        <td className="px-3 py-4 text-sm font-medium">
          <div className="flex space-x-2">
            {row.type === "userdefined" && (
              <button
                onClick={() => onDeleteUserDefined(idx)}
                className="text-red-600 hover:text-red-900"
              >
                Delete
              </button>
            )}
            {/* Reset button - Simple version */}
            {!isRequired &&
              row.type !== "userdefined" &&
              row.source !== row.target && (
                <button
                  onClick={() => {
                    // Simple approach - just call onRowUpdate
                    const updatedRow = { ...row, target: row.source };
                    onRowUpdate?.(idx, updatedRow);

                    // Also call reverse function if available
                    onReverseCustomProperty?.(idx);
                  }}
                  className="p-1 text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded"
                  title="Reset target to source"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
                  </svg>
                </button>
              )}

            {!isRequired && (
              <button
                onClick={() => onDeleteUserDefined(idx)}
                className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                title="Remove property"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                </svg>
              </button>
            )}
          </div>
        </td>
      </tr>
    );
  };

  const Section = ({ data }: { data: PreviewRow[] }) => {
    if (data.length === 0) return null;
    return <>{data.map(renderRow)}</>;
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Property Mappings
          </h3>
          {onAddProperty && (
            <button
              onClick={onAddProperty}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              + Add Property
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source Property
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Target Property
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Object Type
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              <Section data={groups.default} />
              <Section data={groups.userdefined} />
              <Section data={groups.custom} />
            </tbody>
          </table>
        </div>

        {filteredRowsWithoutDuplicates.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">
              No properties found. Try adjusting your search or add new
              properties.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

/* ==================
Search & Summary
================== */

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
}) => (
  <div className="mb-4 flex items-center gap-3">
    <input
      type="text"
      placeholder="Search properties..."
      value={searchQuery}
      onChange={(e) => onSearchChange(e.target.value)}
      className="w-full md:w-96 px-3 py-2 border border-gray-300 rounded-md text-sm"
    />
    {searchQuery && (
      <button
        onClick={() => onSearchChange("")}
        className="text-xs text-gray-600 underline"
      >
        Clear
      </button>
    )}
  </div>
);

interface SummarySectionProps {
  filteredRows: PreviewRow[];
  selectedObjects: Set<ObjectKey>;
  canProceed: boolean;
  hasUnsavedChanges: boolean;
  onStepChange: (step: StepIndex) => void;
  defaultProperties?: {
    contacts: any[];
    companies: any[];
    deals: any[];
    tickets: any[];
  };
}

export const SummarySection: React.FC<SummarySectionProps> = ({
  filteredRows,
  selectedObjects,
  canProceed,
  hasUnsavedChanges,
  onStepChange,
}) => {
  // Filter out custom properties that have the same name as user-defined properties
  const filteredRowsWithoutDuplicates = useMemo(() => {
    const userDefinedPropertyNamesByObject: Record<ObjectKey, Set<string>> = {
      contacts: new Set(),
      companies: new Set(),
      deals: new Set(),
      tickets: new Set(),
    };
    filteredRows
      .filter((row) => row.type === "userdefined")
      .forEach((row) => {
        userDefinedPropertyNamesByObject[row.object].add(row.source);
      });

    return filteredRows.filter((row) => {
      if (row.type === "custom") {
        return !userDefinedPropertyNamesByObject[row.object].has(row.source);
      }
      return true;
    });
  }, [filteredRows]);

  // Default counts from static lists (fast)
  const defaultCountsMap: Record<ObjectKey, number> = {
    contacts: hubspotContactProperties.length,
    companies: hubspotCompanyProperties.length,
    deals: hubspotDealProperties.length,
    tickets: hubspotTicketProperties.length,
  };

  const getDefaultCount = (objectType: ObjectKey) =>
    defaultCountsMap[objectType] || 0;
  const getTotalDefaultCount = () =>
    Object.values(defaultCountsMap).reduce((a, b) => a + b, 0);
  const getTotalCustomCount = () =>
    filteredRowsWithoutDuplicates.filter((r) => r.type === "custom").length;
  const getTotalUserDefinedCount = () =>
    filteredRowsWithoutDuplicates.filter((r) => r.type === "userdefined")
      .length;
  const getTotalCount = () =>
    getTotalDefaultCount() + getTotalCustomCount() + getTotalUserDefinedCount();
  const getCustomCount = (objectType: ObjectKey) =>
    filteredRowsWithoutDuplicates.filter(
      (r) => r.object === objectType && r.type === "custom"
    ).length;
  const getUserDefinedCount = (objectType: ObjectKey) =>
    filteredRowsWithoutDuplicates.filter(
      (r) => r.object === objectType && r.type === "userdefined"
    ).length;
  const getObjectTotal = (objectType: ObjectKey) =>
    getDefaultCount(objectType) +
    getCustomCount(objectType) +
    getUserDefinedCount(objectType);

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Summary</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
        <div>
          <span className="font-medium">Total Properties:</span>{" "}
          {getTotalCount()}
        </div>
        <div>
          <span className="font-medium">Default:</span> {getTotalDefaultCount()}
        </div>
        <div>
          <span className="font-medium">Custom:</span> {getTotalCustomCount()}
        </div>
        <div>
          <span className="font-medium">userdefined:</span>{" "}
          {getTotalUserDefinedCount()}
        </div>
      </div>

      <div className="border-t pt-3">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">
          Breakdown by Object Type
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from(selectedObjects)
            .sort((a, b) => {
              const order = {
                contacts: 0,
                companies: 1,
                deals: 2,
                tickets: 3,
              } as Record<ObjectKey, number>;
              return order[a] - order[b];
            })
            .map((objectType) => {
              const defaultProps = getDefaultCount(objectType);
              const customProps = getCustomCount(objectType);
              const userDefProps = getUserDefinedCount(objectType);
              const totalProps = getObjectTotal(objectType);
              return (
                <div key={objectType} className="bg-white p-3 rounded border">
                  <div className="font-medium text-gray-80 capitalize mb-2">
                    {objectType}
                  </div>
                  <div className="space-y-1 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span>Total:</span>
                      <span className="font-medium">{totalProps}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Default:</span>
                      <span className="text-green-600 font-medium">
                        {defaultProps}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Custom:</span>
                      <span className="text-blue-600 font-medium">
                        {customProps}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>userdefined:</span>
                      <span className="text-purple-600 font-medium">
                        {userDefProps}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      <div className="mt-6 flex justify-start">
        <Button
          variant="primary"
          disabled={!canProceed || hasUnsavedChanges}
          onClick={() => onStepChange(5)}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import Button from "@/components/Buttons/button";
import MappingContent, {
  PropertyOption,
  MappingRow,
} from "./MappingContent";
import { hubspotContactProperties, hubspotCompanyProperties, hubspotDealProperties, hubspotTicketProperties } from "@/context/hubspotdefaultproperties";

export type ObjectKey = "contacts" | "companies" | "deals" | "tickets";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;

  // which object is currently shown
  objectKey: ObjectKey;

  // list of selectable objects
  availableObjects: ObjectKey[];

  // called when user changes the object from the dropdown; pass current rows to be stashed
  onSwitchObject: (next: ObjectKey, currentRows: MappingRow[]) => void;

  // if provided, modal will load these rows (used when switching back to an object)
  initialRows?: MappingRow[];

  portalIdA?: number | null;
  portalIdB?: number | null;
  userId: string;

  // persist on Save
  onSave: (rows: MappingRow[]) => Promise<void> | void;

  backendBase?: string;
};

function getErrorMessage(e: unknown) {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  return "Unknown error";
}
function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}
function toPropertyOption(v: unknown): PropertyOption | null {
  if (!isRecord(v)) return null;
  const value = v["value"];
  const label = v["label"];
  const type = v["type"];
  if (
    (typeof value === "string" || typeof value === "number") &&
    (typeof label === "string" || typeof label === "number")
  ) {
    return {
      value: String(value),
      label: String(label),
      type: typeof type === "string" ? type : undefined,
    };
  }
  return null;
}

export default function MappingModal({
  open,
  onOpenChange,
  objectKey,
  availableObjects,
  onSwitchObject,
  initialRows,
  portalIdA,
  portalIdB,
  userId,
  onSave,
  backendBase = process.env.NEXT_PUBLIC_DOMAIN_BACKEND || "",
}: Props) {
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [propsA, setPropsA] = React.useState<PropertyOption[]>([]);
  const [propsB, setPropsB] = React.useState<PropertyOption[]>([]);
  const [rows, setRows] = React.useState<MappingRow[]>([]);

  // default rows per object (all objects start with empty rows)
  const defaultRowsForObject = React.useCallback(
    (obj: ObjectKey): MappingRow[] => {
      return [{ id: `row-${Date.now()}-${Math.random()}`, a: undefined, b: undefined }];
    },
    []
  );

  // Load property lists and seed rows whenever the modal opens or object changes
  React.useEffect(() => {
    if (!open) return;
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const base = backendBase.endsWith("/") ? backendBase : backendBase + "/";
        const makeUrl = (instance: "a" | "b", portalId?: number | null) =>
          `${base}hubspot/properties?instance=${instance}&userId=${encodeURIComponent(
            userId
          )}&portalId=${portalId ?? ""}&object=${encodeURIComponent(objectKey)}`;

        const [ra, rb] = await Promise.allSettled([
          fetch(makeUrl("a", portalIdA)),
          fetch(makeUrl("b", portalIdB)),
        ]);

        const parseList = async (
          res: Response | undefined
        ): Promise<PropertyOption[] | undefined> => {
          if (!res || !res.ok) return undefined;
          const data = (await res.json()) as unknown;
          if (!Array.isArray(data)) return undefined;
          const mapped = data
            .map(toPropertyOption)
            .filter((x): x is PropertyOption => x !== null);
          return mapped.length ? mapped : undefined;
        };

        const listA =
          ra.status === "fulfilled" ? await parseList(ra.value) : undefined;
        const listB =
          rb.status === "fulfilled" ? await parseList(rb.value) : undefined;

        // Get default properties based on object type
        const getDefaultProperties = (objType: ObjectKey): PropertyOption[] => {
          switch (objType) {
            case "contacts":
              return hubspotContactProperties.map(p => ({ value: p.name, label: p.label }));
            case "companies":
              return hubspotCompanyProperties.map(p => ({ value: p.name, label: p.label }));
            case "deals":
              return hubspotDealProperties.map(p => ({ value: p.name, label: p.label }));
            case "tickets":
              return hubspotTicketProperties.map(p => ({ value: p.name, label: p.label }));
            default:
              return hubspotContactProperties.map(p => ({ value: p.name, label: p.label }));
          }
        };

        const fallback = getDefaultProperties(objectKey);

        if (!cancelled) {
          setPropsA(listA ?? fallback);
          setPropsB(listB ?? fallback);
          setRows(initialRows && initialRows.length ? initialRows : defaultRowsForObject(objectKey));
        }
      } catch (e: unknown) {
        if (!cancelled) setError(getErrorMessage(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [
    open,
    objectKey,
    portalIdA,
    portalIdB,
    userId,
    backendBase,
    initialRows,
    defaultRowsForObject,
  ]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(rows);
      onOpenChange(false);
    } catch (e: unknown) {
      setError(getErrorMessage(e) || "Failed to save mappings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[650px] max-h-[90vh] overflow-auto w-full">
        <DialogHeader>
          <DialogTitle>Configure Field Mapping</DialogTitle>
        </DialogHeader>

        {/* Object selector */}
        <div className="mb-4">
          <Select
            value={objectKey}
            onValueChange={(v) => onSwitchObject(v as ObjectKey, rows)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose data type…" />
            </SelectTrigger>
            <SelectContent>
              {availableObjects.map((o) => (
                <SelectItem key={o} value={o}>
                  {o.charAt(0).toUpperCase() + o.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {error && <div className="text-sm text-red-600 mb-2">{error}</div>}

        {loading ? (
          <div className="py-8 text-center">Loading properties…</div>
        ) : (
          <MappingContent
            objectKey={objectKey}
            propsA={propsA}
            propsB={propsB}
            rows={rows}
            setRows={setRows}
          />
        )}

        <DialogFooter className="mt-4">
          <Button variant="with_arrow" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={saving || loading}>
            {saving ? "Saving…" : "Save mappings"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
"use client";

import React, { useEffect, useState } from "react";
import Heading from "@/components/Headings/heading";
import Button from "@/components/Buttons/button";
import type { StepIndex } from "../types/dashboard";
import type { ObjectKey } from "@/components/Mapping/MappingModal";
import { useUser } from "@/context/UserContext";

type HubspotStatus = { portalId: number | null };

interface Step6Props {
  onBack: (step: StepIndex) => void;
  onMigrateClick?: (
    objects?: ObjectKey[]
  ) => Promise<{ created: number; fetched: number } | null>;
  hubspotStatusA: HubspotStatus;
}

export default function Step6ObjectRecords({
  onBack,
  onMigrateClick,
  hubspotStatusA,
}: Step6Props) {
  const { profile } = useUser();
  const OBJECTS: ObjectKey[] = ["companies", "deals", "tickets", "contacts"];

  const [migrating, setMigrating] = useState(false);

  return (
    <div className="mt-8">
      <Heading as="h2" className="mt-2">
        Select Object to View Records
      </Heading>
      <p className="text-[var(--migratio_text)] mt-2">
        Objects available for migration to HubSpot CRM B.
      </p>

      <div className="mt-4">
        <Button variant="with_arrow" onClick={() => onBack(5 as StepIndex)}>
          Back
        </Button>
      </div>

      {/* Object cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
        {OBJECTS.map((key) => (
          <ObjectCardWithCount
            key={key}
            objectKey={key}
            accessTokenA={profile?.hubspot_access_token_a}
            portalIdA={hubspotStatusA.portalId || undefined}
          />
        ))}
      </div>

      {/* Migration button */}
      <div className="mt-8 flex justify-center">
        <button
          className={`min-w-[300px] py-3 px-6 rounded-md font-medium text-white transition-all flex items-center justify-center gap-3 shadow ${
            migrating
              ? "bg-gradient-to-r from-emerald-500 to-green-500 cursor-not-allowed ring-1 ring-white/40 shadow-emerald-500/30"
              : "bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-600 hover:to-green-700"
          }`}
          disabled={migrating}
          aria-busy={migrating}
          aria-live="polite"
          onClick={async () => {
            if (!onMigrateClick) return;
            try {
              setMigrating(true);
              await onMigrateClick();
            } finally {
              setMigrating(false);
            }
          }}
        >
          {migrating && (
            <span className="relative inline-flex items-center justify-center">
              <span className="h-5 w-5 rounded-full border-[3px] border-white/70 border-t-transparent animate-spin"></span>
            </span>
          )}
          {migrating ? "Migrating…" : "Migrate Objects to CRM B"}
        </button>
      </div>
    </div>
  );
}

function ObjectCardWithCount({
  objectKey,
  accessTokenA,
  portalIdA,
}: {
  objectKey: ObjectKey;
  accessTokenA?: string | null;
  portalIdA?: number;
}) {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchCount = async (attempt = 0) => {
      if (!portalIdA || !accessTokenA) return;
      try {
        setLoading(true);
        const res = await fetch(`/api/hubspot/schema/${objectKey}?count=true`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessTokenA}`,
            "X-Portal-ID": String(portalIdA),
          },
        });
        const data = await res.json().catch(() => ({}));
        if (res.status === 429) {
          const next = Math.min(6, attempt + 1);
          const delay = 600 * next + Math.random() * 300;
          setTimeout(() => {
            fetchCount(next);
          }, delay);
          return;
        }
        if (!res.ok || !data?.success)
          throw new Error(data?.message || "Failed to fetch count");
        setCount(data.data?.total ?? 0);
      } catch {
        setCount(null);
      } finally {
        setLoading(false);
      }
    };
    fetchCount();
  }, [portalIdA, accessTokenA, objectKey]);

  return (
    <div className="text-left border rounded-md p-4 bg-white flex flex-col gap-2 hover:shadow-sm focus:outline-hidden">
      <div className="flex items-center justify-between">
        <span className="capitalize font-medium">{objectKey}</span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
          Object
        </span>
      </div>
      <div className="text-xs text-gray-500">
        Preview or migrate records for this object.
      </div>
      <div className="mt-2 text-sm">
        {loading ? (
          <span className="text-gray-500">Loading count…</span>
        ) : (
          <span className="text-gray-800">
            HubSpot A Records: <strong>{count ?? 0}</strong>
          </span>
        )}
      </div>
    </div>
  );
}

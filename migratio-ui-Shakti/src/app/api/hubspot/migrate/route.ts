import { NextRequest, NextResponse } from 'next/server';

type ObjectKey = 'contacts' | 'companies' | 'deals' | 'tickets';

const OBJECT_META: Record<ObjectKey, { 
  api: string; 
  properties: string[];
  uniqueProperty: string;
  searchProperties: string[];
}> = {
  contacts: { 
    api: 'contacts', 
    properties: ['firstname', 'lastname', 'email'],
    uniqueProperty: 'email',
    searchProperties: ['email']
  },
  companies: { 
    api: 'companies', 
    properties: ['name', 'domain'],
    uniqueProperty: 'name',
    searchProperties: ['name']
  },
  deals: { 
    api: 'deals', 
    properties: ['dealname', 'amount', 'pipeline', 'dealstage'],
    uniqueProperty: 'dealname',
    searchProperties: ['dealname']
  },
  tickets: { 
    api: 'tickets', 
    properties: ['subject', 'content', 'hs_ticket_priority'],
    uniqueProperty: 'subject',
    searchProperties: ['subject']
  },
};

// ✅ Persistent migration map
const MIGRATION_FILE = './migration-map.json';
let migrationMap = new Map<string, string>();

async function loadMigrationMap() {
  try {
    const fs = await import('fs');
    if (fs.existsSync(MIGRATION_FILE)) {
      const data = fs.readFileSync(MIGRATION_FILE, 'utf8');
      const mapData = JSON.parse(data);
      migrationMap = new Map(Object.entries(mapData));
      console.log(`✓ Loaded ${migrationMap.size} existing migration mappings`);
    }
  } catch {
    console.log('No existing migration map found, starting fresh');
  }
}

async function saveMigrationMap() {
  try {
    const fs = await import('fs');
    const mapObject = Object.fromEntries(migrationMap);
    fs.writeFileSync(MIGRATION_FILE, JSON.stringify(mapObject, null, 2));
    console.log(`✓ Saved ${migrationMap.size} migration mappings`);
  } catch (error) {
    console.error('Failed to save migration map:', error);
  }
}

// Helpers
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const jitter = (ms: number) => ms + Math.floor(Math.random() * Math.min(250, ms));

async function runWithConcurrency<T, R>(
  items: T[],
  limit: number,
  worker: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];
  let nextIndex = 0;
  const runners: Promise<void>[] = [];
  const run = async () => {
    const current = nextIndex++;
    const item = items[current];
    if (item === undefined) return;
    const result = await worker(item, current);
    results[current] = result;
    if (nextIndex < items.length) await run();
  };
  const count = Math.min(limit, items.length);
  for (let i = 0; i < count; i++) runners.push(run());
  await Promise.all(runners);
  return results;
}

// Fetch from A
async function fetchRecordsFromA(objectKey: ObjectKey, tokenA: string, limit = 100) {
  const meta = OBJECT_META[objectKey];
  const url = `https://api.hubapi.com/crm/v3/objects/${meta.api}/search`;

  const all: Array<{ id: string; properties: Record<string, any> }> = [];
  let after: string | undefined = undefined;

  while (true) {
    const body: any = {
      filterGroups: [],
      limit,
      properties: ['hs_object_id', ...meta.properties],
      includeTotal: true,
      ...(after ? { after } : {}),
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({} as any));
    if (!res.ok) {
      if (res.status === 401) {
        const err = new Error('EXPIRED_TOKEN');
        (err as any).code = 'EXPIRED_TOKEN';
        throw err;
      }
      if (res.status === 429) {
        await sleep(1500);
        continue;
      }
      throw new Error(data?.message || data?.error || `Failed to fetch ${objectKey} from A`);
    }
    const results = Array.isArray(data?.results) ? data.results : [];
    all.push(...results.map((r: any) => ({ id: r.id, properties: r.properties || {} })));
    after = data?.paging?.next?.after;
    if (!after) break;
    await sleep(300);
  }
  return all;
}

// ✅ Check if exists in B with mapping verification
async function checkRecordExistsInB(
  objectKey: ObjectKey, 
  tokenB: string, 
  originalRecord: { id: string; properties: Record<string, any> }
): Promise<string | null> {
  const meta = OBJECT_META[objectKey];
  const mapKey = `${objectKey}:${originalRecord.id}`;

  if (migrationMap.has(mapKey)) {
    const existingId = migrationMap.get(mapKey);
    const urlCheck = `https://api.hubapi.com/crm/v3/objects/${meta.api}/${existingId}`;
    try {
      const resCheck = await fetch(urlCheck, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenB}`,
        },
      });

      if (resCheck.ok) {
        console.log(`✓ Verified mapping still valid for ${objectKey} ${originalRecord.id} -> ${existingId}`);
        return existingId ?? null;
      } else if (resCheck.status === 404) {
        migrationMap.delete(mapKey);
        await saveMigrationMap();
        console.log(`⚠️ Stale mapping removed for ${objectKey} ${originalRecord.id}`);
      }
    } catch (err) {
      console.warn(`⚠️ Mapping verification failed for ${objectKey} ${originalRecord.id}:`, err);
    }
  }

  // Search by properties
  for (const property of meta.searchProperties) {
    const propertyValue = originalRecord.properties[property];
    if (!propertyValue) continue;

    const url = `https://api.hubapi.com/crm/v3/objects/${meta.api}/search`;
    const body = {
      filterGroups: [
        {
          filters: [{ propertyName: property, operator: 'EQ', value: propertyValue }],
        },
      ],
      limit: 5,
      properties: ['id', property, 'createdate'],
    };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenB}`,
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.results?.length > 0) {
          const bestMatch = data.results.reduce((latest: any, current: any) => {
            if (!latest) return current;
            const latestDate = new Date(latest.properties.createdate || 0);
            const currentDate = new Date(current.properties.createdate || 0);
            return currentDate > latestDate ? current : latest;
          }, null);
          if (bestMatch) {
            migrationMap.set(mapKey, bestMatch.id);
            await saveMigrationMap();
            console.log(`✓ Found existing ${objectKey} via ${property}: ${bestMatch.id}`);
            return bestMatch.id;
          }
        }
      }
    } catch (err) {
      console.warn(`⚠️ Search failed for ${objectKey} ${originalRecord.id} using ${property}`, err);
    }
  }
  return null;
}

// Create record in B
async function createRecordInB(
  objectKey: ObjectKey, 
  tokenB: string, 
  properties: Record<string, any>,
  originalId: string
) {
  const meta = OBJECT_META[objectKey];
  const url = `https://api.hubapi.com/crm/v3/objects/${meta.api}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenB}`,
    },
    body: JSON.stringify({ properties }),
  });

  const data = await res.json().catch(() => ({} as any));
  if (!res.ok) {
    if (res.status === 401) { const e = new Error('EXPIRED_TOKEN'); (e as any).code = 'EXPIRED_TOKEN'; throw e; }
    if (res.status === 429) { const e = new Error('RATE_LIMIT'); (e as any).code = 'RATE_LIMIT'; throw e; }
    if (res.status === 409) { const e = new Error('DUPLICATE_RECORD'); (e as any).code = 'DUPLICATE_RECORD'; throw e; }
    if (data?.validationResults) {
      throw new Error(`Validation failed: ${data.validationResults.map((v: any) => v.message).join(', ')}`);
    }
    throw new Error(data?.message || data?.error || `Create ${objectKey} failed`);
  }

  if (!data?.id) throw new Error(`Create ${objectKey} returned no id`);

  const mapKey = `${objectKey}:${originalId}`;
  migrationMap.set(mapKey, data.id);
  await saveMigrationMap();
  return data.id as string;
}

// ✅ API handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({} as any));
    const objects = (body?.objects || []) as ObjectKey[];
    const tokenA = request.headers.get('x-access-token-a') || '';
    const tokenB = request.headers.get('x-access-token-b') || '';
    const forceRefresh = body?.forceRefresh || false;

    if (!tokenA || !tokenB) {
      return NextResponse.json({ success: false, message: 'Missing HubSpot access tokens' }, { status: 400 });
    }

    await loadMigrationMap();
    if (forceRefresh) {
      migrationMap.clear();
      console.log('🧹 Cleared migration mapping due to force refresh');
    } else {
      console.log(`📊 Using existing migration mapping with ${migrationMap.size} records`);
    }

 // ✅ Desired order
const desiredOrder: ObjectKey[] = ['contacts', 'companies', 'deals', 'tickets'];

const uniqueObjects = (Array.isArray(objects) && objects.length > 0 ? objects : desiredOrder)
  .filter((o): o is ObjectKey => (o as any) in OBJECT_META)
  .sort((a, b) => desiredOrder.indexOf(a) - desiredOrder.indexOf(b));


    const perObject: Record<string, { fetched: number; created: number; skipped: number; failed: number; errors?: string[] }> = {};
    let tokenExpired = false;

    for (const objectKey of uniqueObjects) {
      const summary = { fetched: 0, created: 0, skipped: 0, failed: 0, errors: [] as string[] };

      try {
        const records = await fetchRecordsFromA(objectKey, tokenA, 100);
        summary.fetched = records.length;
        console.log(`\n🔄 Processing ${records.length} ${objectKey}...`);

        await runWithConcurrency(records, 2, async (r) => {
          let attempt = 0;
          const maxAttempts = 2;

          // ✅ Now only rely on checkRecordExistsInB (with verification)
          try {
            const existingId = await checkRecordExistsInB(objectKey, tokenB, r);
            if (existingId) {
              summary.skipped++;
              console.log(`⏭️  SKIPPED ${objectKey} ${r.id} -> already exists as ${existingId}`);
              return null as any;
            }
          } catch (err) {
            console.warn(`⚠️ Duplicate check failed for ${objectKey} ${r.id}`, err);
          }

          const allowed = OBJECT_META[objectKey].properties;
          const minimalProps: Record<string, any> = {};
          for (const p of allowed) {
            if (r.properties?.[p]) minimalProps[p] = r.properties[p];
          }

          if (objectKey === 'tickets' && !minimalProps.subject) {
            minimalProps.subject = `Imported ticket ${r.id}`;
          }
          if (objectKey === 'deals') {
            delete minimalProps.pipeline;
            delete minimalProps.dealstage;
          }
          if (objectKey === 'tickets') {
            delete minimalProps.pipeline;
            minimalProps.hs_pipeline = minimalProps.hs_pipeline || '0';
            minimalProps.hs_pipeline_stage = minimalProps.hs_pipeline_stage || '1';
          }

          while (attempt < maxAttempts) {
            try {
              const id = await createRecordInB(objectKey, tokenB, minimalProps, r.id);
              summary.created++;
              console.log(`✅ CREATED ${objectKey} ${r.id} -> ${id}`);
              return null as any;
            } catch (e: any) {
              const code = e?.code;
              if (code === 'EXPIRED_TOKEN') { tokenExpired = true; summary.failed++; return null as any; }
              if (code === 'RATE_LIMIT') { await sleep(jitter(2000 * (attempt + 1))); attempt++; continue; }
              if (code === 'DUPLICATE_RECORD') { summary.skipped++; return null as any; }
              summary.failed++; summary.errors.push(e?.message || 'Unknown'); return null as any;
            }
          }
          return null as any;
        });

        console.log(`✓ ${objectKey}: ${summary.created} created, ${summary.skipped} skipped, ${summary.failed} failed`);
      } catch (e: any) {
        summary.errors.push(e?.message || 'Failed to process');
        if (e?.code === 'EXPIRED_TOKEN') tokenExpired = true;
      }

      perObject[objectKey] = summary;
    }

    const totals = Object.values(perObject).reduce(
      (acc, s) => {
        acc.fetched += s.fetched;
        acc.created += s.created;
        acc.skipped += s.skipped;
        acc.failed += s.failed;
        return acc;
      },
      { fetched: 0, created: 0, skipped: 0, failed: 0 }
    );

    const anyCreated = totals.created > 0;
    const message = anyCreated
      ? `Migration completed (created ${totals.created}/${totals.fetched}, skipped ${totals.skipped})`
      : 'Migration already Successful or no new records to migrate';

    if (!anyCreated && tokenExpired) {
      return NextResponse.json(
        { success: false, errorCode: 'EXPIRED_TOKEN', message: 'Access token expired', data: { totals, perObject } },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: anyCreated, message, data: { totals, perObject } },
      { status: anyCreated ? 200 : 400 }
    );
  } catch (error) {
    console.error('❌ Migration error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to start migration', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

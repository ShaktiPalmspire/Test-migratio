
import { NextRequest, NextResponse } from 'next/server';

type ObjectKey = 'contacts' | 'companies' | 'deals' | 'tickets';

const OBJECT_META: Record<ObjectKey, { api: string; properties: string[] }> = {
  contacts: { api: 'contacts', properties: ['firstname', 'lastname', 'email'] },
  companies: { api: 'companies', properties: ['name', 'domain'] },
  deals: { api: 'deals', properties: ['dealname', 'amount', 'pipeline', 'dealstage'] },
  tickets: { api: 'tickets', properties: ['subject', 'content', 'hs_ticket_priority'] },
};

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
        // @ts-expect-error Adding custom property to Error
        err.code = 'EXPIRED_TOKEN';
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
    await sleep(300); // be nice to API
  }
  return all;
}

async function createRecordInB(objectKey: ObjectKey, tokenB: string, properties: Record<string, any>) {
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
    if (res.status === 401) {
      const err = new Error('EXPIRED_TOKEN');
      // @ts-expect-error Adding custom property to Error
      err.code = 'EXPIRED_TOKEN';
      throw err;
    }
    if (res.status === 429) {
      const err = new Error('RATE_LIMIT');
      // @ts-expect-error Adding custom property to Error
      err.code = 'RATE_LIMIT';
      throw err;
    }
    throw new Error(data?.message || data?.error || `Create ${objectKey} failed`);
  }
  if (!data?.id) {
    throw new Error(`Create ${objectKey} returned no id`);
  }
  return data?.id as string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({} as any));
    const objects = (body?.objects || []) as ObjectKey[];
    const tokenA = request.headers.get('x-access-token-a') || '';
    const tokenB = request.headers.get('x-access-token-b') || '';

    if (!tokenA || !tokenB) {
      return NextResponse.json({ success: false, message: 'Missing HubSpot access tokens' }, { status: 400 });
    }
    const uniqueObjects = (Array.isArray(objects) && objects.length > 0 ? objects : (Object.keys(OBJECT_META) as ObjectKey[]))
      .filter((o): o is ObjectKey => (o as any) in OBJECT_META);

    const perObject: Record<string, { fetched: number; created: number; failed: number; errors?: string[] }> = {};

    let tokenExpired = false;
    for (const objectKey of uniqueObjects) {
      const summary = { fetched: 0, created: 0, failed: 0, errors: [] as string[] };
      try {
        const records = await fetchRecordsFromA(objectKey, tokenA, 100);
        summary.fetched = records.length;
        // Process creations with controlled concurrency
        // Aim for ~5 parallel requests; exponential backoff on 429s per item
        const concurrency = 5;
        await runWithConcurrency(records, concurrency, async (r) => {
          let attempt = 0;
          const maxAttempts = 4;
          const allowed = OBJECT_META[objectKey].properties;
          const minimalProps: Record<string, any> = {};
          for (const p of allowed) {
            if (r.properties && r.properties[p] !== undefined && r.properties[p] !== null) minimalProps[p] = r.properties[p];
          }
          if (objectKey === 'tickets') {
            if (!minimalProps.subject || String(minimalProps.subject).trim() === '') {
              minimalProps.subject = `Imported ticket ${r.id}`;
            }
          }
          const propsToSend: Record<string, any> = { ...minimalProps }; // Changed from let to const

          while (attempt < maxAttempts) {
            try {
              const id = await createRecordInB(objectKey, tokenB, propsToSend);
              if (id) summary.created += 1; else { 
                summary.failed += 1; 
                if (summary.errors.length < 5) summary.errors.push('Create returned no id'); 
              }
              return null as any;
            } catch (e: any) {
              const code = e?.code || '';
              if (code === 'EXPIRED_TOKEN') { 
                tokenExpired = true; 
                summary.failed += 1; 
                if (summary.errors.length < 5) summary.errors.push('EXPIRED_TOKEN'); 
                return null as any; 
              }
              if (code === 'RATE_LIMIT') {
                await sleep(jitter(300 * (attempt + 1)));
                attempt += 1;
                continue;
              }
              // Fallback mutate props for schema issues then retry once
              // Since propsToSend is const, we need to work with a mutable copy
              const mutableProps = { ...propsToSend };
              if (objectKey === 'deals') { 
                delete mutableProps.pipeline; 
                delete mutableProps.dealstage; 
              }
              if (objectKey === 'tickets') {
                delete mutableProps.pipeline;
                if (!('hs_pipeline' in mutableProps)) mutableProps.hs_pipeline = '0';
                if (!('hs_pipeline_stage' in mutableProps)) mutableProps.hs_pipeline_stage = '1';
                if (!mutableProps.subject) mutableProps.subject = `Imported ticket ${r.id}`;
              }
              
              // Update the propsToSend reference for the next iteration
              Object.assign(propsToSend, mutableProps);
              
              attempt += 1;
              if (attempt >= maxAttempts) {
                summary.failed += 1;
                const msg = e?.message || 'Unknown error';
                if (summary.errors.length < 5) summary.errors.push(msg);
                return null as any;
              }
            }
          }
          return null as any;
        });
      } catch (e: any) {
        const msg = e?.code || e?.message || 'Failed to process object';
        if (msg === 'EXPIRED_TOKEN') tokenExpired = true;
        summary.errors.push(msg);
      }
      perObject[objectKey] = summary;
    }

    const totals = Object.values(perObject).reduce(
      (acc, s) => {
        acc.fetched += s.fetched; 
        acc.created += s.created; 
        acc.failed += s.failed; 
        return acc;
      },
      { fetched: 0, created: 0, failed: 0 }
    );

    const anyCreated = totals.created > 0;
    const message = anyCreated
      ? `Migration completed (created ${totals.created}/${totals.fetched})`
      : 'No records created. See perObject errors for details';

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
    console.error('❌ [API ROUTE] Migration error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to start migration', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
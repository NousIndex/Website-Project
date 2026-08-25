#!/usr/bin/env node
/**
 * Reports and creates the MongoDB indexes the API depends on.
 *
 * Every request filters on fields that are not indexed by default, and the
 * draw collections hold every draw of every user -- so `find({<Game>_UID})`
 * with `sort({DrawTime: -1})` is a collection scan plus an in-memory sort,
 * which MongoDB aborts once the sort exceeds 32 MB.
 *
 * Usage:
 *   node scripts/create-indexes.js            # dry run: report only
 *   node scripts/create-indexes.js --apply    # create the missing indexes
 *
 * Needs MONGODB_URI in the environment:
 *   MONGODB_URI="mongodb+srv://..." node scripts/create-indexes.js
 */
const { createMongoClient, DATABASE_NAME } = require('../api/_shared/mongo');

const APPLY = process.argv.includes('--apply');

const DRAW_COLLECTIONS = [
  { collection: 'Genshin_Draw', uidField: 'Genshin_UID' },
  { collection: 'StarRail_Draw', uidField: 'StarRail_UID' },
  { collection: 'Zzz_Draw', uidField: 'Zzz_UID' },
  { collection: 'Wuwa_Draw', uidField: 'Wuwa_UID' },
];

const SIMPLE_INDEXES = [
  {
    collection: 'Games_Users',
    keys: { UID: 1 },
    options: { name: 'UID_unique', unique: true },
    why: 'looked up by every history, watchlist and import request',
  },
  {
    collection: 'SummaryTable',
    keys: { Game_UID: 1 },
    options: { name: 'Game_UID_unique', unique: true },
    why: 'read on every history request to check whether the cache is fresh',
  },
  {
    collection: 'Reverse1999_Resonance',
    keys: { Character_Resonance: 1 },
    options: { name: 'Character_Resonance_unique', unique: true },
    why: 'read and upserted by the resonance endpoints',
  },
];

function log(...args) {
  console.log(...args);
}

async function collectionExists(db, name) {
  const found = await db.listCollections({ name }, { nameOnly: true }).toArray();
  return found.length > 0;
}

async function existingIndexNames(db, name) {
  try {
    const indexes = await db.collection(name).indexes();
    return new Set(indexes.map((i) => i.name));
  } catch {
    return new Set();
  }
}

async function ensureIndex(db, collection, keys, options, why) {
  const present = await existingIndexNames(db, collection);
  if (present.has(options.name)) {
    log(`  ok      ${collection}.${options.name} already exists`);
    return { created: false, skipped: false };
  }

  const spec = JSON.stringify(keys);
  if (!APPLY) {
    log(`  MISSING ${collection}.${options.name} ${spec}`);
    log(`          ${why}`);
    return { created: false, skipped: false };
  }

  try {
    await db.collection(collection).createIndex(keys, options);
    log(`  created ${collection}.${options.name} ${spec}`);
    return { created: true, skipped: false };
  } catch (error) {
    log(`  FAILED  ${collection}.${options.name}: ${error.message}`);
    return { created: false, skipped: true };
  }
}

/**
 * A unique index on DrawID is what makes duplicate draws impossible, but it
 * cannot be built while duplicates are already stored. Report them instead of
 * failing, and fall back to a non-unique index so the lookup is still fast.
 */
async function countDuplicateDrawIds(db, collection) {
  const rows = await db
    .collection(collection)
    .aggregate(
      [
        { $group: { _id: '$DrawID', n: { $sum: 1 } } },
        { $match: { n: { $gt: 1 } } },
        { $count: 'duplicates' },
      ],
      { allowDiskUse: true }
    )
    .toArray();
  return rows[0]?.duplicates ?? 0;
}

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is not set.');
    process.exit(1);
  }

  const client = createMongoClient();
  await client.connect();
  const db = client.db(DATABASE_NAME);

  log(
    APPLY
      ? `Creating missing indexes in ${DATABASE_NAME}\n`
      : `Dry run against ${DATABASE_NAME} -- re-run with --apply to create these\n`
  );

  let created = 0;
  let duplicatesFound = false;

  for (const { collection, uidField } of DRAW_COLLECTIONS) {
    log(`${collection}`);
    if (!(await collectionExists(db, collection))) {
      log('  skip    collection does not exist yet\n');
      continue;
    }

    const docs = await db.collection(collection).estimatedDocumentCount();
    log(`  ~${docs.toLocaleString()} documents`);

    const result = await ensureIndex(
      db,
      collection,
      { [uidField]: 1, DrawTime: -1 },
      { name: `${uidField}_DrawTime` },
      'draw history filters on the UID and sorts by DrawTime descending'
    );
    if (result.created) created++;

    const duplicates = await countDuplicateDrawIds(db, collection);
    if (duplicates > 0) {
      duplicatesFound = true;
      log(
        `  WARN    ${duplicates} duplicate DrawID value(s) -- a unique index cannot be built`
      );
      log('          creating a non-unique index instead; de-duplicate, then re-run');
      const fallback = await ensureIndex(
        db,
        collection,
        { DrawID: 1 },
        { name: 'DrawID' },
        'imports check which DrawIDs already exist before inserting'
      );
      if (fallback.created) created++;
    } else {
      const unique = await ensureIndex(
        db,
        collection,
        { DrawID: 1 },
        { name: 'DrawID_unique', unique: true },
        'imports check existing DrawIDs; unique also prevents duplicate inserts'
      );
      if (unique.created) created++;
    }
    log('');
  }

  for (const { collection, keys, options, why } of SIMPLE_INDEXES) {
    log(`${collection}`);
    if (!(await collectionExists(db, collection))) {
      log('  skip    collection does not exist yet\n');
      continue;
    }
    const result = await ensureIndex(db, collection, keys, options, why);
    if (result.created) created++;
    log('');
  }

  if (APPLY) {
    log(`Done. ${created} index(es) created.`);
  } else {
    log('Dry run complete. Re-run with --apply to create anything marked MISSING.');
  }
  if (duplicatesFound) {
    log(
      '\nDuplicate DrawIDs exist. Until they are removed, SummaryTable.total_items\n' +
        'can drift from the real draw count, which is what decides whether cached\n' +
        'draw history is served as fresh.'
    );
  }

  await client.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

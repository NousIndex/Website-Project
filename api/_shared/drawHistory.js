async function fetchAndProcessDraws({
  database,
  collectionName,
  drawUidField,
  uid,
  bannerStripPrefix,
  bannerBaseName,
  zeroOnFour,
  zeroOnOther,
  drawIdTiebreak,
}) {
  const collection = database.collection(collectionName);

  // Sorting in the query (rather than re-sorting the whole array in JS
  // afterwards) keeps the tiebreak on the index and off the event loop.
  //
  // Without a tiebreak the draws of a single 10-pull all share a timestamp and
  // their relative order is whatever the query returns, so that case keeps the
  // original descending fetch and reverses it -- changing the direction of the
  // query would silently renumber those draws and shift their pity counts.
  const sort = drawIdTiebreak ? { DrawTime: 1, DrawID: 1 } : { DrawTime: -1 };

  const data = await collection
    .find(
      { [drawUidField]: uid },
      {
        projection: {
          DrawID: true,
          DrawTime: true,
          Item_Name: true,
          DrawType: true,
          Rarity: true,
          _id: false,
        },
        sort,
      }
    )
    .toArray();

  const ordered = drawIdTiebreak ? data : data.reverse();

  const dataWithDrawNumber = ordered.map((item, index) => ({
    ...item,
    drawNumber: index + 1,
  }));

  const bannerDraws = new Map();

  for (const item of dataWithDrawNumber) {
    let baseBannerType = item.DrawType;
    if (bannerStripPrefix && item.DrawType.startsWith(bannerStripPrefix)) {
      baseBannerType = bannerBaseName;
    }
    if (!bannerDraws.has(baseBannerType)) {
      bannerDraws.set(baseBannerType, []);
    }
    bannerDraws.get(baseBannerType).push(item);
  }

  // A 4-star pity above the 10-draw guarantee means draws are missing from the
  // stored history (an import that skipped a page, or a game that returned a
  // partial log). The count is clamped so the table still shows a plausible
  // value, and the number of clamps is reported once instead of per draw.
  const MAX_FOUR_STAR_PITY = 10;
  let clampedCount = 0;

  for (const [, draws] of bannerDraws) {
    let rarity4Pity = 0;
    let rarity5Pity = 0;

    for (const item of draws) {
      rarity4Pity++;
      rarity5Pity++;

      if (item.Rarity === '4') {
        if (zeroOnFour) item.rarity5Pity = 0;
        if (rarity4Pity > MAX_FOUR_STAR_PITY) {
          clampedCount++;
          rarity4Pity = MAX_FOUR_STAR_PITY;
        }
        item.rarity4Pity = rarity4Pity;
        rarity4Pity = 0;
      } else if (item.Rarity === '5') {
        if (zeroOnFour) item.rarity4Pity = 0;
        item.rarity5Pity = rarity5Pity;
        rarity5Pity = 0;
      } else if (zeroOnOther) {
        item.rarity4Pity = 0;
        item.rarity5Pity = 0;
      }
    }
  }

  if (clampedCount > 0) {
    console.warn(
      `${uid}: clamped ${clampedCount} four-star pity value(s) above ${MAX_FOUR_STAR_PITY} -- history may be incomplete`
    );
  }

  return [...bannerDraws.values()]
    .flat()
    .sort((a, b) => b.drawNumber - a.drawNumber);
}

module.exports = { fetchAndProcessDraws };

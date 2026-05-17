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
        sort: { DrawTime: -1 },
      }
    )
    .toArray();

  if (!data) return null;

  const sortedData = data.sort((a, b) => {
    const timeComparison = b.DrawTime.getTime() - a.DrawTime.getTime();
    if (drawIdTiebreak && timeComparison === 0) {
      return b.DrawID.localeCompare(a.DrawID);
    }
    return timeComparison;
  });

  const dataWithDrawNumber = sortedData.reverse().map((item, index) => ({
    ...item,
    drawNumber: index + 1,
  }));

  const bannerPity = new Map();
  const bannerDraws = new Map();

  for (const item of dataWithDrawNumber) {
    let baseBannerType = item.DrawType;
    if (bannerStripPrefix && item.DrawType.startsWith(bannerStripPrefix)) {
      baseBannerType = bannerBaseName;
    }
    if (!bannerPity.has(baseBannerType)) {
      bannerPity.set(baseBannerType, { rarity4Pity: 0, rarity5Pity: 0 });
      bannerDraws.set(baseBannerType, []);
    }
    bannerDraws.get(baseBannerType).push(item);
  }

  for (const [, draws] of bannerDraws) {
    let rarity4Pity = 0;
    let rarity5Pity = 0;

    for (const item of draws) {
      rarity4Pity++;
      rarity5Pity++;

      if (item.Rarity === '4') {
        if (zeroOnFour) item.rarity5Pity = 0;
        if (rarity4Pity === 11) rarity4Pity = 10;
        if (rarity4Pity > 10) console.log(item.DrawID, rarity4Pity);
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

  return [...bannerDraws.values()]
    .flat()
    .sort((a, b) => b.drawNumber - a.drawNumber);
}

module.exports = { fetchAndProcessDraws };

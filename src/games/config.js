/**
 * Per-game settings for the shared draw components.
 *
 * The five game sections render the same tracker UI; what actually differs
 * between them is small enough to live here as data, so the components can be
 * written once.
 *
 * `iconSource` follows what api/draw-icons returns for that game:
 *   'wiki' -> an array of Fandom image URLs, matched by encoded item name
 *   'dict' -> an object keyed by lowercased item name (scraped from prydwen)
 */
export const GAMES = {
  genshin: {
    iconSource: 'wiki',
    // The wiki files this name under the character's real name.
    iconAliases: { Childe: 'Tartaglia' },
    encodeBullet: false,
  },
  starrail: {
    iconSource: 'wiki',
    iconAliases: {},
    encodeBullet: true,
  },
  zzz: {
    iconSource: 'dict',
  },
  wuwa: {
    iconSource: 'dict',
  },
};

export const DEFAULT_ICON = 'default-image-url';

/**
 * Loosens a name so the two sides of a lookup can meet.
 *
 * The wikis and the games do not spell items identically: ZZZ W-Engines are
 * "(Cinder) Cobalt" on the wiki and "[Cinder] Cobalt" in the draw log, and
 * punctuation drifts elsewhere too. Comparing on letters and digits alone
 * absorbs all of that.
 */
function normalizeItemName(name) {
  return String(name).toLowerCase().replace(/[^a-z0-9]+/g, '');
}

let dictionaryCache = { source: null, byNormalized: null };

/** Builds (and remembers) a normalized view of an icon dictionary. */
function normalizedDictionary(itemIcons) {
  if (dictionaryCache.source === itemIcons) return dictionaryCache.byNormalized;

  const byNormalized = new Map();
  for (const [key, value] of Object.entries(itemIcons)) {
    byNormalized.set(normalizeItemName(key), value);
  }
  dictionaryCache = { source: itemIcons, byNormalized };
  return byNormalized;
}

/**
 * Resolves the icon for an item, using whichever shape api/draw-icons returns
 * for that game. Previously each game's copy of the table hardcoded one of the
 * two lookups, which is why a game whose endpoint changed shape lost its icons.
 */
export function resolveItemIcon(game, itemIcons, itemName) {
  const config = GAMES[game];
  if (!itemName || !config) return DEFAULT_ICON;

  if (config.iconSource === 'dict') {
    if (!itemIcons || Array.isArray(itemIcons)) return DEFAULT_ICON;

    const exact = itemIcons[itemName.toLowerCase()];
    if (exact) return exact;

    const wanted = normalizeItemName(itemName);
    if (!wanted) return DEFAULT_ICON;

    const dictionary = normalizedDictionary(itemIcons);
    const normalized = dictionary.get(wanted);
    if (normalized) return normalized;

    // Last resort: the two sides name the same thing at different lengths,
    // e.g. "Anby" against the wiki's "Anby Demara". Short names are excluded
    // so a three-letter item cannot match half the roster.
    if (wanted.length >= 5) {
      for (const [key, value] of dictionary) {
        if (key.includes(wanted) || wanted.includes(key)) return value;
      }
    }

    return DEFAULT_ICON;
  }

  if (!Array.isArray(itemIcons)) return DEFAULT_ICON;

  let encoded = itemName
    .replace(/\s+/g, '_')
    .replace(/'/g, '%27')
    .replace(/!/g, '%21')
    .replace(/,/g, '%2C');

  if (config.encodeBullet) {
    encoded = encoded.replace(/•/g, '%E2%80%A2');
  }

  const alias = config.iconAliases?.[encoded];
  if (alias) encoded = alias;

  return itemIcons.find((url) => url.includes(encoded)) || DEFAULT_ICON;
}

/**
 * A fixed-width version of a wiki image.
 *
 * Fandom serves originals at whatever resolution the uploader used -- 30 kB and
 * several hundred pixels for one character icon, a few kB for another. Asking
 * for a scaled copy makes every icon the same size and cuts what the tracker
 * downloads, which matters on a page showing a hundred of them at once.
 *
 * Anything that is not a wiki image is returned untouched.
 */
export function thumbnailUrl(url, width = 128) {
  if (typeof url !== 'string' || !url.includes('static.wikia.nocookie.net')) {
    return url;
  }
  if (url.includes('/scale-to-width-down/')) return url;

  return `${url.split('/revision')[0]}/revision/latest/scale-to-width-down/${width}`;
}

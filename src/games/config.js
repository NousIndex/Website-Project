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
 * Resolves the icon for an item, using whichever shape api/draw-icons returns
 * for that game. Previously each game's copy of the table hardcoded one of the
 * two lookups, which is why a game whose endpoint changed shape lost its icons.
 */
export function resolveItemIcon(game, itemIcons, itemName) {
  const config = GAMES[game];
  if (!itemName || !config) return DEFAULT_ICON;

  if (config.iconSource === 'dict') {
    if (!itemIcons || Array.isArray(itemIcons)) return DEFAULT_ICON;
    return itemIcons[itemName.toLowerCase()] || DEFAULT_ICON;
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

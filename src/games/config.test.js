import { describe, test, expect } from 'vitest';
import { resolveItemIcon, DEFAULT_ICON } from './config';

// api/draw-icons returns an array of wiki URLs for Genshin and Star Rail, and a
// name-keyed dictionary for ZZZ and Wuwa. The shared components rely on this
// helper to paper over that difference, so both shapes are covered here.
describe('resolveItemIcon', () => {
  const wikiIcons = [
    'https://static.wikia.nocookie.net/Kamisato_Ayaka.png',
    'https://static.wikia.nocookie.net/Tartaglia.png',
    'https://static.wikia.nocookie.net/Silver_Wolf.png',
    'https://static.wikia.nocookie.net/Dan_Heng_%E2%80%A2_Imbibitor_Lunae.png',
  ];
  const dictIcons = {
    'ellen joe': 'https://prydwen.gg/ellen.png',
    jinhsi: 'https://prydwen.gg/jinhsi.png',
  };

  test('matches wiki icons by encoded item name', () => {
    expect(resolveItemIcon('genshin', wikiIcons, 'Kamisato Ayaka')).toContain(
      'Kamisato_Ayaka'
    );
  });

  test('applies the Genshin wiki alias for Childe', () => {
    expect(resolveItemIcon('genshin', wikiIcons, 'Childe')).toContain(
      'Tartaglia'
    );
  });

  test('encodes bullet characters for Star Rail names', () => {
    expect(
      resolveItemIcon('starrail', wikiIcons, 'Dan Heng • Imbibitor Lunae')
    ).toContain('%E2%80%A2');
  });

  test('looks up dictionary icons case-insensitively', () => {
    expect(resolveItemIcon('zzz', dictIcons, 'Ellen Joe')).toBe(
      'https://prydwen.gg/ellen.png'
    );
    expect(resolveItemIcon('wuwa', dictIcons, 'Jinhsi')).toBe(
      'https://prydwen.gg/jinhsi.png'
    );
  });

  test('falls back instead of throwing when the icon payload is the wrong shape', () => {
    expect(resolveItemIcon('zzz', wikiIcons, 'Ellen Joe')).toBe(DEFAULT_ICON);
    expect(resolveItemIcon('genshin', dictIcons, 'Childe')).toBe(DEFAULT_ICON);
    expect(resolveItemIcon('genshin', null, 'Childe')).toBe(DEFAULT_ICON);
    expect(resolveItemIcon('unknown-game', wikiIcons, 'Childe')).toBe(
      DEFAULT_ICON
    );
  });

  test('returns the fallback for an unknown item', () => {
    expect(resolveItemIcon('starrail', wikiIcons, 'Not A Character')).toBe(
      DEFAULT_ICON
    );
  });
});

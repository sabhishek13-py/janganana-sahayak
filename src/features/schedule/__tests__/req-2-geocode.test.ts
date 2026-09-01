import { describe, expect, it, vi } from 'vitest';

const maps = vi.hoisted(() => ({
  importLibrary: vi.fn(),
  setOptions: vi.fn(),
}));

const env = vi.hoisted(() => ({ mapsApiKey: undefined as string | undefined }));

vi.mock('@googlemaps/js-api-loader', () => maps);
vi.mock('@/lib/public-env', () => ({ publicEnv: env }));

const { currentCoords, resolvePlaceFromCoords } = await import('../lib/geocode');
const { territoryCodeFromName } = await import('../lib/territory-matching');

const geocoderReturning = (components: unknown[]): void => {
  maps.importLibrary.mockResolvedValue({
    Geocoder: class {
      geocode = () => Promise.resolve({ results: [{ address_components: components }] });
    },
  });
};

describe('REQ-2 geocoding degrades gracefully', () => {
  it('reports unavailable when no Maps key is configured', async () => {
    env.mapsApiKey = undefined;
    await expect(resolvePlaceFromCoords(12.97, 77.59)).resolves.toEqual({
      kind: 'UNAVAILABLE',
      reason: 'no-maps-key',
    });
    expect(maps.setOptions).not.toHaveBeenCalled();
  });

  it('resolves a State and district when the geocoder answers', async () => {
    env.mapsApiKey = 'test-maps-key';
    geocoderReturning([
      { types: ['administrative_area_level_1'], long_name: 'Karnataka' },
      { types: ['administrative_area_level_2'], long_name: 'Bengaluru Urban' },
    ]);

    await expect(resolvePlaceFromCoords(12.97, 77.59)).resolves.toEqual({
      kind: 'RESOLVED',
      place: { territoryCode: 'KA', district: 'Bengaluru Urban' },
    });
    expect(maps.setOptions).toHaveBeenCalledWith({ key: 'test-maps-key', v: 'weekly' });
  });

  it('reports unavailable rather than guessing at an unrecognised State', async () => {
    env.mapsApiKey = 'test-maps-key';
    geocoderReturning([{ types: ['administrative_area_level_1'], long_name: 'Sindh' }]);
    await expect(resolvePlaceFromCoords(0, 0)).resolves.toMatchObject({ reason: 'no-match' });
  });

  it('reports unavailable when the geocoder throws', async () => {
    env.mapsApiKey = 'test-maps-key';
    maps.importLibrary.mockRejectedValueOnce(new Error('network down'));
    await expect(resolvePlaceFromCoords(0, 0)).resolves.toMatchObject({
      reason: 'geocoder-failed',
    });
  });

  it('returns undefined coordinates when the browser has no geolocation', async () => {
    await expect(currentCoords()).resolves.toBeUndefined();
  });

  it('resolves undefined when the visitor refuses the location prompt', async () => {
    vi.stubGlobal('navigator', {
      geolocation: {
        getCurrentPosition: (_ok: unknown, fail: () => void) => {
          fail();
        },
      },
    });
    await expect(currentCoords()).resolves.toBeUndefined();
    vi.unstubAllGlobals();
  });
});

describe('REQ-2 territory name aliases', () => {
  it('matches the ampersand spellings Google Maps actually returns', () => {
    // These aliases are looked up on the normalised name, in which '&' has
    // already become 'and'; spelling the keys with '&' made them unreachable.
    expect(territoryCodeFromName('Jammu & Kashmir')).toBe('JK');
    expect(territoryCodeFromName('Andaman & Nicobar Islands')).toBe('AN');
    expect(territoryCodeFromName('Dadra & Nagar Haveli and Daman & Diu')).toBe('DH');
    expect(territoryCodeFromName('Daman and Diu')).toBe('DH');
    expect(territoryCodeFromName('Orissa')).toBe('OR');
    expect(territoryCodeFromName('NCT of Delhi')).toBe('DL');
  });
});

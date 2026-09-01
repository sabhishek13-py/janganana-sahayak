/// <reference types="google.maps" />
import { importLibrary, setOptions } from '@googlemaps/js-api-loader';

import { publicEnv } from '@/lib/public-env';

import { territoryCodeFromName } from './territory-matching';

export interface ResolvedPlace {
  readonly territoryCode: string;
  readonly district: string | undefined;
}

export type GeocodeOutcome =
  | { readonly kind: 'RESOLVED'; readonly place: ResolvedPlace }
  | { readonly kind: 'UNAVAILABLE'; readonly reason: string };

let configured = false;

/** `setOptions` must run exactly once before the first `importLibrary` call. */
function configureMaps(apiKey: string): void {
  if (configured) return;
  setOptions({ key: apiKey, v: 'weekly' });
  configured = true;
}

const componentNamed = (
  components: readonly google.maps.GeocoderAddressComponent[],
  type: string,
): string | undefined => components.find((part) => part.types.includes(type))?.long_name;

/**
 * @requirement REQ-2 State-wise self-enumeration and survey dates
 * Reverse-geocodes coordinates with the Google Maps JavaScript API to pre-select
 * the visitor's State/UT. Without a key, or on any failure, the caller keeps the
 * manual dropdown, which is the complete and authoritative path either way.
 */
export async function resolvePlaceFromCoords(
  latitude: number,
  longitude: number,
): Promise<GeocodeOutcome> {
  const apiKey = publicEnv.mapsApiKey;
  if (apiKey === undefined) return { kind: 'UNAVAILABLE', reason: 'no-maps-key' };

  try {
    configureMaps(apiKey);
    const { Geocoder } = await importLibrary('geocoding');
    const { results } = await new Geocoder().geocode({
      location: { lat: latitude, lng: longitude },
    });
    const components = results[0]?.address_components ?? [];
    const stateName = componentNamed(components, 'administrative_area_level_1');
    const code = stateName === undefined ? undefined : territoryCodeFromName(stateName);
    if (code === undefined) return { kind: 'UNAVAILABLE', reason: 'no-match' };
    return {
      kind: 'RESOLVED',
      place: {
        territoryCode: code,
        district: componentNamed(components, 'administrative_area_level_2'),
      },
    };
  } catch {
    return { kind: 'UNAVAILABLE', reason: 'geocoder-failed' };
  }
}

/** Promise wrapper around the browser geolocation callback API. */
export async function currentCoords(): Promise<GeolocationCoordinates | undefined> {
  if (!('geolocation' in navigator)) return undefined;
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve(position.coords);
      },
      () => {
        resolve(undefined);
      },
      { timeout: 8_000, maximumAge: 600_000 },
    );
  });
}

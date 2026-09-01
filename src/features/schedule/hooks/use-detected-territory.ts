'use client';

import { useCallback, useState } from 'react';

import { currentCoords, resolvePlaceFromCoords } from '../lib/geocode';

export type LocationState = 'idle' | 'locating' | 'unavailable';

export interface DetectedTerritory {
  readonly state: LocationState;
  readonly district: string | undefined;
  readonly detect: () => Promise<void>;
  readonly forget: () => void;
}

/**
 * Wraps the optional geolocation shortcut. Any failure ends in `unavailable`,
 * which leaves the manual picker as the way through.
 */
export function useDetectedTerritory(
  onTerritoryDetected: (code: string) => void,
): DetectedTerritory {
  const [state, setState] = useState<LocationState>('idle');
  const [district, setDistrict] = useState<string>();

  const detect = useCallback(async () => {
    setState('locating');
    const coords = await currentCoords();
    const outcome =
      coords === undefined
        ? undefined
        : await resolvePlaceFromCoords(coords.latitude, coords.longitude);

    if (outcome === undefined || outcome.kind === 'UNAVAILABLE') {
      setState('unavailable');
      return;
    }
    onTerritoryDetected(outcome.place.territoryCode);
    setDistrict(outcome.place.district);
    setState('idle');
  }, [onTerritoryDetected]);

  const forget = useCallback(() => {
    setDistrict(undefined);
  }, []);

  return { state, district, detect, forget };
}

/**
 * Grid position of each State/UT in a tile cartogram. A tile map, rather than a
 * true-shape choropleth, keeps every territory the same size and legible - small
 * Union Territories are as visible as large States - and needs no map data.
 */
export const CARTOGRAM_GRID: Readonly<Record<string, readonly [row: number, col: number]>> = {
  LA: [0, 4],
  JK: [1, 3],
  PB: [2, 2],
  CH: [2, 3],
  HP: [2, 4],
  UT: [2, 5],
  RJ: [3, 1],
  HR: [3, 2],
  DL: [3, 3],
  UP: [3, 4],
  BR: [3, 5],
  SK: [3, 6],
  AR: [3, 7],
  GJ: [4, 0],
  MP: [4, 1],
  DH: [4, 2],
  CT: [4, 3],
  JH: [4, 4],
  WB: [4, 5],
  AS: [4, 6],
  NL: [4, 7],
  MH: [5, 1],
  TG: [5, 2],
  OR: [5, 3],
  ML: [5, 6],
  MN: [5, 7],
  GA: [6, 1],
  KA: [6, 2],
  AP: [6, 3],
  TR: [6, 6],
  MZ: [6, 7],
  LD: [7, 0],
  KL: [7, 1],
  TN: [7, 2],
  PY: [7, 3],
  AN: [7, 4],
};

export const TILE = 46;
export const GAP = 4;
export const COLUMNS = 8;
export const ROWS = 8;

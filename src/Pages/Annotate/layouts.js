const defaultLayoutLg = [
  { w: 48, h: 7, x: 0, y: 0, i: "tagSelector" },
  { w: 30, h: 35, x: 0, y: 7, i: "document" },
  { w: 18, h: 35, x: 30, y: 7, i: "legend" }
];
const defaultLayoutMd = [
  { w: 40, h: 7, x: 0, y: 0, i: "tagSelector" },
  { w: 30, h: 35, x: 0, y: 7, i: "document" },
  { w: 10, h: 35, x: 30, y: 7, i: "legend" }
];
const defaultLayoutSm = [
  { w: 24, h: 7, x: 0, y: 0, i: "tagSelector" },
  { w: 16, h: 25, x: 0, y: 7, i: "document" },
  { w: 8, h: 25, x: 16, y: 7, i: "legend" }
];
const defaultLayoutXs = [
  { w: 16, h: 7, x: 0, y: 0, i: "tagSelector" },
  { w: 16, h: 20, x: 0, y: 20, i: "document" },
  { w: 16, h: 13, x: 0, y: 7, i: "legend" }
];
const defaultLayoutXxs = [
  { w: 8, h: 7, x: 0, y: 0, i: "tagSelector" },
  { w: 8, h: 15, x: 0, y: 20, i: "document" },
  { w: 8, h: 13, x: 0, y: 7, i: "legend" }
];

export const defaultLayouts = {
  lg: defaultLayoutLg,
  md: defaultLayoutMd,
  sm: defaultLayoutSm,
  xs: defaultLayoutXs,
  xxs: defaultLayoutXxs
};

const defaultLayoutLg = [
  { w: 30, h: 12, x: 0, y: 0, i: "tagSelector", minH: 7 },
  { w: 10, h: 40, x: 38, y: 0, i: "manageFiles" },
  { w: 30, h: 30, x: 0, y: 12, i: "document" },
  { w: 8, h: 40, x: 30, y: 0, i: "legend" },
];
const defaultLayoutMd = [
  { w: 24, h: 12, x: 0, y: 0, i: "tagSelector", minH: 7 },
  { w: 8, h: 40, x: 32, y: 0, i: "manageFiles" },
  { w: 24, h: 33, x: 0, y: 12, i: "document" },
  { w: 8, h: 40, x: 24, y: 0, i: "legend" },
];
const defaultLayoutSm = [
  { w: 16, h: 12, x: 0, y: 0, i: "tagSelector", minH: 7 },
  { w: 8, h: 22, x: 16, y: 0, i: "manageFiles" },
  { w: 16, h: 31, x: 0, y: 12, i: "document" },
  { w: 8, h: 16, x: 16, y: 7, i: "legend" },
];
const defaultLayoutXs = [
  { w: 16, h: 7, x: 0, y: 0, i: "tagSelector", minH: 7 },
  { w: 16, h: 10, x: 0, y: 7, i: "manageFiles" },
  { w: 16, h: 20, x: 0, y: 23, i: "document" },
  { w: 16, h: 6, x: 0, y: 11, i: "legend" },
];
const defaultLayoutXxs = [
  { w: 8, h: 7, x: 0, y: 0, i: "tagSelector", minH: 7 },
  { w: 8, h: 8, x: 0, y: 7, i: "manageFiles" },
  { w: 8, h: 15, x: 0, y: 23, i: "document" },
  { w: 8, h: 8, x: 0, y: 15, i: "legend" },
];

export const defaultLayouts = {
  lg: defaultLayoutLg,
  md: defaultLayoutMd,
  sm: defaultLayoutSm,
  xs: defaultLayoutXs,
  xxs: defaultLayoutXxs,
};

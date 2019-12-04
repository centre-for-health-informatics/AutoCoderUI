const defaultLayoutLg = [
  { w: 30, h: 7, x: 0, y: 0, i: "tagSelector" },
  { w: 18, h: 7, x: 30, y: 0, i: "import-export" },
  { w: 30, h: 35, x: 0, y: 7, i: "document" },
  { w: 18, h: 35, x: 30, y: 7, i: "legend" }
];
const defaultLayoutMd = [
  { w: 30, h: 7, x: 0, y: 0, i: "tagSelector" },
  { w: 10, h: 7, x: 30, y: 0, i: "import-export" },
  { w: 30, h: 35, x: 0, y: 7, i: "document" },
  { w: 10, h: 35, x: 30, y: 7, i: "legend" }
];
const defaultLayoutSm = [
  { w: 16, h: 7, x: 0, y: 0, i: "tagSelector" },
  { w: 8, h: 7, x: 16, y: 0, i: "import-export" },
  { w: 16, h: 25, x: 0, y: 7, i: "document" },
  { w: 8, h: 25, x: 16, y: 7, i: "legend" }
];
const defaultLayoutXs = [
  { w: 16, h: 7, x: 0, y: 0, i: "tagSelector" },
  { w: 16, h: 4, x: 0, y: 7, i: "import-export" },
  { w: 16, h: 20, x: 0, y: 24, i: "document" },
  { w: 16, h: 20, x: 0, y: 11, i: "legend" }
];
const defaultLayoutXxs = [
  { w: 8, h: 7, x: 0, y: 0, i: "tagSelector" },
  { w: 8, h: 4, x: 0, y: 7, i: "import-export" },
  { w: 8, h: 15, x: 0, y: 21, i: "document" },
  { w: 8, h: 10, x: 0, y: 11, i: "legend" }
];

export const defaultLayouts = {
  lg: defaultLayoutLg,
  md: defaultLayoutMd,
  sm: defaultLayoutSm,
  xs: defaultLayoutXs,
  xxs: defaultLayoutXxs
};

const getColors = number => {
  if (number <= 11) {
    return [
      "#9df283",
      "#d3a3f7",
      "#fcba03",
      "#f277c3",
      "#accdef",
      "#f4bda1",
      "#c0c4ab",
      "#8ccab5",
      "#f1aec3",
      "#dfb3d4",
      "#cdb7e4"
    ].sort((a, b) => 0.5 - Math.random());
  }
  const colormapper = require("colormap");

  const colors = colormapper({
    colormap: [
      { index: 0, rgb: [172, 205, 239] },
      { index: 0.1, rgb: [244, 189, 161] },
      { index: 0.2, rgb: [140, 202, 181] },
      { index: 0.3, rgb: [241, 174, 195] },
      { index: 0.4, rgb: [205, 183, 228] },
      { index: 0.5, rgb: [127, 202, 212] },
      { index: 0.6, rgb: [149, 156, 243] },
      { index: 0.7, rgb: [222, 146, 202] },
      { index: 0.8, rgb: [202, 210, 213] },
      { index: 0.9, rgb: [244, 196, 199] },
      { index: 1, rgb: [130, 156, 182] }
    ],
    nshades: number,
    format: "hex",
    alpha: 0.5
  });

  return colors;
};

export default getColors;

export const getWindowSize = (width) => {
  if (width > 1199) {
    return "xl";
  } else if (width > 991) {
    return "lg";
  } else if (width > 767) {
    return "md";
  } else if (width > 575) {
    return "sm";
  } else {
    return "xs";
  }
};

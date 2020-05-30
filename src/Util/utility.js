import { getWindowSize } from "./windowSizeBracket";

/**
 * Used to convert and format dates received from API to local timezone
 * @param {*} time - the date to format
 * @param {*} recent - true to show "5 minutes ago" etc, up to 24 hours. False to show date/time always
 * return - relevant parts of the date
 */
export const timeFormat = (time, recent) => {
  const date = new Date(time);
  if (recent) {
    const difference = new Date() - date;
    if (difference < 60000) {
      return Math.floor(difference / 1000) + " second" + (Math.floor(difference / 1000) === 1 ? "" : "s") + " ago";
    } else if (difference < 3600000) {
      return Math.floor(difference / 60000) + " minute" + (Math.floor(difference / 60000) === 1 ? "" : "s") + " ago";
    } else if (difference < 86400000) {
      return Math.floor(difference / 3600000) + " hour" + (Math.floor(difference / 3600000) === 1 ? "" : "s") + " ago";
    }
  }
  const dateString = date.toString();
  const pieces = dateString.split(" ");
  return pieces[1] + " " + pieces[2] + " " + pieces[3] + " " + pieces[4];
};

export const getModalWidth = (windowWidth) => {
  const modalWidth = { xs: "95%", sm: "60%", md: "70%", lg: "70%", xl: "70%" };
  const size = getWindowSize(windowWidth);

  switch (size) {
    case "xs":
      return modalWidth.xs;
    case "sm":
      return modalWidth.sm;
    case "md":
      return modalWidth.md;
    case "lg":
      return modalWidth.lg;
    case "xl":
      return modalWidth.xl;
    default:
      return "100%";
  }
};

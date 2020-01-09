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

/**
 * Used to convert and format dates received from API to local timezone
 * @param {*} time - the date to format
 * return - relevant parts of the date
 */
export const timeFormat = (time, recent) => {
  const date = new Date(time);
  if (recent) {
    const difference = new Date() - date;
    if (difference < 60000) {
      return Math.floor(difference / 1000) + " seconds ago";
    } else if (difference < 3600000) {
      return Math.floor(difference / 60000) + " minutes ago";
    } else if (difference < 86400000) {
      return Math.floor(difference / 3600000) + " hours ago";
    }
  }
  const dateString = date.toString();
  const pieces = dateString.split(" ");
  return pieces[1] + " " + pieces[2] + " " + pieces[3] + " " + pieces[4];
};

/**
 * Used to convert and format dates received from API to local timezone
 * @param {*} time - the date to format
 * return - relevant parts of the date
 */
export const timeFormat = time => {
  const date = new Date(time);
  const dateString = date.toString();
  const pieces = dateString.split(" ");
  return pieces[1] + " " + pieces[2] + " " + pieces[3] + " " + pieces[4];
};

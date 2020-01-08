export const timeFormat = time => {
  const date = new Date(time);
  const dateString = date.toString();
  const pieces = dateString.split(" ");
  return pieces[1] + " " + pieces[2] + " " + pieces[3] + " " + pieces[4];
};

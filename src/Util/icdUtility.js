/**
 * add a dot after the third digit of an ICD code
 * @param {*} code string version of an ICD code
 */
export const addDotToCode = code => {
  if (code.includes(".")) {
    return code;
  }
  if (code.includes("-") || code.includes("Chapter")) {
    return code;
  } else {
    return addDotToRegularCode(code);
  }
};

function addDotToRegularCode(code) {
  let codeToReturn = "";
  let codes = code.split(",");
  for (let i = 0; i < codes.length; i++) {
    if (codes[i].length > 3) {
      codes[i] = codes[i].slice(0, 3) + "." + codes[i].slice(3);
    }
    codeToReturn += codes[i] + ",";
  }
  codeToReturn = codeToReturn.slice(0, -1);
  return codeToReturn;
}

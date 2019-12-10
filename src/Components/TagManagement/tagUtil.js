import getColors from "../../Util/colorMap";
import * as templateTags from "./defaultTags";

export const mapColors = tags => {
  const tagsWithoutColors = [];
  for (let tag of tags) {
    if (tag.color === undefined || tag.color === "") {
      tagsWithoutColors.push(tag);
    }
  }
  const newColors = getColors(tagsWithoutColors.length);
  for (let i = 0; i < tagsWithoutColors.length; i++) {
    // add color
    tagsWithoutColors[i].color = newColors[i];
  }
};

/**
 * Function that loads default tags and append to existing set, requires setter and getter functions for accessing Redux store as arguments.
 */
export const addDefaultTags = (setTagTemplates, tagTemplates) => {
  if (tagTemplates === null || tagTemplates === undefined || tagTemplates.length === 0) {
    setTagTemplates(templateTags.DEFAULTS);
  } else {
    // add defaultTags to existing tags

    const existingTags = Array.from(tagTemplates);

    for (let tag of templateTags.DEFAULTS) {
      let tagWithSameId = existingTags.find(item => tag.id === item.id);
      if (tagWithSameId !== undefined) {
        // overwirte tag with same id
        existingTags[existingTags.indexOf(tagWithSameId)] = tag;
      } else {
        // add new tag from default template
        existingTags.unshift(tag);
      }
    }

    setTagTemplates(existingTags);
  }
};

/**
 * Function that loads default tags upon initialization, requires setter and getter functions for accessing Redux store as arguments.
 */
export const setDefaultTags = (setTagTemplates, tagTemplates) => {
  if (tagTemplates === null || tagTemplates === undefined || tagTemplates.length === 0) {
    setTagTemplates(templateTags.DEFAULTS);
  }
};

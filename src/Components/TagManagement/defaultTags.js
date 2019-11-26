import * as tagTypes from "./tagTypes";

export const DEFAULTS = [
  { id: "NEG_F", description: "NEGATION_FORWARD", color: "#fcba03", disabled: false, type: tagTypes.ENTITIES },
  { id: "NEG_B", description: "NEGATION_BACKWARD", color: "#88f7af", disabled: false, type: tagTypes.ENTITIES },
  { id: "NEG_BI", description: "NEGATION_BIDIRECTIONAL", color: "#9df283", disabled: false, type: tagTypes.ENTITIES },
  { id: "CLOS_B", description: "CLOSURE_BUT", color: "#f277c3", disabled: false, type: tagTypes.ENTITIES },
  { id: "meds", description: "", color: "", disabled: false, type: tagTypes.SECTIONS },
  { id: "other_dx", description: "", color: "", disabled: false, type: tagTypes.SECTIONS },
  { id: "fam_hist", description: "", color: "", disabled: false, type: tagTypes.SECTIONS },
  { id: "exam", description: "", color: "", disabled: false, type: tagTypes.SECTIONS },
  { id: "course", description: "", color: "", disabled: false, type: tagTypes.SECTIONS },
  { id: "discharge_position", description: "", color: "", disabled: false, type: tagTypes.SECTIONS },
  { id: "plan", description: "", color: "", disabled: false, type: tagTypes.SECTIONS },
  { id: "icu", description: "", color: "", disabled: false, type: tagTypes.SECTIONS },
  { id: "past_med_hist", description: "", color: "", disabled: false, type: tagTypes.SECTIONS },
  { id: "admit_dx", description: "", color: "", disabled: false, type: tagTypes.SECTIONS },
  { id: "hpi", description: "", color: "", disabled: false, type: tagTypes.SECTIONS },
  { id: "followup", description: "", color: "", disabled: false, type: tagTypes.SECTIONS },
  { id: "main_dx", description: "", color: "", disabled: false, type: tagTypes.SECTIONS },
  { id: "allergies", description: "", color: "", disabled: false, type: tagTypes.SECTIONS },
  { id: "id", description: "", color: "", disabled: false, type: tagTypes.SECTIONS }
];

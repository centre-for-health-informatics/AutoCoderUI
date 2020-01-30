import * as tagTypes from "./tagTypes";

export const DEFAULTS = [
  { id: "NEG_F", description: "NEGATION_FORWARD", color: "#9df283", disabled: false, type: "Logic" },
  { id: "NEG_B", description: "NEGATION_BACKWARD", color: "#d3a3f7", disabled: false, type: "Logic" },
  { id: "NEG_BI", description: "NEGATION_BIDIRECTIONAL", color: "#fcba03", disabled: false, type: "Logic" },
  { id: "CLOS_B", description: "CLOSURE_BUT", color: "#f277c3", disabled: false, type: "Logic" },
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
  { id: "id", description: "", color: "", disabled: false, type: tagTypes.SECTIONS },
  { id: "NA", description: "NOT APPLICABLE", color: "", disabled: false, type: tagTypes.SECTIONS }
].sort((a, b) => (a.id > b.id ? 1 : -1));

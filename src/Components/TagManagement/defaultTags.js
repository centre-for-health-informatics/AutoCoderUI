import * as tagTypes from "./tagTypes";

export const DEFAULTS = [
  { id: "NEG_F", description: "NEGATION_FORWARD", color: "#9df283", disabled: false, type: "Logic" },
  { id: "NEG_B", description: "NEGATION_BACKWARD", color: "#d3a3f7", disabled: false, type: "Logic" },
  { id: "NEG_BI", description: "NEGATION_BIDIRECTIONAL", color: "#fcba03", disabled: false, type: "Logic" },
  { id: "CLOS_B", description: "CLOSURE_BUT", color: "#f277c3", disabled: false, type: "Logic" },
  { id: "meds", description: "", color: "", disabled: false, type: "Sections" },
  { id: "other_dx", description: "", color: "", disabled: false, type: "Sections" },
  { id: "fam_hist", description: "", color: "", disabled: false, type: "Sections" },
  { id: "exam", description: "", color: "", disabled: false, type: "Sections" },
  { id: "course", description: "", color: "", disabled: false, type: "Sections" },
  { id: "discharge_position", description: "", color: "", disabled: false, type: "Sections" },
  { id: "plan", description: "", color: "", disabled: false, type: "Sections" },
  { id: "icu", description: "", color: "", disabled: false, type: "Sections" },
  { id: "past_med_hist", description: "", color: "", disabled: false, type: "Sections" },
  { id: "admit_dx", description: "", color: "", disabled: false, type: "Sections" },
  { id: "hpi", description: "", color: "", disabled: false, type: "Sections" },
  { id: "followup", description: "", color: "", disabled: false, type: "Sections" },
  { id: "main_dx", description: "", color: "", disabled: false, type: "Sections" },
  { id: "allergies", description: "", color: "", disabled: false, type: "Sections" },
  { id: "id", description: "", color: "", disabled: false, type: "Sections" },
  { id: "NA", description: "NOT APPLICABLE", color: "", disabled: false, type: "Sections" }
].sort((a, b) => (a.id > b.id ? 1 : -1));

import React from "react";
import IntervalTree from "@flatten-js/interval-tree";

const backgroundColor = "transparent";
let colorIndex;
export const alternatingColors = ["rgb(149,156,243)", "rgb(244,196,199)"];

export const Interval = props => {
  if (props.index === props.intervals.length - 1) {
    if (!props.spansRendered) {
      props.setSpansRendered(true);
    }
  }
  // if the interval needs to be marked, return a mark instead
  if (props.mark) {
    return <Mark {...props} />;
  }

  // Else: return regular span
  // ID spans at the start and end for the purpose of drawing lines between linked annotations.
  // getBoundingClientRect draws rectangle around the element, which is problematic for annotations
  // that span more than 1 line of text.
  // Background image is a gradient of the background color and a blue line under the text.
  // This line is to easily distinguish which line of text the annotations are for.
  return (
    <React.Fragment>
      <span id={props.start + "-start"} />
      <span
        style={{
          backgroundImage: "linear-gradient(" + backgroundColor + " 90%, steelblue 90%, steelblue 100%)"
        }}
        data-start={props.start}
        data-end={props.end}
        onClick={event => props.onClick(event, props.start, props.end)}
        id={props.start}
      >
        {props.content}
      </span>
    </React.Fragment>
  );
};

export const Mark = props => {
  // ID spans at the start and end for the purpose of drawing lines between linked annotations.
  // getBoundingClientRect draws rectangle around the element, which is problematic for annotations
  // that span more than 1 line of text.
  // Background image is a gradient of the background color and a blue line under the text.
  // This line is to easily distinguish which line of text the annotations are for.
  return (
    <React.Fragment>
      <span id={props.start + "-start"} style={{ whiteSpace: "nowrap" }} />
      <mark
        style={{
          backgroundImage: props.gradient,
          backgroundColor: backgroundColor
        }}
        data-start={props.start}
        data-end={props.end}
        onClick={event => props.onClick(event, props.start, props.end)}
        id={props.start}
      >
        {props.content}
        {/* {props.tag && <span style={{ fontSize: "0.7em", fontWeight: 500, marginLeft: 6 }}>{props.tag}</span>} */}
      </mark>
    </React.Fragment>
  );
};

// Method to draw a line between linked annotations
export const drawLine = (annotation, i, tagTemplates) => {
  // only draw a line if the annotation has a next property (linked annotation)
  if (annotation.next) {
    // getting offsets for the other components on the page above the annotations
    let xOffset = document.getElementById("docDisplay").getBoundingClientRect().left;
    let yOffset = document.getElementById("docDisplay").getBoundingClientRect().top;

    // Setting coordinates of the line start and end to the empty spans before and after intervals.
    // First coordinate is the end of the first annotation and second is the start of the second annotation.
    // -9999999 for when a user makes linked annotations and then switches to a different page or radio button,
    // then switches back.
    // This function happens too quickly for the intervals to all be created, so the getElementById returns null
    // and getBoundingClientRect of a null object causes the system to crash.
    // Need to update store to redraw the proper lines once the elements have been created successfully.
    let x1 = document.getElementById(annotation.end + "-start")
      ? document.getElementById(annotation.end + "-start").getBoundingClientRect().left - xOffset
      : -9999999;
    let x2 = document.getElementById(annotation.next.start + "-start")
      ? document.getElementById(annotation.next.start + "-start").getBoundingClientRect().left - xOffset
      : -9999999;
    let y1 = document.getElementById(annotation.end + "-start")
      ? document.getElementById(annotation.end + "-start").getBoundingClientRect().top -
        yOffset +
        document.getElementById(annotation.end + "-start").getBoundingClientRect().height / 2
      : -9999999;
    let y2 = document.getElementById(annotation.next.start + "-start")
      ? document.getElementById(annotation.next.start + "-start").getBoundingClientRect().top -
        yOffset +
        document.getElementById(annotation.next.start + "-start").getBoundingClientRect().height / 2
      : -9999999;

    // returning a dashed line
    return (
      <line
        key={i}
        strokeWidth="4px"
        strokeDasharray="4"
        stroke={getColorFromTagType(annotation, tagTemplates)}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
      />
    );
  }
};

// creates the intervals to display
export const createIntervals = (text, annotations, tagTemplates) => {
  if (!annotations) {
    annotations = [];
  }
  colorIndex = 0;
  // set of breakpoints to create all intervals
  let breakPoints = new Set();
  for (let annotation of annotations) {
    breakPoints.add(annotation.start);
    breakPoints.add(annotation.end);
  }
  breakPoints.add(0);
  breakPoints.add(text.length - 1);

  // sorting breakpoints so intervals can be created in order
  breakPoints = Array.from(breakPoints).sort((a, b) => {
    return parseInt(a) - parseInt(b);
  });

  let intervals = [];

  // creating intervals with content
  for (let i = 0; i < breakPoints.length - 1; i++) {
    intervals.push({
      start: breakPoints[i],
      end: breakPoints[i + 1],
      content: text.slice(breakPoints[i], breakPoints[i + 1])
    });
  }

  let tree = new IntervalTree(); // tree library uses inclusive end points

  // inserting all annotations into the interval tree
  for (let i = 0; i < annotations.length; i++) {
    tree.insert([annotations[i].start, annotations[i].end - 1], i + 1); // i + 1 --- tree library won't let you use 0 as a key
  }

  // determining the annotations in each interval
  for (let interval of intervals) {
    interval.annotes = tree.search([interval.start, interval.end - 1]);
    interval.numAnnotes = interval.annotes.length;
  }

  // assigning colors to annotations (also creates the gradient in another helper function)
  intervals = colorAnnotations(intervals, annotations, tagTemplates);

  return intervals;
};

// gets color from tagTemplates, or alternates colors for sentences
const getColorFromTagType = (annotation, tagTemplates) => {
  if (annotation.type === undefined || annotation.tag === "") {
    if (colorIndex === 0) {
      colorIndex = 1;
      return alternatingColors[0];
    } else {
      colorIndex = 0;
      return alternatingColors[1];
    }
  }
  for (let tagTemplate of tagTemplates) {
    if (tagTemplate.id === annotation.tag && tagTemplate.type === annotation.type) {
      return tagTemplate.color;
    }
  }
};

// assigns colors to intervals
const colorAnnotations = (intervals, annotations, tagTemplates) => {
  let prevInterval;
  for (let interval of intervals) {
    // if the neighbouring interval contains the same annotation as the current one, the percentage
    // of the height occupied must be the same. This is "increasing" the number of annotations in an interval
    // to give the appropriate height percent to the annotation
    for (let annote of interval.annotes) {
      for (let innerInterval of intervals) {
        if (innerInterval.annotes.includes(annote)) {
          if (innerInterval.numAnnotes > interval.numAnnotes) {
            interval.numAnnotes = innerInterval.numAnnotes;
          }
        }
      }
    }

    // if there are annotations, set mark to true so it will be rendered with a Mark object
    if (interval.numAnnotes > 0) {
      interval.mark = true;
      interval.colors = [];
      for (let i = 0; i < interval.annotes.length; i++) {
        // setting color or a default color
        interval.colors.push(getColorFromTagType(annotations[interval.annotes[i] - 1], tagTemplates) || "#34e4ed");
        // interval.colors.push(annotations[interval.annotes[i] - 1].color || "#34e4ed");
      }
      // adding colours
      while (interval.colors.length < interval.numAnnotes) {
        interval.colors.push(backgroundColor);
      }

      // make sure colours are in the right order to ensure the annotation is seamless
      if (prevInterval && prevInterval.numAnnotes === interval.numAnnotes) {
        matchColors(prevInterval, interval);
      }
    }

    prevInterval = interval;
  }

  intervals = createGradients(intervals);
  return intervals;
};

// helper functions to align colours across different intervals
const matchColors = (prevInterval, interval) => {
  for (let i = 0; i < prevInterval.colors.length; i++) {
    // setting same colour of each interval to same index
    if (prevInterval.colors[i] !== backgroundColor && interval.colors.includes(prevInterval.colors[i])) {
      let colorIndex = interval.colors.indexOf(prevInterval.colors[i]);
      // swapping colours
      if (colorIndex > -1) {
        let temp = Array.from(interval.colors);
        temp[colorIndex] = interval.colors[i];
        temp[i] = prevInterval.colors[i];
        interval.colors = temp;
      }
    }
  }
};

// creates the gradient for highlighting intervals
const createGradients = intervals => {
  // percentage of the height that is allocated to annotation highlighting
  let highlightPercent = 90;
  for (let interval of intervals) {
    if (interval.numAnnotes > 0) {
      let percents = [];
      // splitting the line into height
      let multiplier = highlightPercent / interval.numAnnotes;
      for (let i = 0; i < highlightPercent; i += multiplier) {
        percents.push(i + multiplier);
      }

      // creating gradient string to pass to css
      interval.gradient = "linear-gradient(";

      // only 1 annotation - takes the whole space
      if (interval.numAnnotes === 1) {
        interval.gradient += interval.colors[0] + " 0%," + interval.colors[0] + " " + highlightPercent + "%,";
      } else {
        // first colour
        interval.gradient += interval.colors[0] + " " + percents[0] + "%,";
        // 2nd colour to the 2nd last colour
        for (let i = 1; i < percents.length - 1; i++) {
          interval.gradient += interval.colors[i] + " " + percents[i - 1] + "%,";
          interval.gradient += interval.colors[i] + " " + percents[i] + "%,";
        }
        // last colour
        interval.gradient +=
          interval.colors[percents.length - 1] +
          " " +
          percents[percents.length - 2] +
          "%," +
          interval.colors[percents.length - 1] +
          " " +
          percents[percents.length - 1] +
          "%,";
      }
      // adding lines between lines of text to help separate the annotations
      interval.gradient += " steelblue " + highlightPercent + "%,";
      interval.gradient += " steelblue 100%";
      interval.gradient += ")";
    }
  }

  return intervals;
};

// returns true if the user selects text backwards
export const selectionIsBackwards = selection => {
  if (selectionIsEmpty(selection)) {
    return false;
  }
  let position = selection.anchorNode.compareDocumentPosition(selection.focusNode);

  let backward = false;
  if ((!position && selection.anchorOffset > selection.focusOffset) || position === Node.DOCUMENT_POSITION_PRECEDING) {
    backward = true;
  }

  return backward;
};

// returns true if the user selects text backwards
export const selectionIsBackwards2 = (start, end) => {
  if (start > end) {
    return true;
  }
  return false;
};

// checks if selection is empty
export const selectionIsEmpty = selection => {
  if (selection.anchorNode) {
    let position = selection.anchorNode.compareDocumentPosition(selection.focusNode);
    return position === 0 && selection.focusOffset === selection.anchorOffset;
  } else {
    return true;
  }
};

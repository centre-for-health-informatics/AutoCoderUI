import React from "react";
import IntervalTree from "@flatten-js/interval-tree";
import { getThemeProps } from "@material-ui/styles";

const backgroundColor = "transparent";

export const Interval = props => {
  if (props.mark) {
    return <Mark {...props} />;
  }

  return (
    <React.Fragment>
      <span id={props.start + "-start"} />
      <span
        style={{
          backgroundImage: "linear-gradient(" + backgroundColor + " 90%, steelblue 90%, steelblue 100%)"
        }}
        data-start={props.start}
        data-end={props.end}
        onClick={() => props.onClick({ start: props.start, end: props.end })}
        id={props.start}
      >
        {props.content}
      </span>
      <span id={props.start + "-end"} />
    </React.Fragment>
  );
};

export const Mark = props => {
  return (
    <React.Fragment>
      <span id={props.start + "-start"} />
      <mark
        style={{
          backgroundImage: props.gradient,
          backgroundColor: backgroundColor
        }}
        data-start={props.start}
        data-end={props.end}
        onClick={() => props.onClick({ start: props.start, end: props.end })}
        id={props.start}
      >
        {props.content}
        {props.tag && <span style={{ fontSize: "0.7em", fontWeight: 500, marginLeft: 6 }}>{props.tag}</span>}
      </mark>
      <span id={props.start + "-end"} />
    </React.Fragment>
  );
};

export const drawLine = annotation => {
  if (annotation.next) {
    let xOffset = document.getElementById("docDisplay").getBoundingClientRect().left;
    let yOffset = document.getElementById("docDisplay").getBoundingClientRect().top;

    let x1 = document.getElementById(annotation.end + "-start").getBoundingClientRect().left - xOffset;
    let x2 = document.getElementById(annotation.next.start + "-start").getBoundingClientRect().left - xOffset;
    let y1 =
      document.getElementById(annotation.end + "-start").getBoundingClientRect().top -
      yOffset +
      document.getElementById(annotation.end + "-start").getBoundingClientRect().height / 2;
    let y2 =
      document.getElementById(annotation.next.start + "-start").getBoundingClientRect().top -
      yOffset +
      document.getElementById(annotation.next.start + "-start").getBoundingClientRect().height / 2;
    console.log(x1, x2, y1, y2);
    return <line strokeWidth="3px" stroke-dasharray="4" stroke={annotation.color} x1={x1} y1={y1} x2={x2} y2={y2} />;
  }
};

// creates the intervals to display
export const createIntervals = (text, annotations) => {
  let breakPoints = new Set();
  for (let annotation of annotations) {
    breakPoints.add(annotation.start);
    breakPoints.add(annotation.end);
    breakPoints.add(0);
    breakPoints.add(text.length - 1);
  }

  breakPoints = Array.from(breakPoints).sort((a, b) => {
    return parseInt(a) - parseInt(b);
  });

  let intervals = [];

  for (let i = 0; i < breakPoints.length - 1; i++) {
    intervals.push({
      start: breakPoints[i],
      end: breakPoints[i + 1],
      content: text.slice(breakPoints[i], breakPoints[i + 1])
    });
  }

  let tree = new IntervalTree(); // tree library uses inclusive end points

  for (let i = 0; i < annotations.length; i++) {
    tree.insert([annotations[i].start, annotations[i].end - 1], i + 1); // i + 1 --- tree library won't let you use 0 as a key
  }

  for (let interval of intervals) {
    interval.annotes = tree.search([interval.start, interval.end - 1]);
    interval.numAnnotes = interval.annotes.length;
  }

  intervals = colorAnnotations(intervals, annotations);

  return intervals;
};

// assigns colors to intervals
const colorAnnotations = (intervals, annotations) => {
  // let backgroundColor = "transparent";
  let prevInterval;
  for (let interval of intervals) {
    for (let annote of interval.annotes) {
      for (let innerInterval of intervals) {
        if (innerInterval.annotes.includes(annote)) {
          if (innerInterval.numAnnotes > interval.numAnnotes) {
            interval.numAnnotes = innerInterval.numAnnotes;
          }
        }
      }
    }

    if (interval.numAnnotes > 0) {
      interval.mark = true;
      interval.colors = [];
      for (let i = 0; i < interval.annotes.length; i++) {
        interval.colors.push(annotations[interval.annotes[i] - 1].color || "#34e4ed");
      }
      while (interval.colors.length < interval.numAnnotes) {
        interval.colors.push(backgroundColor);
      }

      if (prevInterval && prevInterval.numAnnotes === interval.numAnnotes) {
        matchColors(prevInterval, interval);
      }
    }

    prevInterval = interval;
  }

  intervals = createGradients(intervals);
  return intervals;
};

const matchColors = (prevInterval, interval) => {
  for (let i = 0; i < prevInterval.colors.length; i++) {
    if (prevInterval.colors[i] !== backgroundColor && interval.colors.includes(prevInterval.colors[i])) {
      let colorIndex = interval.colors.indexOf(prevInterval.colors[i]);
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
  let highlightPercent = 90;
  for (let interval of intervals) {
    if (interval.numAnnotes > 0) {
      let percents = [];
      let multiplier = highlightPercent / interval.numAnnotes;
      for (let i = 0; i < highlightPercent; i += multiplier) {
        percents.push(i + multiplier);
      }

      // creating gradient string to pass to css
      interval.gradient = "linear-gradient(";

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
      // adding blue lines between lines of text to help separate some of the annotations
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

// checks if selection is empty
export const selectionIsEmpty = selection => {
  let position = selection.anchorNode.compareDocumentPosition(selection.focusNode);
  return position === 0 && selection.focusOffset === selection.anchorOffset;
};

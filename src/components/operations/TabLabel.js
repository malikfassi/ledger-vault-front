//@flow
import React from "react";
import { withStyles } from "material-ui/styles";
import type { Note } from "data/types";

const styles = {
  title: {
    outline: "none",
    fontSize: "13px",
    color: "#000",
    fontWeight: "600",
    paddingBottom: "16px",
    marginBottom: "16px",
    borderBottom: "1px solid #eee"
  },
  body: {
    outline: "none",
    fontSize: "13px",
    color: "#000",
    paddingBottom: "16px",
    marginBottom: "16px",
    lineHeight: "20px",
    borderBottom: "1px solid #eee"
  },
  author: {
    fontSize: "11px",
    color: "#999"
  }
};
function TabLabel(props: { note: Note, classes: Object }) {
  const { note, classes } = props;
  return (
    <div>
      <h3 className={classes.title}>{note && note.title}</h3>
      <div className={classes.body}>{note && note.body}</div>
      {note && (
        <div className={classes.author}>
          Published by {note.author.first_name} {note.author.last_name}
        </div>
      )}
    </div>
  );
}

export default withStyles(styles)(TabLabel);

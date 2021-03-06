//@flow
import React from "react";
import DialogButton from "../buttons/DialogButton";
import { TrashIcon } from "../icons";
import "./index.css";

function AbortConfirmation(props: {
  abort: Function,
  aborting: Function,
  entity: string
}) {
  const { abort, aborting, entity } = props;
  return (
    <div className="abort-confirmation">
      <header>
        <TrashIcon />
        <h3>Abort {entity} request</h3>
      </header>

      <div className="content">
        <p>Do you really want to abort the {entity} ?</p>
        <p>
          The request will be cancelled and the {entity} will not be created.
        </p>
      </div>
      <div className="footer">
        <DialogButton highlight className="cancel margin" onTouchTap={aborting}>
          Cancel
        </DialogButton>
        <DialogButton highlight right className="abort" onTouchTap={abort}>
          Abort
        </DialogButton>
      </div>
    </div>
  );
}

export default AbortConfirmation;

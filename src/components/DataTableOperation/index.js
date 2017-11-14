//@flow
import React, { Component } from "react";
import { withRouter } from "react-router";
import DateFormat from "../DateFormat";
import CurrencyNameValue from "../CurrencyNameValue";
import AccountName from "../AccountName";
import Comment from "../icons/Comment";
import DataTable from "../DataTable";
import Tooltip from "../utils/Tooltip";
import type { Operation, Account } from "../../data/types";
import "./index.css";

const getHash = (operation: Operation): string => {
  let hash = "";
  if (operation.type === "SEND") {
    hash = operation.senders[0];
  } else {
    hash = operation.recipients[0];
  }
  return hash;
};

let DataTableOperationCount = 0;

class DataTableOperation extends Component<*> {
  props: {
    accounts?: Array<Account>,
    operations: Array<Operation>,
    columnIds: Array<string>,
    history: *,
    match: *
  };

  id = ++DataTableOperationCount;

  openOperation = (uuid: string, n: number = 0) => {
    this.props.history.push(`${this.props.match.url}/operation/${uuid}/${n}`);
  };

  renderRow = (operation: Operation, index: number, children: *) => (
    <tr
      key={operation.uuid}
      style={{ cursor: "pointer" }}
      onClick={() => this.openOperation(operation.uuid, 0)}
    >
      {children}
    </tr>
  );

  render() {
    const { accounts, operations, columnIds } = this.props;
    const columns = [
      {
        className: "date",
        title: "date",
        renderCell: operation => {
          const note = operation.notes.length > 0 ? operation.notes[0] : null;
          const tooltipId =
            "DataTableOperationCount" + this.id + "_tooltip_" + operation.uuid;
          return (
            <span>
              <DateFormat format="ddd D MMM, h:mmA" date={operation.time} />
              <Comment
                fill="#e2e2e2"
                onClick={e => {
                  e.stopPropagation();
                  this.openOperation(operation.uuid, 2);
                }}
                className="open-label"
                data-tip
                data-for={tooltipId}
              />
              {note && (
                <Tooltip id={tooltipId} className="tooltip-label">
                  <p className="tooltip-label-title">{note.title}</p>
                  <p className="tooltip-label-name">
                    {note.author.firstname} {note.author.name}
                  </p>
                  <div className="hr" />
                  <p className="tooltip-label-body">{note.body}</p>
                </Tooltip>
              )}
            </span>
          );
        }
      },
      {
        className: "account",
        title: "account",
        renderCell: operation => {
          const account =
            accounts && accounts.find(a => a.id === operation.account_id);
          if (!account) return;
          return (
            <AccountName name={account.name} currency={account.currency} />
          );
        }
      },
      {
        className: "address",
        title: "address",
        renderCell: operation => (
          <span>
            <span className="type">
              {operation.type === "SEND" ? "TO" : "FROM"}
            </span>
            <span className="hash">{getHash(operation)}</span>
          </span>
        )
      },
      {
        className: "status",
        title: "status",
        renderCell: operation => (
          <span>
            {operation.confirmations > 0 ? "Confirmed" : "Not confirmed"}
          </span>
        )
      },
      {
        className: "countervalue",
        title: "",
        renderCell: operation => (
          <CurrencyNameValue
            currencyName={operation.currency_name}
            value={operation.amount}
            alwaysShowSign
            countervalue
          />
        )
      },
      {
        className: "amount",
        title: "amount",
        renderCell: operation => (
          <CurrencyNameValue
            currencyName={operation.currency_name}
            value={operation.amount}
            alwaysShowSign
          />
        )
      }
    ].filter(c => columnIds.includes(c.className));
    return (
      <DataTable
        data={operations}
        columns={columns}
        renderRow={this.renderRow}
      />
    );
  }
}

export default withRouter(DataTableOperation);

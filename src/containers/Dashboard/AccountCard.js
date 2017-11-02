//@flow
import React, { Component } from "react";
import type { Account } from "../../datatypes";
import Card from "../../components/Card";
import EvolutionSince from "./EvolutionSince";
import CurrencyNameValue from "../../components/CurrencyNameValue";
import BadgeCurrency from "../../components/BadgeCurrency";

import "./AccountCard.css";

const Separator = () => <div className="separator" />;

class AccountCard extends Component<*> {
  props: {
    account: Account,
    filter: *
  };
  render() {
    const { account, filter } = this.props;

    const title = (
      <div>
        <BadgeCurrency currency={account.currency} />
        <span className="uppercase currencyName">{account.name}</span>
      </div>
    );
    return (
      <Card key={account.id} title={title}>
        <EvolutionSince
          value={account.balance}
          valueHistory={account.balance_history}
          filter={filter}
        />
        <Separator />
        <div>
          <div className="cryptocur">
            <CurrencyNameValue
              currencyName={account.currency.name}
              value={account.balance}
            />
          </div>
          <div className="realcur">
            <CurrencyNameValue
              currencyName={account.currency.name}
              value={account.balance}
              countervalue
            />
          </div>
        </div>
      </Card>
    );
  }
}

export default AccountCard;

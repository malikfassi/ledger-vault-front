//@flow
import connectData from "../../restlay/connectData";
import React, { Component } from "react";
import PieChart from "./PieChart";
import { countervalueForRate, getCurrencyRate } from "../../data/currency";
import type { Account, Currency } from "../../datatypes";
import AccountsQuery from "../../api/queries/AccountsQuery";
import CurrenciesQuery from "../../api/queries/CurrenciesQuery";

function Currencies({
  accounts,
  currencies
}: {
  accounts: Array<Account>,
  currencies: Array<Currency>
}) {
  //compute currencies from accounts balance
  const data = accounts.reduce((acc, account) => {
    const currency_name = account.currency.name;
    const balance = account.balance;
    //check if currency already added
    if (!acc[currency_name]) {
      acc[currency_name] = {
        meta: account.currency,
        balance: 0,
        counterValueBalance: 0
      };
    }
    acc[currency_name].balance += balance;
    acc[currency_name].counterValueBalance += countervalueForRate(
      getCurrencyRate(currencies, currency_name),
      balance
    ).value;
    return acc;
  }, {});

  const pieChartData = Object.keys(data).reduce((currenciesList, c) => {
    currenciesList.push(data[c]);
    return currenciesList;
  }, []);

  return (
    <div className="currencies">
      <PieChart data={pieChartData} />
    </div>
  );
}

class RenderError extends Component<*> {
  render() {
    return <div className="currencies" />;
  }
}

class RenderLoading extends Component<*> {
  render() {
    return <div className="currencies" />;
  }
}

export default connectData(Currencies, {
  queries: {
    accounts: AccountsQuery,
    currencies: CurrenciesQuery
  },
  optimisticRendering: true,
  RenderError,
  RenderLoading
});

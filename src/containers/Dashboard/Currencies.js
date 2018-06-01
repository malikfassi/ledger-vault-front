//@flow
import React from "react";
import connectData from "restlay/connectData";
import { withStyles } from "@material-ui/core/styles";
import PieChart from "components/PieChart";
import { countervalueForRate } from "data/currency";
import type { Account } from "data/types";
import AccountsQuery from "api/queries/AccountsQuery";
import TryAgain from "components/TryAgain";
import SpinnerCard from "components/spinners/SpinnerCard";

type AggregatedData = {
  [_: string]: {
    account: Account,
    balance: number,
    counterValueBalance: number
  }
};

const styles = {
  base: {}
};
function Currencies({
  accounts,
  classes
}: {
  accounts: Array<Account>,
  classes: Object
}) {
  //compute currencies from accounts balance
  const data: AggregatedData = accounts.reduce(
    (acc: AggregatedData, account) => {
      const currency_name = account.currency.name;
      const balance = account.balance;
      //check if currency already added
      if (!acc[currency_name]) {
        acc[currency_name] = {
          account,
          balance: 0,
          counterValueBalance: 0
        };
      }
      acc[currency_name].balance += balance;
      acc[currency_name].counterValueBalance += countervalueForRate(
        account.currencyRateInReferenceFiat,
        balance
      ).value;
      return acc;
    },
    {}
  );
  const pieChartData = Object.keys(data).reduce((currenciesList, c) => {
    currenciesList.push(data[c]);
    return currenciesList;
  }, []);
  return (
    <div className={classes.base}>
      <PieChart
        data={pieChartData}
        showCaptions
        showTooltips
        highlightCaptionsOnHover
        radius={70}
      />
    </div>
  );
}

const RenderError = withStyles(styles)(({ error, restlay, classes }: *) => (
  <div className={classes.base}>
    <TryAgain error={error} action={restlay.forceFetch} />
  </div>
));

const RenderLoading = withStyles(styles)(({ classes }) => (
  <div className={classes.base}>
    <SpinnerCard />
  </div>
));

export default connectData(withStyles(styles)(Currencies), {
  queries: {
    accounts: AccountsQuery
  },
  optimisticRendering: true,
  RenderError,
  RenderLoading
});

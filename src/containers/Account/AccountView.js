//@flow
import React, { Component } from "react";
import connectData from "../../restlay/connectData";
import CurrencyNameValue from "../../components/CurrencyNameValue";
import CurrencyCounterValueConversion from "../../components/CurrencyCounterValueConversion";
import Card from "../../components/Card";
import DateFormat from "../../components/DateFormat";
import CardField from "../../components/CardField";
import ReceiveFundsCard from "./ReceiveFundsCard";
import DataTableOperation from "../../components/DataTableOperation";
import QuicklookGraph from "./QuicklookGraph";
import type { Account, Operation } from "../../datatypes";
import CustomSelectField from "../../components/CustomSelectField/CustomSelectField.js";
import AccountOperationsQuery from "../../api/queries/AccountOperationsQuery";
import AccountQuery from "../../api/queries/AccountQuery";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "./Account.css";

class AccountView extends Component<
  {
    account: Account,
    operations: Array<Operation>,
    reloading: boolean
  },
  *
> {
  constructor(props) {
    super(props);
    this.state = {
      quickLookGraphFilter: this.quickLookGraphFilters[0],
      tabsIndex: 0
    };
  }

  onQuickLookGraphFilterChange = filter => {
    this.setState({ quickLookGraphFilter: filter });
  };

  quickLookGraphFilters = [
    { title: "balance", key: "balance" },
    { title: "countervalue", key: "countervalue" },
    { title: "payments", key: "payments" }
  ];

  selectTab = index => {
    this.setState({ tabsIndex: index });
  };
  getLastWeek = () => {
    var today = new Date();
    var lastWeek = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - 7
    );
    return lastWeek;
  };
  getDateRange = tabsIndex => {
    const max = new Date();
    let min = new Date();
    min =
      tabsIndex === 0
        ? new Date(new Date().setFullYear(new Date().getFullYear() - 1))
        : min;
    min =
      tabsIndex === 1
        ? new Date(new Date().setMonth(new Date().getMonth() - 1))
        : min;
    min = tabsIndex === 2 ? this.getLastWeek() : min;
    min =
      tabsIndex === 3
        ? new Date(new Date().getTime() - 24 * 60 * 60 * 1000)
        : min;

    return [min, max];
  };

  render() {
    const { account, operations, reloading } = this.props;
    const { tabsIndex, quickLookGraphFilter } = this.state;
    const dateRange = this.getDateRange(tabsIndex);
    const beginDate = "March, 13th";
    const endDate = "19th, 2017";
    return (
      <div className="account-view">
        <div className="account-view-infos">
          <div className="infos-left">
            <div className="infos-left-top">
              <Card reloading={reloading} className="balance" title="Balance">
                <CardField label={<DateFormat date={new Date()} />}>
                  <CurrencyNameValue
                    currencyName={account.currency.name}
                    value={account.balance}
                  />
                </CardField>
              </Card>

              <Card
                reloading={reloading}
                className="countervalue"
                title="Countervalue"
              >
                <CardField
                  label={
                    <CurrencyCounterValueConversion
                      currencyName={account.currency.name}
                    />
                  }
                >
                  <CurrencyNameValue
                    currencyName={account.currency.name}
                    value={account.balance}
                    countervalue
                  />
                </CardField>
              </Card>
            </div>
            <ReceiveFundsCard hash={account.receive_address} />
          </div>
          <Card
            reloading={reloading}
            className="quicklook"
            title="Quicklook"
            titleRight={
              <CustomSelectField
                values={this.quickLookGraphFilters}
                selected={quickLookGraphFilter}
                onChange={this.onQuickLookGraphFilterChange}
              />
            }
          >
            <Tabs
              className=""
              selectedIndex={tabsIndex}
              onSelect={this.selectTab}
            >
              <header>
                <TabList>
                  <Tab> Year </Tab>
                  <Tab disabled={false}>month</Tab>
                  <Tab disabled={false}>week</Tab>
                  <Tab disabled={false}>day</Tab>
                </TabList>
              </header>
              <div className="content">
                <TabPanel className="tabs_panel">
                  <div className="dateLabel">
                    {`From ${beginDate} to ${endDate}`}
                  </div>
                  <QuicklookGraph
                    dateRange={dateRange}
                    tick="month"
                    data={operations.map((o: Operation) => ({
                      time: new Date(o.time),
                      amount: o.amount,
                      currency: o.currency
                    }))}
                  />
                </TabPanel>
                <TabPanel className="tabs_panel">
                  <div className="dateLabel">
                    {`From ${beginDate} to ${endDate}`}
                  </div>
                  <QuicklookGraph
                    tick="day"
                    dateRange={dateRange}
                    data={operations.map((o: Operation) => ({
                      time: new Date(o.time),
                      amount: o.amount,
                      currency: o.currency
                    }))}
                  />
                </TabPanel>
                <TabPanel className="tabs_panel">
                  <div className="dateLabel">
                    {`From ${beginDate} to ${endDate}`}
                  </div>
                  <QuicklookGraph
                    tick="day"
                    dateRange={dateRange}
                    data={operations.map((o: Operation) => ({
                      time: new Date(o.time),
                      amount: o.amount,
                      currency: o.currency
                    }))}
                  />
                </TabPanel>
                <TabPanel className="tabs_panel">
                  <div className="dateLabel">
                    {`From ${beginDate} to ${endDate}`}
                  </div>
                  <QuicklookGraph
                    tick="hour"
                    dateRange={dateRange}
                    data={operations.map((o: Operation) => ({
                      time: new Date(o.time),
                      amount: o.amount,
                      currency: o.currency
                    }))}
                  />
                </TabPanel>
              </div>
            </Tabs>
          </Card>
        </div>
        <Card reloading={reloading} title="last operations">
          <DataTableOperation
            operations={operations}
            columnIds={["date", "address", "status", "countervalue", "amount"]}
          />
        </Card>
      </div>
    );
  }
}

// FIXME have a generic component for screen errors
const RenderError = ({ error }: { error: Error }) => (
  <span style={{ color: "#fff" }}>
    {(error && error.message) || error.toString()}
  </span>
);

export default connectData(AccountView, {
  queries: { account: AccountQuery, operations: AccountOperationsQuery },
  propsToQueryParams: props => ({ accountId: props.match.params.id }),
  RenderError
});

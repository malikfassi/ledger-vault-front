//@flow
import React from "react";
import RateLimiterValue from "../../RateLimiterValue";
import TimeLockValue from "../../TimeLockValue";
import SecurityRow from "../../SecurityRow";
import ValidateBadge from "../../icons/full/ValidateBadge";
import RatesFull from "../../icons/full/Rates";
import { withStyles } from "material-ui/styles";
import HourglassFull from "../../icons/full/Hourglass";
import PeopleFull from "../../icons/full/People";

const styles = {
  base: {
    "& h4": {
      fontSize: "11px",
      fontWeight: "600",
      textTransform: "uppercase",
      marginTop: "3px",
      marginBottom: "29px"
    },
    "& h5": {
      fontSize: "10px",
      fontWeight: "600",
      color: "#999",
      marginBottom: "10px",
      textTransform: "uppercase"
    }
  },
  icon: {
    fill: "#e2e2e2",
    width: 13
  }
};
function AccountCreationSecurity(props: {
  account: Object,
  switchInternalModal: Function,
  classes: Object
}) {
  const { account, switchInternalModal, classes } = props;
  return (
    <div className={classes.base}>
      <h4>Security Scheme</h4>
      <h5>Members</h5>
      <div className="security-members">
        <SecurityRow
          icon={<PeopleFull className={classes.icon} />}
          label="Members"
          onClick={() => switchInternalModal("members")}
        >
          {account.approvers.length > 0
            ? `${account.approvers.length} selected`
            : "None"}
        </SecurityRow>
        <SecurityRow
          icon={<ValidateBadge className={classes.icon} />}
          label="Approvals"
          disabled={account.approvers.length === 0}
          onClick={() => switchInternalModal("approvals")}
        >
          {account.quorum > 0 ? `${account.quorum} required` : "None"}
        </SecurityRow>
      </div>
      <h5>Locks</h5>
      <SecurityRow
        icon={<HourglassFull className={classes.icon} />}
        label="Time-lock"
        disabled
        onClick={() => switchInternalModal("time-lock")}
      >
        {account.time_lock.enabled ? (
          <TimeLockValue
            time_lock={account.time_lock.value * account.time_lock.frequency}
          />
        ) : (
          "disabled"
        )}
      </SecurityRow>
      <SecurityRow
        icon={<RatesFull className={classes.icon} />}
        label="Rate Limiter"
        disabled
        onClick={() => switchInternalModal("rate-limiter")}
      >
        {account.rate_limiter.enabled ? (
          <RateLimiterValue
            max_transaction={account.rate_limiter.value}
            time_slot={account.rate_limiter.frequency}
          />
        ) : (
          "disabled"
        )}
      </SecurityRow>
    </div>
  );
}

export default withStyles(styles)(AccountCreationSecurity);

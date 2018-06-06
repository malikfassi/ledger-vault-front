//@flow
import BlurDialog from "components/BlurDialog";
import SpinnerCard from "components/spinners/SpinnerCard";
import type { Translate } from "data/types";
import { translate } from "react-i18next";
import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import { connect } from "react-redux";
import ValidateBadge from "components/icons/full/ValidateBadge";
import Profile from "components/icons/thin/Profile";
import cx from "classnames";
import GenerateSeed from "./GenerateSeed";
import {
  Title,
  Introduction,
  SubTitle,
  ToContinue
} from "components/Onboarding";
import DialogButton from "components/buttons/DialogButton";
import Footer from "./Footer";
import {
  toggleGenerateSeed,
  addSeedShard,
  getShardsChannel
} from "redux/modules/onboarding";

const status = {
  base: {
    fontSize: 11,
    fontWeight: 600,
    color: "#27d0e2",
    textTransform: "uppercase",
    cursor: "pointer"
  },
  icon: {
    width: 11,
    fill: "#27d0e2",
    verticalAlign: "middle",
    marginRight: 10
  },
  generated: {
    fontSize: 11
  }
};
export const SeedStatus = withStyles(
  status
)(
  ({
    classes,
    generated,
    open
  }: {
    classes: { [$Keys<typeof status>]: string },
    open: Function,
    generated: boolean
  }) => {
    if (generated) {
      return (
        <div className={classes.generated}>
          <ValidateBadge className={classes.icon} />Generated
        </div>
      );
    }
    return (
      <div className={classes.base} onClick={open}>
        GENERATE SEED
      </div>
    );
  }
);

const profile = {
  base: {
    width: 28
  }
};
export const ProfileIcon = withStyles(
  profile
)(({ classes }: { classes: { [$Keys<typeof profile>]: string } }) => (
  <div style={{ marginBottom: 10 }}>
    <Profile color="#cccccc" className={classes.base} />
  </div>
));
const styles = {
  steps: {
    display: "flex",
    flexDirection: "row",
    marginBottom: 35
  },
  title: {
    fontSize: 13,
    fontWeight: 600,
    margin: "0 0 12px 0"
  },
  step: {
    paddingRight: 30,
    paddingLeft: 25,
    "&:first-child": {
      paddingLeft: 0
    },
    transition: "all 200ms ease"
  },
  disabled: {
    opacity: 0.2
  },
  separator: {
    width: 1,
    height: 94,
    background: "#eeeeee"
  }
};
type Props = {
  classes: { [$Keys<typeof styles>]: string },
  t: Translate,
  onboarding: *,
  onToggleGenerateSeed: Function,
  onGetShardsChannel: Function,
  onProvisioningShards: Function,
  onAddSeedShard: Function
};
class Provisioning extends Component<Props> {
  constructor(props) {
    super(props);
  }
  finish = data => {
    this.props.onToggleGenerateSeed();
    this.props.onAddSeedShard(data);
  };

  componentDidMount() {
    const { onboarding, onGetShardsChannel } = this.props;
    if (!onboarding.shards_channel) {
      onGetShardsChannel();
    }
  }

  render() {
    const { classes, onboarding, onToggleGenerateSeed, t } = this.props;
    if (!onboarding.shards_channel) {
      return <SpinnerCard />;
    }
    return (
      <div>
        <Title>{t("onboarding:master_seed_provisionning.title")}</Title>
        <BlurDialog
          open={onboarding.generateSeedModal}
          onClose={onToggleGenerateSeed}
        >
          <GenerateSeed
            shards_channel={onboarding.shards_channel}
            onFinish={this.finish}
            wraps={false}
          />
        </BlurDialog>
        <Introduction>
          {t("onboarding:master_seed_provisionning.description")}
        </Introduction>
        <div className={classes.steps}>
          <div className={classes.step}>
            <ProfileIcon />
            <div className={classes.title}>
              {t("onboarding:master_seed_provisionning.step1")}
            </div>
            <SeedStatus
              generated={onboarding.shards.length > 0}
              open={onToggleGenerateSeed}
            />
          </div>
          <div className={classes.separator} />
          <div
            className={cx(classes.step, {
              [classes.disabled]: onboarding.shards.length === 0
            })}
          >
            <ProfileIcon />
            <div className={classes.title}>
              {t("onboarding:master_seed_provisionning.step2")}
            </div>
            <SeedStatus
              generated={onboarding.shards.length > 1}
              open={onToggleGenerateSeed}
            />
          </div>
          <div className={classes.separator} />
          <div
            className={cx(classes.step, {
              [classes.disabled]: onboarding.shards.length < 2
            })}
          >
            <ProfileIcon />
            <div className={classes.title}>
              {t("onboarding:master_seed_provisionning.step3")}
            </div>
            <SeedStatus
              generated={onboarding.shards.length > 2}
              open={onToggleGenerateSeed}
            />
          </div>
        </div>
        <SubTitle>{t("onboarding:tocontinue")}</SubTitle>
        <ToContinue>
          {t("onboarding:master_seed_provisionning.to_continue")}
        </ToContinue>
        <Footer
          nextState
          render={(onPrev, onNext) => (
            <DialogButton
              highlight
              onTouchTap={onNext}
              disabled={onboarding.shards.length < 3}
            >
              {t("common:continue")}
            </DialogButton>
          )}
        />
      </div>
    );
  }
}

const mapProps = state => ({
  onboarding: state.onboarding
});

const mapDispatch = (dispatch: *) => ({
  onToggleGenerateSeed: () => dispatch(toggleGenerateSeed()),
  onAddSeedShard: data => dispatch(addSeedShard(data)),
  onGetShardsChannel: () => dispatch(getShardsChannel())
});

export default connect(mapProps, mapDispatch)(
  withStyles(styles)(translate()(Provisioning))
);

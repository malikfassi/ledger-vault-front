//@flow
import MarkActivityAsReadMutation from "api/mutations/MarkActivityAsReadMutation";
import { translate } from "react-i18next";
import type { Translate } from "data/types";
import type { RestlayEnvironment } from "restlay/connectData";
import ClearActivityMutation from "api/mutations/ClearActivityMutation";
import ActivityQuery from "api/queries/ActivityQuery";
import React, { Component } from "react";
import { connect } from "react-redux";
import { getLocalStorageToken } from "redux/modules/auth";
import connectData from "restlay/connectData";
import { DATA_FETCHED } from "restlay/dataStore";
import ActivityList from "../ActivityList";
import Bell from "../icons/full/Bell";
import PopBubble from "../utils/PopBubble";
import { withStyles } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";
import colors from "shared/colors";
import { normalize } from "normalizr-gre";
import io from "socket.io-client";
import type { ActivityGeneric } from "data/types";

const styles = {
  base: {
    position: "relative"
  },
  link: {
    color: "black",
    textTransform: "uppercase"
  },
  popover: {
    width: 380,
    paddingRight: 40,
    paddingLeft: 40,
    paddingBottom: 30,
    paddingTop: 40,
    marginLeft: 30
  },
  icon: {
    height: 16,
    fill: "white",
    marginBottom: 5
  },
  clickable: {
    "&:hover": {
      cursor: "pointer"
    }
  },
  bullet: {
    backgroundColor: colors.grenade,
    width: 10,
    height: 10,
    borderRadius: "50%",
    position: "absolute",
    border: "2px solid " + colors.night,
    top: 5,
    right: 11
  }
};

class ActivityCard extends Component<
  {
    activities?: *,
    onNewActivity: Function,
    restlay?: RestlayEnvironment,
    loading: boolean,
    t: Translate,
    classes: { [_: $Keys<typeof styles>]: string },
    match: *
  },
  *
> {
  state = {
    bubbleOpened: false
  };

  componentDidMount() {
    const url =
      process.env.NODE_ENV !== "development"
        ? "/notification"
        : "http://localhost:3033";
    const socket = io.connect(url);
    const myAuthToken = getLocalStorageToken();
    let self = this;
    socket.on("connect", function() {
      socket.emit("authenticate", {
        token: myAuthToken,
        orga: self.props.match.params.orga_name
      });
    });
    socket.on(self.props.match.params.orga_name + "/admin", function(activity) {
      //FIXME why is it fired twice ??
      if (self.props.onNewActivity) {
        self.props.onNewActivity(activity);
      }
    });
  }

  static defaultProps = {
    loading: false
  };

  anchorEl: *;

  onActivityRef = (ref: *) => {
    this.anchorEl = ref;
  };

  onCloseBubble = () => {
    this.setState({ bubbleOpened: false });
  };

  onClickActivityCard = (/* event: * */) => {
    this.setState({
      bubbleOpened: !this.state.bubbleOpened
    });
  };
  markAsSeenRequest = async business_action_ids => {
    const { restlay } = this.props;
    if (restlay) {
      await restlay.commitMutation(
        new MarkActivityAsReadMutation(business_action_ids)
      );
      await restlay.fetchQuery(new ActivityQuery());
    }
  };

  clearAllRequest = async business_action_ids => {
    const { restlay } = this.props;
    if (restlay) {
      await restlay.commitMutation(
        new ClearActivityMutation(business_action_ids)
      );
      await restlay.fetchQuery(new ActivityQuery());
    }
  };

  render() {
    const { classes, activities, loading, match, t } = this.props;
    const { bubbleOpened } = this.state;
    const unseenActivityCount = activities
      ? activities.reduce(
          (count, activity) => count + (!activity.seen ? 1 : 0),
          0
        )
      : 0;
    activities &&
      activities.sort((a, b) => {
        return new Date(b.created_on) - new Date(a.created_on);
      });
    return (
      <span className={classes.clickable}>
        <div
          onClick={this.onClickActivityCard}
          ref={this.onActivityRef}
          className={classes.base}
        >
          <Bell className={classes.icon} />
          {!!unseenActivityCount && <div className={classes.bullet} />}
          <div className="content-header-button-text">
            {t("actionBar:activity")}
          </div>
        </div>

        <PopBubble
          classes={{ paper: classes.popover }}
          anchorEl={this.anchorEl}
          open={bubbleOpened}
          onClose={this.onCloseBubble}
          directiontransform="right"
          direction="center"
        >
          <div onClick={this.onCloseBubble}>
            {!loading && (
              <ActivityList
                activities={activities}
                unseenActivityCount={unseenActivityCount}
                markAsSeenRequest={this.markAsSeenRequest}
                clearAllRequest={this.clearAllRequest}
                match={match}
              />
            )}
            {loading && <CircularProgress />}
          </div>
        </PopBubble>
      </span>
    );
  }
}

const RenderLoading = withStyles(styles)(
  translate()(({ classes, match, ...props }) => (
    <ActivityCard
      loading={true}
      classes={classes}
      match={match}
      onNewActivity={() => ({})}
      {...props}
    />
  ))
);

const mapDispatchToProps = (dispatch: Dispatch<*>, props) => ({
  onNewActivity: (activity: ActivityGeneric) => {
    const queryOrMutation = new ActivityQuery();
    const data = [activity, ...props.activities];
    const result = normalize(data, queryOrMutation.getResponseSchema() || {});

    dispatch({
      type: DATA_FETCHED,
      result,
      queryOrMutation,
      cacheKey: queryOrMutation.getCacheKey()
    });
    return data;
  }
});

export default withStyles(styles)(
  connectData(
    connect(
      null,
      mapDispatchToProps
    )(translate()(ActivityCard)),
    {
      RenderLoading,
      queries: {
        activities: ActivityQuery
      }
    }
  )
);

//@flow
import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { compose } from "redux";
import queryString from "query-string";
import formatError from "formatters/error";
import createDevice, { U2F_PATH } from "device";
import TeamLogin from "./TeamLogin";
import DeviceLogin from "./DeviceLogin";
import { login, logout } from "redux/modules/auth";
import { addMessage } from "redux/modules/alerts";
import network from "network";
import { withStyles } from "material-ui/styles";

import logoBlack from "assets/img/logo-black.png";
import logoBlack2x from "assets/img/logo-black@2x.png";
import logoBlack3x from "assets/img/logo-black@3x.png";

const mapStateToProps = ({ auth }) => ({
  isAuthenticated: auth.isAuthenticated
});

const mapDispatchToProps = dispatch => ({
  onLogin: token => dispatch(login(token)),
  onLogout: () => dispatch(logout()),
  addAlertMessage: (...props) => dispatch(addMessage(...props))
});

type Props = {
  isAuthenticated: boolean,
  history: Object,
  location: Object,
  onLogout: () => void,
  onStartAuth: () => void,
  onCloseTeamError: () => void,
  onResetTeam: () => void,
  classes: Object,
  addAlertMessage: Function,
  onLogin: Function
};

const styles = {
  base: {
    display: "table",
    width: "100vw",
    height: "100vh"
  },
  wrapper: {
    display: "table-cell",
    textAlign: "center",
    verticalAlign: "middle"
  },
  banner: {
    width: "400px",
    margin: "auto",
    marginBottom: "20px",
    position: "relative",
    textAlign: "left"
  },
  help: {
    width: 63,
    cursor: "pointer",
    marginRight: "0",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    opacity: "0.5",
    transition: "opacity 0.2s ease",
    verticalAlign: "super",
    lineHeight: "1em",
    position: "absolute",
    top: "5px",
    right: "0;"
  }
};

type State = {
  domain: string,
  isChecking: boolean,
  error: ?Error,
  domainValidated: boolean
};

export class Login extends Component<Props, State> {
  context: {
    translate: string => string
  };

  state = {
    domain: "",
    error: null,
    domainValidated: false,
    isChecking: false
  };

  componentWillMount() {
    const { isAuthenticated, history, location } = this.props;
    if (isAuthenticated) {
      const { redirectTo } = queryString.parse(
        (location.search || "").slice(1)
      );
      history.replace(redirectTo || "/");
    }
  }

  componentWillUpdate(nextProps: Props) {
    const { history, location } = nextProps;
    if (nextProps.isAuthenticated) {
      const { redirectTo } = queryString.parse(
        (location.search || "").slice(1)
      );
      history.push(redirectTo || "/");
    }
  }

  onTeamChange = (domain: string) => {
    this.setState({ domain, error: null });
  };

  onStartOnBoardingStatus = async () => {
    const { history } = this.props;
    try {
      // const { status } = await network("/onboarding_status", "GET");
      if (true) {
        this.onStartAuth();
      } else if (status === 0) {
        history.push("/onboarding/welcome");
      } else {
        history.push("/onboarding/seed/signin");
      }
    } catch (e) {
      console.error(e);
    }
  };

  onStartAuth = async () => {
    const { addAlertMessage, onLogin } = this.props;
    this.setState({ isChecking: true });
    try {
      const device = await createDevice();
      const { challenge, key_handle } = await network(
        "/hsm/session/admin/partition/challenge",
        "GET"
      );
      this.setState({
        error: null,
        domainValidated: true
      });

      // FIXME these need to come from the server call /authentication_challenge
      const application =
        "1e55aaa3241c6f9b630d3a53c6aa6877695fd0e0c6c7bbc0f8eed35bcb43ebe0";
      const keyHandle =
        "6a40f6615e6f43d11a6d60d8dd0fde75a898834a202f49b758c0c36a1a24d026e70e4a1501d2d7aa14aff55cfca5779cc07be75f6281f58cce1c08e568042edc";
      // TODO FIXME not sure what these will be
      const instanceName = "";
      const instanceReference = "";
      const instanceURL = "";
      const agentRole = "";

      const auth = await device.authenticate(
        Buffer.from(challenge),
        application,
        Buffer.from(keyHandle, "hex"),
        instanceName,
        instanceReference,
        instanceURL,
        agentRole
      );
      const pubKeyData = await device.getPublicKey(U2F_PATH);
      console.log(pubKeyData);
      const {
        token
      } = await network("/hsm/authentication/bootstrap/authenticate", "POST", {
        pub_key: pubKeyData.pubKey,
        authentication: auth.signature
      });
      this.setState({ isChecking: false });
      addAlertMessage("Welcome", "Hello. Welcome on Ledger Vault Application");
      onLogin(token);
    } catch (error) {
      console.error(error);
      this.setState({ error, isChecking: false });
      addAlertMessage("Failed to authenticate", formatError(error), "error");
    }
  };

  onCloseTeamError = () => {
    this.setState({ error: null });
  };

  onCancelDeviceLogin = () => {
    this.setState({ domainValidated: false });
  };

  render() {
    const { onLogout } = this.props;
    const { domain, error, domainValidated, isChecking } = this.state;
    const t = this.context.translate;
    let content = null;
    const { classes } = this.props;

    if (domainValidated) {
      content = (
        <DeviceLogin
          domain={domain}
          isChecking={isChecking}
          onCancel={this.onCancelDeviceLogin}
          onRestart={this.onStartAuth}
        />
      );
    } else {
      content = (
        <TeamLogin
          domain={domain}
          error={error}
          isChecking={isChecking}
          onChange={this.onTeamChange}
          onLogout={onLogout}
          onStartAuth={this.onStartOnBoardingStatus}
          onCloseTeamError={this.onCloseTeamError}
        />
      );
    }
    return (
      <div className={classes.base}>
        <div className={classes.wrapper}>
          <div className={classes.banner}>
            <img
              src={logoBlack}
              srcSet={`${logoBlack2x} 2x, ${logoBlack3x} 3x`}
              alt="Ledger Vault"
            />
            <div className={classes.help}>{t("login.help")}</div>
          </div>
          {content}
        </div>
      </div>
    );
  }
}

Login.contextTypes = {
  translate: PropTypes.func.isRequired
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles)
)(Login);

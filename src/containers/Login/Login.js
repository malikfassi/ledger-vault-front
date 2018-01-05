//@flow
import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import queryString from "query-string";
import formatError from "../../formatters/error";
import createDevice, { U2F_PATH } from "../../device";
import "../../containers/App/App.css";
import TeamLogin from "./TeamLogin";
import DeviceLogin from "./DeviceLogin";
import { login, logout } from "../../redux/modules/auth";
import { addMessage } from "../../redux/modules/alerts";
import network from "../../network";

import "./Login.css";

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
  onLogin: string => void,
  addAlertMessage: (
    title: string,
    content: string,
    messageType: ?string
  ) => void
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

  onStartAuth = async () => {
    const { addAlertMessage, onLogin } = this.props;
    this.setState({ isChecking: true });
    try {
      const device = await createDevice();
      const { id, challenge } = await network(
        "/authentication_challenge",
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
      const instanceName = "_";
      const instanceReference = "_";
      const instanceURL = "_";
      const agentRole = "_";

      const auth = await device.authenticate(
        challenge,
        application,
        keyHandle,
        instanceName,
        instanceReference,
        instanceURL,
        agentRole
      );
      const pubKeyData = await device.getPublicKey(U2F_PATH);
      const { token } = await network("/authenticate", "POST", {
        pub_key: pubKeyData.pubKey,
        authentication: auth.signature,
        id
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
          onStartAuth={this.onStartAuth}
          onCloseTeamError={this.onCloseTeamError}
        />
      );
    }
    return (
      <div style={{ display: "table", width: "100vw", height: "100vh" }}>
        <div
          style={{
            display: "table-cell",
            textAlign: "center",
            verticalAlign: "middle"
          }}
        >
          <div className="Background">
            <div className="Banner">
              <img
                src="img/logo-black.png"
                srcSet="/img/logo-black@2x.png 2x, /img/logo-black@3x.png 3x"
                alt="Ledger Vault"
              />
              <div className="help">{t("login.help")}</div>
            </div>
            {content}
          </div>
        </div>
      </div>
    );
  }
}

Login.contextTypes = {
  translate: PropTypes.func.isRequired
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);

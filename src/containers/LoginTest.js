//@flow
import React, { Component } from "react";
import network from "../network";
import createDevice from "../device";
import "./App/App.css";
import "./Login/Login.css";

class LoginTest extends Component<{}, { registration: ?Object }> {
  state = {
    registration: null
  };
  onSubmit = async (e: SyntheticEvent<*>) => {
    e.preventDefault();
    const device = await createDevice();
    const application =
      "1e55aaa3241c6f9b630d3a53c6aa6877695fd0e0c6c7bbc0f8eed35bcb43ebe0";
    const instanceName = "_";
    const instanceReference = "_";
    const instanceURL = "_";
    const agentRole = "_";
    const { challenge } = await network(
      "/provisioning/administrators/register",
      "GET"
    );
    const registration = await device.register(
      challenge,
      application,
      instanceName,
      instanceReference,
      instanceURL,
      agentRole
    );
    this.setState({ registration });
  };

  render() {
    const { registration } = this.state;
    return (
      <form onSubmit={this.onSubmit}>
        <button type="submit">register device</button>
        <pre>
          <code>{registration && JSON.stringify(registration, null, 2)}</code>
        </pre>
      </form>
    );
  }
}
export default LoginTest;

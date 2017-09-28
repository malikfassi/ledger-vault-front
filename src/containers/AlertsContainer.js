import _ from 'lodash';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
// import isEmpty from 'lodash/isEmpty';
import { connect } from 'react-redux';
import { Alert } from '../components';
import { closeMessage } from '../redux/modules/alerts';
import { AUTHENTICATION_SUCCEED, CHECK_TEAM_ERROR, AUTHENTICATION_FAILED, LOGOUT } from '../redux/modules/auth';
import { GOT_OPERATION_FAIL } from '../redux/modules/operations';

const mapStateToProps = state => ({
  alerts: state.alerts,
});

const mapDispatchToProps = (dispatch) => {
  return {
    onClose: (id) => dispatch(closeMessage(id)),
  };
};

export const getTitle = (id, alerts, translate) => {
  const message = _.find(alerts, { id: id });
  if (message && message.title) {
    return translate(message.title);
  }
  else {
    return '';
  }
};

export const getTheme = (id, alerts) => {
  const message = _.find(alerts, { id: id });
  if (message && message.type) {
    return message.type;
  }
  else {
    return '';
  }
};

export const getContent = (id, alerts, translate) => {
  const message = _.find(alerts, {id: id});
  if (message && message.content) {
    return translate(message.content);
  }
  else {
    return '';
  }
};

const hasError = (id, alerts) => {
  return !_.isUndefined(_.find(alerts, { id: id }));
};

export const allMessages = [CHECK_TEAM_ERROR, AUTHENTICATION_FAILED, LOGOUT, GOT_OPERATION_FAIL, AUTHENTICATION_SUCCEED];

export class MessagesContainer extends Component {
  render() {
    const alerts = this.props.alerts.alerts;
    const cache = this.props.alerts.cache;

    const { translate } = this.context;

    return (
      <div>
        {_.map(allMessages, (message) => {
          return (
            <Alert
              onRequestClose={this.props.onClose.bind(this, message)}
              open={hasError(message, alerts)}
              autoHideDuration={4000}
              title={getTitle(message, cache, translate)}
              theme={getTheme(message, cache)}
              key={message}
            >
              <div>{getContent(message, cache, translate)}</div>
            </Alert>
          );
        })}
      </div>
    );
  }
}

MessagesContainer.propTypes = {
  onClose: PropTypes.func.isRequired,
  alerts: PropTypes.shape({
    alerts: PropTypes.array,
    cache: PropTypes.array,
  }).isRequired,
};

MessagesContainer.contextTypes = {
  translate: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(MessagesContainer);


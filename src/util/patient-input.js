import React from 'react';
import _ from 'lodash';

export default React.createClass({
  getInitialState() {
    return this.propsWithoutCallbacks(this.props);
  },

  componentWillReceiveProps(newProps) {
    this.setState(this.propsWithoutCallbacks(newProps));
  },

  propsWithoutCallbacks(props) {
    return _.omit(props, ['onChange', 'onBlur']);
  },

  changeValue(e) {
    this.clearTimeoutIfPresent();
    e.persist();
    let timeoutId = setTimeout(this.callbackChange.bind(this, e), this.props.delay || 500);
    this.setState({ value: e.target.value, timeoutId });
  },

  blurField(e) {
    this.clearTimeoutIfPresent();
    this.callbackChange(e);
  },

  clearTimeoutIfPresent() {
    if (this.state.timeoutId) {
      clearTimeout(this.state.timeoutId);
    }
  },

  callbackChange(e) {
    this.props.onChange(e);
  },

  render() {
    return (
      <input {...this.state} onChange={this.changeValue} onBlur={this.blurField}/>
    );
  }
});


import React from 'react';

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
    if (this.state.timeoutId) {
      clearTimeout(this.state.timeoutId);
    }
    e.persist();
    let timeoutId = setTimeout(this.callbackChange.bind(this, e), 1000);
    this.setState({ value: e.target.value, timeoutId });
  },

  callbackChange(e) {
    this.props.onChange(e);
  },

  render() {
    return (
      <input {...this.state} onChange={this.changeValue} onBlur={this.callbackChange}/>
    );
  }
});


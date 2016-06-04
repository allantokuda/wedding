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
    this.setState({ value: e.target.value });
  },

  blur(e) {
    this.props.onBlur(e);
  },

  render() {
    return (
      <input {...this.state} onChange={this.changeValue} onBlur={this.blur}/>
    );
  }
});


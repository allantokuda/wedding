import React from 'react';
export default React.createClass({
  render() {
    let classes = ['lozenge'];
    if (this.props.type) {
      classes.push('response-' + this.props.type);
    }
    return (
      <span className={classes.join(' ')}>
        <span className="text">
          {this.props.label || '(?)'}
        </span>
        {this.props.type && (
          <span className="icon">&nbsp;</span>
        )}
      </span>
    );
  }
});

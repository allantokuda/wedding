import React from 'react';
export default React.createClass({
  render() {
    return this.props.condition ? (
      <div className="modal-container">
        <div className="modal-body">
          {this.props.children}
          <button className="close-dialog-button" onClick={this.props.onClose}>{"\u274c"}</button>
        </div>
      </div>
    ) : null;
  },
});

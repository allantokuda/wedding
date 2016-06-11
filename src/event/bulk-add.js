import React from 'react';
import Firebase from 'firebase';
import { textToData, textToLines } from './text-to-data';

export default React.createClass({
  getInitialState() {
    return { text: '' };
  },

  close() {
    this.setState({ text: '' });
    this.props.onClose();
  },

  onChange(e) {
    this.setState({ text: e.target.value });
  },

  import() {
    let invitationsRef = this.props.eventRef.child('invitations');
    invitationsRef.once('value', snapshot => {
      let maxIndex =_.chain(snapshot.val()).values().map(invitation => invitation.index).max().value() || 1;
      let newKeys = textToData(this.state.text, maxIndex);
      invitationsRef.update(newKeys).then(() => {
        this.setState({ text: '' });
      });
    });
  },

  deleteAll() {
    var verify = prompt("Really delete ALL invitations? Type 'yes' to continue");
    if (verify.toLowerCase() === 'yes') {
      this.props.eventRef.child('invitations').remove();
    }
  },

  render() {
    return (
      <div className="bulk-add-form">
        <textarea onChange={this.onChange} placeholder="Paste here to bulk-add invitations." value={this.state.text}/>
        <div>
          <p>{this.state.text && "Detected " + textToLines(this.state.text).length + " invitations."}&nbsp;</p>
          <button onClick={this.import} disabled={!this.state.text}>Import All</button>
          &nbsp;
          <button onClick={this.close}>Done</button>
          <br/><br/>
          <button onClick={this.deleteAll}>Delete all invitations</button>
        </div>
      </div>
    );
  },
});

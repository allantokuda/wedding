import React from 'react';
import Firebase from 'firebase';
import { textToData, textToLines } from './text-to-data';

export default React.createClass({
  getInitialState() {
    return { text: '' };
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
      this.props.onImport();
    });
  },

  render() {
    return (
      <div className="bulk-add-form">
        <textarea onChange={this.onChange} placeholder="Paste here to bulk-add invitations." value={this.state.text}/>
        <div>
          <p>{this.state.text && "Detected " + textToLines(this.state.text).length + " invitations."}&nbsp;</p>
          <button onClick={this.import} disabled={!this.state.text}>Import All</button>
          <br/>
        </div>
      </div>
    );
  },
});

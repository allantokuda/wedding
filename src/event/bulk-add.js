import React from 'react';
import randomKey from '../util/random-key';
import Firebase from 'firebase';

export default React.createClass({
  getInitialState() {
    return { text: '' };
  },

  onChange(e) {
    this.setState({ text: e.target.value });
  },

  rows() {
    let lines = this.state.text.trim().split(/\n+/);
    return _.filter(lines, line => line.length > 0);
  },

  clear() {
    this.setState({ text: '' });
  },

  import() {
    let newKeys = {};

    this.rows().forEach(rowText => {
      let regex = /^\d+\s+|\s+\d+$/g
      let matches = rowText.match(regex);
      let count;
      if (matches && matches.length == 1) {
        rowText = rowText.replace(regex, '');
        count = parseInt(matches[0].trim(), 10);
      }
      let people = rowText.split(/\s*,\s*and\s+|\s+and\s+|\s*,\s*/)
      let peopleHash = {};
      let i = 0;
      people.forEach((person) => {
        let personName = person.trim();
        peopleHash[randomKey()] = { name: personName, index: ++i };
      });
      while (i < count) {
        peopleHash[randomKey()] = { name: '', index: ++i }
      }
      newKeys[randomKey()] = { people: peopleHash, creationDate: Firebase.ServerValue.TIMESTAMP };
    });

    this.props.eventRef.child('invitations').update(newKeys).then(() => {
      this.setState({ text: '' });
    });
  },

  render() {
    return (
      <div className="bulk-add-form">
        <textarea onChange={this.onChange} placeholder="Paste here to bulk-add invitations" value={this.state.text}/>
        {this.state.text && (
          <div>
            <p>Detected {this.rows().length} invitations.</p>
            <button onClick={this.import}>Import All</button>
            <button onClick={this.clear}>Clear</button>
          </div>
        )}
      </div>
    );
  },
});

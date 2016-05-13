import React from 'react';
import randomKey from '../util/random-key';

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
      let people = rowText.split(/\s*,\s*and\s+|\s+and\s+|\s*,\s*/)
      let peopleHash = {};
      people.forEach((person, i) => {
        let personName = person.trim();
        peopleHash[randomKey()] = { name: personName, index: i };
      });
      newKeys[randomKey()] = { people: peopleHash };
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

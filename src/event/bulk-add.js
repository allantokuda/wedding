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
    return this.state.text.trim().split(/\n+/);
  },

  clear() {
    this.setState({ text: '' });
  },

  import() {
    let newKeys = {};

    this.rows().forEach(rowText => {
      let people = rowText.split(/\s*,\s*and\s+|\s+and\s+|\s*,\s*/)
      let peopleHash = {};
      people.forEach(person => {
        let personName = person.trim();
        if (personName.length > 0) {
          peopleHash[randomKey()] = { name: personName };
        }
      });
      console.log(peopleHash);
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

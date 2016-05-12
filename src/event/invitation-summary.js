import React from 'react';
import _ from 'lodash';

export default React.createClass({
  changeInvitation(attributeName, e) {
    this.props.inviteRef.child(attributeName).set(e.target.value);
  },

  deleteInvitation() {
    if (confirm('Are you sure you want to delete this invitation?')) {
      this.props.inviteRef.remove();
    }
  },

  resetInvitation() {
    if (confirm('Are you sure you want to clear the guest\'s responses from this invitation?')) {
      this.props.inviteRef.set({
        email: this.props.data.email,
        people: _.mapValues(this.props.data.people, person => {
          return { name: person.name };
        })
      });
    }
  },

  addPerson() {
    this.props.inviteRef.child('people').push({ name: '' });
  },

  changePerson(personId, attributeName, e) {
    this.props.inviteRef.child('people/' + personId + '/' + attributeName).set(e.target.value);
  },

  deletePerson(personId) {
    if (confirm('Are you sure you want to delete this person from their invitation?')) {
      this.props.inviteRef.child('people/' + personId).remove();
    }
  },

  renderPeople() {
    return _.map(this.props.data.people, (person, personId) => {
      let questionCells = this.props.card.individualQuestions.map((question, j) => {
        return (
          <td key={j}>{ person[question.name] || '-' }</td>
        );
      });

      return (
        <tr key={personId}>
          <td>
            <input value={person.name} onChange={this.changePerson.bind(this, personId, 'name')} disabled={person.accept}/>
            { !person.accept && <button onClick={this.deletePerson.bind(this, personId)}>{"\u274c"}</button>}
          </td>
          {this.props.data.responseDates && questionCells}
        </tr>
      );
    }).concat(
      <tr key="add-button">
        <td colSpan="2">
          <button onClick={this.addPerson}>Add Person</button>
        </td>
      </tr>
    );
  },

  render() {
    return (
      <tr class="invitation" key={this.props.inviteId}>
        <td>
          <input name="email" type="text" value={this.props.data.email} onChange={this.changeInvitation.bind(this, 'email')} disabled={this.props.data.responseDates}/>
          {!this.props.data.responseDates && <button onClick={this.deleteInvitation}>{"\u274c"}</button>}
        </td>
        <td>
          <a target="_blank" href={"/event/" + this.props.eventId + '/' + this.props.inviteId}>Preview</a>
        </td>
        <td>
          <table class="people">
            <tbody>
              { this.renderPeople() }
            </tbody>
          </table>
        </td>
        <td>{this.props.data.comments}</td>
        <td>{this.props.data.responseDates && <button onClick={this.resetInvitation}>Clear</button>}</td>
      </tr>
    );
  }
});

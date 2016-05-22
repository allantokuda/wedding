import React from 'react';
import _ from 'lodash';

export default React.createClass({
  changeInvitation(attributeName, e) {
    this.props.inviteRef.child(attributeName).set(e.target.value);
  },

  deleteInvitation() {
    if (this.isBlank() || confirm('Are you sure you want to delete this invitation?')) {
      this.props.inviteRef.remove();
    }
  },

  resetInvitation() {
    if (confirm('Are you sure you want to clear the guest\'s responses from this invitation?')) {
      this.props.inviteRef.set({
        index: this.props.data.index,
        email: this.props.data.email || '',
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
    if (this.props.data.people[personId].name == '' || confirm('Are you sure you want to delete this person from their invitation?')) {
      this.props.inviteRef.child('people/' + personId).remove();
    }
  },

  sendInvitation(inviteId) {
  },

  isBlank() {
    return (this.props.data.email == null || this.props.data.email == '') &&
      _.every(this.props.data.people, person => person.name == '');
  },

  renderPeople() {
    let responded = this.props.data.responseDates !== undefined;
    let peopleArray = _.keys(this.props.data.people).map(personId => {
      let person = this.props.data.people[personId];
      person.personId = personId;
      return person;
    });

    peopleArray = _.sortBy(peopleArray, person => person.index);

    let people = _.map(peopleArray, person => {
      let questionCells = this.props.card.individualQuestions.map((question, j) => {
        return (
          <td className="question-response" key={j}>{ person[question.name] }</td>
        );
      });

      return (
        <tr key={person.personId}>
          <td className="person-name">
            <input value={person.name} onChange={this.changePerson.bind(this, person.personId, 'name')} disabled={person.accept} placeholder="Full name"/>
            { !person.accept && <button onClick={this.deletePerson.bind(this, person.personId)}>{"\u274c"}</button>}
          </td>
          {responded && questionCells}
        </tr>
      );
    });

    return responded ? people : people.concat(
      <tr key="add-button">
        <td colSpan="2">
          <button onClick={this.addPerson}>Add Person</button>
        </td>
      </tr>
    );
  },

  render() {
    let responded = this.props.data.responseDates !== undefined;

    let classes = ['invitation-summary'];
    if (this.isBlank()) {
      classes.push('blank')
    }

    return (
      <div className={classes.join(' ')} key={this.props.inviteId}>
        <div>
          <input name="email" type="text" value={this.props.data.email} onChange={this.changeInvitation.bind(this, 'email')} disabled={responded} placeholder="Email address"/><br/><br/>
          <button className="send-invitation-button" onClick={this.sendInvitation.bind(this, this.props.inviteId)} disabled={!this.props.data.email}>Send</button>
          <a target="_blank" href={"/event/" + this.props.eventId + '/' + this.props.inviteId}>Preview</a>
        </div>
        <div>
          <table class="people">
            <tbody>
              { this.renderPeople() }
            </tbody>
          </table>
        </div>
        <div>{responded && <textarea disabled value={this.props.data.comments}/>}</div>
        <div>{responded && <button onClick={this.resetInvitation}>Clear</button>}</div>
        <div className="invitation-right-border">
          {!responded && <button className="delete-invitation-button" onClick={this.deleteInvitation}>{"\u274c"}</button>}
        </div>
      </div>
    );
  }
});

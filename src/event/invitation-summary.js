import React from 'react';
import _ from 'lodash';
import { emailRegex } from '../util/email-regex';
import PatientInput from '../util/patient-input';
import { browserHistory } from 'react-router'

export default React.createClass({
  getInitialState() {
    // props.data is initial state; hold internal state until blur operations occur
    return { data: this.props.data, validEmail: true };
  },

  changeInvitation(attributeName, e) {
    this.props.inviteRef.child(attributeName).set(e.target.value);
  },

  deleteInvitation() {
    if (this.isBlank() || confirm('Are you sure you want to delete this invitation?')) {
      this.props.inviteRef.remove();
    }
  },

  // TODO move to main view
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

  isBlank() {
    return (this.props.data.email == null || this.props.data.email == '') &&
      _.every(this.props.data.people, person => person.name == '');
  },

  unEdit() {
    browserHistory.push('/event/' + this.props.eventId);
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
            <PatientInput value={person.name} onChange={this.changePerson.bind(this, person.personId, 'name')} disabled={person.accept} placeholder="Full name"/>
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

    let invalidEmail = this.props.data.email && this.props.data.email.match(emailRegex) === null;

    let emailMessage;
    let emailInputClass;
    if (invalidEmail) {
      emailMessage = 'Invalid email.';
      emailInputClass = 'error';
    }

    return (
      <div className={classes.join(' ')} key={this.props.inviteId}>
        <div className="dialog-body">
          <div>
            <PatientInput className={emailInputClass} name="email" type="text" value={this.props.data.email} onChange={this.changeInvitation.bind(this, 'email')} disabled={responded} placeholder="Email address"/>
            <br/>
            <span className="error-message">{emailMessage}</span>
            <br/>
            <a target="_blank" href={"/event/" + this.props.eventId + '/invitation/' + this.props.inviteId}>Preview</a>
          </div>
          <div>
            <table class="people">
              <tbody>
                { this.renderPeople() }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
});

import React from 'react';
import _ from 'lodash';
import { emailRegex } from '../util/email-regex';
import PatientInput from '../util/patient-input';
import { browserHistory } from 'react-router'

export default React.createClass({
  changeInvitation(attributeName, e) {
    this.props.inviteRef.child(attributeName).set(e.target.value);
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

  renderPeople() {
    let peopleArray = _.keys(this.props.data.people).map(personId => {
      let person = this.props.data.people[personId];
      person.personId = personId;
      return person;
    });

    peopleArray = _.sortBy(peopleArray, person => person.index);

    let people = _.map(peopleArray, person => {
      return (
        <tr key={person.personId}>
          <td className="person-name">
            <PatientInput value={person.name} onChange={this.changePerson.bind(this, person.personId, 'name')} placeholder="Full name"/>
            <button onClick={this.deletePerson.bind(this, person.personId)}>{"\u274c"}</button>
          </td>
        </tr>
      );
    });

    return people.concat(
      <tr key="add-button">
        <td colSpan="2">
          <button onClick={this.addPerson}>Add Person</button>
        </td>
      </tr>
    );
  },

  render() {
    let invalidEmail = this.props.data.email && this.props.data.email.match(emailRegex) === null;

    let emailMessage;
    let emailInputClass;
    if (invalidEmail) {
      emailMessage = 'Invalid email.';
      emailInputClass = 'error';
    }

    return (
      <div className="invite-edit">
        <div className="dialog-body">
          <br/>
          <div>
            <table class="people">
              <tbody>
                { this.renderPeople() }
              </tbody>
            </table>
          </div>
          <br/>
          <div>
            <PatientInput className={emailInputClass} name="email" type="text" value={this.props.data.email} onChange={this.changeInvitation.bind(this, 'email')} placeholder="Email address"/>
            <br/>
            <span className="error-message">{emailMessage}</span>
            <br/>
            { /* TODO change to browserHistory push */ }
            <a target="_blank" href={"/event/" + this.props.eventId + '/invitation/' + this.props.inviteId}>Preview</a>
          </div>
        </div>
      </div>
    );
  }
});

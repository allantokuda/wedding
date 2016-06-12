import React from 'react';
import _ from 'lodash';
import { emailRegex } from '../util/email-regex';
import PatientInput from '../util/patient-input';
import { browserHistory } from 'react-router';
import Lozenge from '../lozenge';

export default React.createClass({
  // TODO restore this functionality
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

  renderPeople() {
    let peopleArray = _.keys(this.props.data.people).map(personId => {
      let person = this.props.data.people[personId];
      person.personId = personId;
      return person;
    });

    peopleArray = _.sortBy(peopleArray, person => person.index);

    return _.map(peopleArray, person => {
      let responses = _.chain(this.props.card.individualQuestions)
      .filter(question => question.name !== 'accept')
      .map((question, j) => (
        <td className="question-response" key={j}>{ person[question.name] }</td>
      )).value();

      return (
        <tr key={person.personId}>
          <td className="person-name">
            <Lozenge label={person.name} type={person.accept} />
          </td>
          {responses}
        </tr>
      )
    });
  },

  render() {
    return (
      <div className="response-review">
        <div className="dialog-body">
          <table class="people">
            <tbody>
              { this.renderPeople() }
            </tbody>
          </table>
        </div>
      </div>
    );
  }
});

import React from 'react';
import Firebase from 'firebase';
import _ from 'lodash';
import $ from 'jquery';
import crypto from 'crypto';

export default React.createClass({
  getInitialState: function() {
    return { items: {} };
  },

  componentWillMount: function() {
    this.eventRef = new Firebase(__DATABASE_LOCATION__ + '/event/' + this.props.params.eventId);
    this.eventRef.authWithOAuthPopup("google", (error, authData) => {
      if (error) {
        console.error("Authentication failed!", error);
      } else {
        console.log("Authentication success!", authData);
      }
    });

    this.eventRef.on("value", eventSnapshot => {
      let event = eventSnapshot.val();
      let card = event.card;
      let email = event.email;
      let invitations = event.invitations;
      this.setState({ card, email, invitations });
    });
  },

  componentWillUnmount: function() {
    this.eventRef.off();
  },

  changeInvitation(invitationId, attributeName, e) {
    let invitations = this.state.invitations;
    invitations[invitationId][attributeName] = e.target.value;
    this.setState({invitations});
    this.eventRef.child('invitations/' + invitationId + '/' + attributeName).set(e.target.value);
  },

  randomKey() {
    return crypto.randomBytes(12).toString('base64').replace('/','0').replace('+','0');
  },

  addInvitation() {
    this.eventRef.child('invitations/' + this.randomKey()).set({
      people: [
        { name: "" },
        { name: "" }
      ]
    });
  },

  addPerson(invitationId) {
    let peopleRef = this.eventRef.child('invitations/' + invitationId + '/people/');
    peopleRef.once("value", function(snapshot) {
      peopleRef.push({ name: '' });
    });
  },

  deletePerson(invitationId, personId) {
    let personRef = this.eventRef.child('invitations/' + invitationId + '/people/' + personId);
    if (confirm('Are you sure you want to delete this person from their invitation?')) {
      personRef.remove();
    }
  },

  deleteInvitation(invitationId) {
    if (confirm('Are you sure you want to delete this invitation?')) {
      this.eventRef.child('invitations/' + invitationId).remove();
    }
  },

  sendAll() {
    let requestBody = {
      "eventId": this.props.params.eventId,
      "message1": this.state.email.message1,
      "message2": this.state.email.message2,
      "replyToName": this.state.email.replyToName,
      "replyToAddress": this.state.email.replyToAddress,
      "subject": this.state.email.subject,
      "invitations": _.keys(this.state.invitations).map(invitationId => {
        let inv = this.state.invitations[invitationId];
        return {
          "id": invitationId,
          "toAddr": inv.email,
          "toName": inv.people[0].name
        }
      })
    };

    $.ajax({
      type: 'POST',
      url: '/sendmail',
      processData: false,
      contentType: 'application/json',
      data: JSON.stringify(requestBody)
    }).done(function(success) {
      console.log(success);
    }).fail(function(error) {
      console.error(error.responseText);
    });
  },

  render() {
    let result = _.map(this.state.invitations, (item, inviteId) => {
      var inviteLink = "/event/" + this.props.params.eventId + '/' + inviteId

      //var emailLink = "mailto:" + item.email + "?subject=" + this.state.card.emailSubject + "&body=" + this.state.card.emailBody + "%0A%0A" + inviteLink

      let numPeople = _.keys(item.people).length;

      let emailCell = (
        <td rowSpan={numPeople}>
          <input name="email" type="text" value={item.email} onChange={this.changeInvitation.bind(this, inviteId, 'email')}/>
        </td>
      );

      let invitationLinkCell = (
        <td rowSpan={numPeople}>
          <a target="_blank" href={inviteLink}>Invitation</a>
        </td>
      );

      let commentsCell = (
        <td rowSpan={numPeople}>{item.comments}</td>
      );

      let actionsCell = (
        <td rowSpan={numPeople}>
          <button onClick={this.deleteInvitation.bind(this, inviteId)}>Delete Invitation</button>
          <button onClick={this.addPerson.bind(this, inviteId)}>Add Person</button>
        </td>
      );

      let i = 0;
      var people = _.map(item.people, (person, personId) => {
        i++;

        let questionCells = this.state.card.individualQuestions.map((question, j) => {
          return (
            <td key={j}>{ person[question.name] || '-' }</td>
          );
        });

        return (
          <tr>
            {i == 1 && emailCell}
            {i == 1 && invitationLinkCell}
            <td>{ person.name || '-' }</td>
            {questionCells}
            <td><button onClick={this.deletePerson.bind(this, inviteId, personId)}>Delete Person</button></td>
            {i == 1 && commentsCell}
            {i == 1 && actionsCell}
          </tr>
        );
      });

      return people;
    });

    let headerCells = this.state.card && this.state.card.individualQuestions.map((question, i) => {
      return (
        <th key={i}>{ question.label || question.name }</th>
      );
    });

    return (
      <div>
        <button onClick={this.sendAll}>Send all invitations</button>
        <table className="table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Invitation</th>
              <th>Name</th>
              {headerCells}
              <th>Comments</th>
            </tr>
          </thead>
          <tbody>
            { result }
          </tbody>
        </table>
        <button onClick={this.addInvitation}>Add Invitation</button>
      </div>
    );
  }
});

import React from 'react';
import Firebase from 'firebase';
import _ from 'lodash';

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
      let invitations = event.invitations;
      this.setState({ card, invitations });
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

  render() {
    let result = _.map(this.state.invitations, (item, inviteId) => {
      var inviteLink = "/event/" + this.props.params.eventId + '/' + inviteId

      //var emailLink = "mailto:" + item.email + "?subject=" + this.state.card.emailSubject + "&body=" + this.state.card.emailBody + "%0A%0A" + inviteLink

      let numPeople = item.people.length;

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

      var people = _.map(item.people, (person, i) => {
        let questionCells = this.state.card.individualQuestions.map((question, i) => {
          <td key={i}>{ person[question.name] || '-' }</td>
        });

        return (
          <tr>
            {i == 0 && emailCell}
            {i == 0 && invitationLinkCell}
            <td>{ person.name || '+1' }</td>
            <td>{ person.accept || '-' }</td>
            <td>{ person.drinks || '-' }</td>
            {questionCells}
            {i == 0 && commentsCell}
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
    );
  }
});

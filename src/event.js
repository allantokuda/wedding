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
        console.error("Authentication Failed!", error);
      } else {
        console.log("Authentication success!", authData);
        
      }
    });

    this.eventRef.on("value", function(eventSnapshot) {
      let event = eventSnapshot.val();
      console.log('event:', event);
      this.invitationRef = new Firebase(firebaseLocation + '/invitation');
      // TODO: only get invitations for the current event
      this.invitationRef.on("value", function(invitationSnapshot) {
        event.items = invitationSnapshot.val();
        this.setState(event);
      }.bind(this));
    }.bind(this));
  },

  componentWillUnmount: function() {
    this.firebaseRef.off();
  },

  render: function() {
    var result = _.map(this.state.items, (item, inviteId) => {
      var inviteLink = "/invitation/" + inviteId
      var emailLink = "mailto:" + item.email + "?subject=" + this.state.emailSubject + "&body=" + this.state.emailBody + "%0A%0A" + inviteLink

      var emailTag = <a href={emailLink}>{ item.email }</a>
      var inviteTag = <a href={inviteLink}>Invitation</a>

      var people = _.map(item.people, function(person, i) {
        return (
          <tr style={ i == 0 ? { fontWeight: 'bold' } : {} }>
            <td>{ person.name || '+1' }</td>
            <td>{ i == 0 ? emailTag : null }</td>
            <td>{ i == 0 ? inviteTag : null }</td>
            <td>{ person.accept || '-' }</td>
            <td>{ person.drinks || '-' }</td>
            <td>{ i == 0 ? item.comments : '-' }</td>
          </tr>
        );
      });

      return people;
    });

    return (
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Invitation email</th>
            <th>Invitation</th>
            <th>Accept?</th>
            <th>Drinks?</th>
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

import React from 'react';
import Firebase from 'firebase';
import _ from 'lodash';
import $ from 'jquery';
import InvitationSummary from './event/invitation-summary';
import BulkAdd from './event/bulk-add';
import randomKey from './util/random-key';

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
      let invitations = [];
      _.keys(event.invitations).forEach(inviteId => {
        let invitation = event.invitations[inviteId];
        invitation.inviteId = inviteId;
        invitations.push(invitation);
      });
      invitations = _.sortBy(invitations, i => i.creationDate);

      this.setState({ card, email, invitations });
    });
  },

  componentWillUnmount: function() {
    this.eventRef.off();
  },

  addInvitation() {
    this.eventRef.child('invitations/' + randomKey()).set({
      creationDate: Firebase.ServerValue.TIMESTAMP,
      people: [
        { name: "" },
        { name: "" }
      ]
    });
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
    return (
      <div>
        <button onClick={this.sendAll}>Send all invitations</button>
        <table className="guestbook">
          <tbody>
            {_.map(this.state.invitations, invitation => (
              <InvitationSummary card={this.state.card} data={invitation} inviteRef={this.eventRef.child('invitations/' + invitation.inviteId)} eventId={this.props.params.eventId} inviteId={invitation.inviteId}/>
            ))}
          </tbody>
        </table>
        <button onClick={this.addInvitation}>Add Invitation</button>

        <br/><br/>

        <BulkAdd eventRef={this.eventRef} />
      </div>
    );
  }
});

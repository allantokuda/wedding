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
      let maxIndex = 0;
      _.keys(event.invitations).forEach(inviteId => {
        let invitation = event.invitations[inviteId];
        invitation.inviteId = inviteId;
        maxIndex = Math.max(invitation.index, maxIndex);
        invitations.push(invitation);
      });
      invitations = _.sortBy(invitations, i => i.index);

      this.setState({ card, email, invitations, maxIndex });
    });
  },

  componentWillUnmount: function() {
    this.eventRef.off();
  },

  addInvitation() {
    let maxIndex = this.state.maxIndex + 1;
    this.setState({ maxIndex });
    this.eventRef.child('invitations/' + randomKey()).set({
      index: maxIndex,
      people: [
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

    if (confirm('Are you sure you want to email invitations to all guests?')) {
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
    }
  },

  render() {
    return (
      <div>
        <div className="event-manager-controls">
          {this.state.invitations && this.state.invitations.length > 0 && <button onClick={this.sendAll}>Send all invitations</button>}
        </div>
        <table className="guestbook">
          <tbody>
            {_.map(this.state.invitations, invitation => (
              <InvitationSummary card={this.state.card} data={invitation} inviteRef={this.eventRef.child('invitations/' + invitation.inviteId)} eventId={this.props.params.eventId} inviteId={invitation.inviteId}/>
            ))}
          </tbody>
        </table>
        <div className="event-manager-controls">
          <button onClick={this.addInvitation}>Add Invitation</button>

          <br/><br/>

          <BulkAdd eventRef={this.eventRef} />
        </div>
      </div>
    );
  }
});

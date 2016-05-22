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
    this.eventRef.onAuth(authData => {
      if (authData) {
        this.loadData();
      }
    });
  },

  login(e) {
    e.preventDefault();
    if (!this.eventRef.getAuth()) {
      this.eventRef.authWithOAuthPopup("google", (error, authData) => {
        if (error) {
          console.error("Authentication failed!", error);
        }
      });
    }
  },

  logout(e) {
    e.preventDefault();
    this.eventRef.unauth();
    this.setState({ invitations: [], auth: null });
  },

  loadData() {
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

      let auth = this.eventRef.getAuth();

      this.setState({ card, email, invitations, maxIndex, auth });
    });
  },

  componentWillUnmount: function() {
    this.eventRef.off();
  },

  addInvitation() {
    let maxIndex = this.state.maxIndex + 1;
    this.setState({ maxIndex });
    this.addInvitationWithIndex(maxIndex);
  },

  addInvitationWithIndex(index) {
    let people = [{ name: "" }];
    this.eventRef.child('invitations/' + randomKey()).set({ index, people });
  },

  insertInvitation(after, before, e) {
    e.preventDefault();
    this.addInvitationWithIndex((after + before)/2);
  },

  showBulkAdd() {
    this.setState({ showingBulkAdd: true });
  },

  // TBD how to design this user interface.
  // Need a way to send only to people who have not been sent yet.
  // Also need a way to know which emails have bounced.
  // Leaving out for now.
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

  renderInvitations() {
    let prevIndex = -1;
    return _.map(this.state.invitations, invitation => {
      let result = (
        <div key={invitation.index}>
          <button className="insert-invitation-button" onClick={this.insertInvitation.bind(this, prevIndex, invitation.index)}>&#8627; Add invitation</button>
          <InvitationSummary
            card={this.state.card}
            data={invitation}
            inviteRef={this.eventRef.child('invitations/' + invitation.inviteId)}
            eventId={this.props.params.eventId}
            inviteId={invitation.inviteId}
          />
        </div>
      );
      prevIndex = invitation.index;
      return result;
    });
  },

  render() {
    if (this.state.auth) {
      let displayName = this.state.auth[this.state.auth.provider].displayName;
      return (
        <div>
          <div className="user-header">
            <span>Logged in as {displayName} - <a href="#" onClick={this.logout}>Logout</a>
            </span>
          </div>
          <div className="guestbook">
              {this.renderInvitations()}
          </div>
          <div className="event-manager-controls">
            <button className="insert-invitation-button" onClick={this.addInvitation}>&#8627; Add Invitation</button>
            <div>
              <a href="#bulkadd" onClick={this.showBulkAdd}>Bulk add invitations</a>
            </div>
          </div>
          <a name="bulkadd"></a>
          {this.state.showingBulkAdd && <BulkAdd eventRef={this.eventRef}/>}
        </div>
      );
    } else {
      return (
        <div className="full-page-login">
          <center>
            <p>You must be logged in as an owner of this invitation to view it.</p>
            <a href="#" onClick={this.login}>Log in with Google</a>
          </center>
        </div>
      );
    }
  }
});

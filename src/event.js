import React from 'react';
import Firebase from 'firebase';
import _ from 'lodash';
import $ from 'jquery';
import InvitationSummary from './event/invitation-summary';
import BulkAdd from './event/bulk-add';
import randomKey from './util/random-key';
import { browserHistory } from 'react-router'

export default React.createClass({
  getInitialState: function() {
    return { items: {}, loaded: false };
  },

  componentWillMount: function() {
    this.eventRef = new Firebase(__DATABASE_LOCATION__ + '/event/' + this.props.params.eventId);
    this.eventRef.onAuth(authData => {
      if (authData) {
        this.loadData();
      } else {
        this.setState({ loaded: true });
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
    this.setState({ event: null, auth: null });
  },

  loadData() {
    this.eventRef.on("value", eventSnapshot => {

      let event = eventSnapshot.val();
      let maxIndex = 0;
      _.keys(event.invitations).forEach(inviteId => {
        let invitation = event.invitations[inviteId];
        maxIndex = Math.max(invitation.index, maxIndex);
      });

      let auth = this.eventRef.getAuth();
      let loaded = true;

      this.setState({ event, maxIndex, auth, loaded });

      this.checkForBounces();
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

  toggleBulkAdd() {
    this.setState({ showingBulkAdd: !this.state.showingBulkAdd });
  },

  // TBD how to design this user interface.
  // Need a way to send only to people who have not been sent yet.
  // Also need a way to know which emails have bounced.
  // Leaving out for now.
  sendAllEmails() {
    if (confirm('Are you sure you want to email invitations to all guests?')) {
      sendEmails(this.state.event.invitations);
    }
  },

  sendOneEmail(inviteId) {
    let invitations = {};
    invitations[inviteId] = this.state.event.invitations[inviteId];
    this.sendEmails(invitations);
  },

  sendEmails(invitations) {
    let eventEmail = this.state.event.email;
    let requestBody = {
      "eventId": this.props.params.eventId,
      "message1": eventEmail.message1,
      "message2": eventEmail.message2,
      "replyToName": eventEmail.replyToName,
      "replyToAddress": eventEmail.replyToAddress,
      "subject": eventEmail.subject,
      "invitations": _.keys(invitations).map(inviteId => {
        return {
          "id": inviteId,
          "toAddr": invitations[inviteId].email,
          "toName": invitations[inviteId].people[0].name
        };
      })
    };

    $.ajax({
      type: 'POST',
      url: '/sendmail',
      processData: false,
      contentType: 'application/json',
      data: JSON.stringify(requestBody)
    }).done(success => {
      this.exponentialBackoffCheckForBounces();
      this.rememberSentEmailAddresses(invitations);
    }).fail(error => {
      console.error(error.responseText);
    });
  },

  rememberSentEmailAddresses(sentInvitations) {
    let event = this.state.event;

    _.keys(sentInvitations).forEach(inviteId => {
      event.invitations[inviteId].sentEmail = sentInvitations[inviteId].email;
    });

    this.eventRef.set(event);
  },

  exponentialBackoffCheckForBounces() {
    for (let i=0; i<10; i++) {
      setTimeout(this.checkForBounces, Math.pow(2, i)*1000);
    }
  },

  checkForBounces() {
    $.ajax({
      type: 'GET',
      url: '/bounces',
      processData: false,
      contentType: 'application/json'
    }).done(response => {
      if (response.items && response.items.length > 0) {
        this.saveBounceRecords(response.items);
      }
    }).fail(error => {
      console.error(error.responseText);
    });
  },

  saveBounceRecords(newBouncedEmails) {
    let bouncedEmails = (this.state.event && this.state.event.bouncedEmails || []).concat(newBouncedEmails);
    this.eventRef.child('bouncedEmails').set(bouncedEmails);
    this.deleteOriginalBounceRecords(newBouncedEmails);
  },

  // App is responsible for deleting the remote records once it has acquired a
  // copy, to prevent the number of bounces from expanding indefinitely.
  deleteOriginalBounceRecords(bouncedEmails) {
    let successfulDeletes = [];

    bouncedEmails.forEach(email => {
      $.ajax({
        type: 'DELETE',
        url: '/bounces/' + email
      }).done(response => {
        successfulDeletes.push(email);
      }).fail(error => {
        console.error(error.responseText);
      });
    });
  },

  editMode() {
    return this.props.params.mode === 'edit';
  },

  toggleEdit(e) {
    e.preventDefault();
    let path = '/event/' + this.props.params.eventId + (this.editMode() ? '' : '/edit');
    browserHistory.push(path);
  },

  singleLineInvitation(invitation) {
    let namedPeople = [];
    let extras = 0;

    let people = _.chain(invitation.people).values().sortBy(person => person.index).value();
    people.forEach(person => {
      if (person.name) {
	namedPeople.push(person.name)
      } else {
	extras++;
      }
    });

    let parts = [
      namedPeople.join(', ') + ((extras > 0) ? (' +' + extras) : ''),
      invitation.email
    ].map((part, i) => {
      return (
	<div key={i}>{part}</div>
      );
    });

    return (
      <div key={invitation.index} className="single-line-invitation">
	{parts}
      </div>
    );
  },

  renderInvitations() {
    let invitationsArray = _.chain(this.state.event.invitations)
      .mapValues((invitation, inviteId) => _.extend(invitation, { inviteId }))
      .toArray()
      .sortBy(invitation => invitation.index)
      .value();

    let prevIndex = -1;

    return invitationsArray.map(invitation => {
      let emailState;
      if (_.includes(this.state.event.bouncedEmails, invitation.email)) {
        emailState = 'bounced';
      } else if (invitation.email && (invitation.email === invitation.sentEmail)) {
        emailState = 'sent';
      }

      let result = this.editMode() ? (
        <div key={invitation.index}>
          <button className="insert-invitation-button" onClick={this.insertInvitation.bind(this, prevIndex, invitation.index)}>&#8627; Add invitation</button>
          <InvitationSummary
            card={this.state.event.card}
            data={invitation}
            inviteRef={this.eventRef.child('invitations/' + invitation.inviteId)}
            eventId={this.props.params.eventId}
            inviteId={invitation.inviteId}
            emailState={emailState}
            onSend={this.sendOneEmail}
          />
        </div>
      ) : this.singleLineInvitation(invitation);
      prevIndex = invitation.index;
      return result;
    });
  },

  render() {
    let bodyClasses = ['scrolling-body'];
    if (this.editMode()) {
      bodyClasses.push('edit-mode');
    }

    if (this.state.auth) {
      let displayName = this.state.auth[this.state.auth.provider].displayName;
      return (
        <div>
          <div className="user-header">
            <span>Logged in as {displayName} - <a href="#" onClick={this.logout}>Logout</a>
            </span>
          </div>
	  <div className={bodyClasses.join(' ')}>
	    <div className="header-section">
	      <div>
		<a href="#" onClick={this.toggleEdit}>{this.editMode() ? 'Return to summary' : 'Edit invitations'}</a>
	      </div>
	    </div>
	    <div className="guestbook">
		{this.renderInvitations()}
	    </div>
	    <div className="event-manager-controls">
	      <button className="insert-invitation-button" onClick={this.addInvitation}>&#8627; Add Invitation</button>
	      <div>
		{!this.state.showingBulkAdd && <a href="#bulkadd" onClick={this.toggleBulkAdd}>Bulk add invitations</a>}
	      </div>
	    </div>
	    <a name="bulkadd"></a>
	    {this.state.showingBulkAdd && <BulkAdd eventRef={this.eventRef} onClose={this.toggleBulkAdd}/>}
	  </div>
        </div>
      );
    } else if (this.state.loaded) {
      return (
        <div className="full-page-login">
          <center>
            <p>You must be logged in as an owner of this invitation to view it.</p>
            <a href="#" onClick={this.login}>Log in with Google</a>
          </center>
        </div>
      );
    } else {
      return null;
    }
  }
});

import React from 'react';
import Firebase from 'firebase';
import _ from 'lodash';
import $ from 'jquery';
import InviteEdit from './event/invite-edit';
import ResponseReview from './event/response-review';
import BulkAdd from './event/bulk-add';
import randomKey from './util/random-key';
import { browserHistory } from 'react-router'
import ModalContainer from './util/modal-container';
import Lozenge from './lozenge';

export default React.createClass({
  getInitialState: function() {
    return { items: {}, loaded: false, sort: 'index' };
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
      //let exportData = JSON.stringify(event) // future export feature?
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

  addInvitation(e) {
    e.preventDefault();
    let maxIndex = this.state.maxIndex + 1;
    this.setState({ maxIndex });
    this.addInvitationWithIndex(maxIndex);
  },

  editSpecificInvitation(inviteId) {
    let path = '/event/' + this.props.params.eventId + '/edit/' + inviteId;
    browserHistory.push(path);
  },

  showList() {
    let path = '/event/' + this.props.params.eventId
    browserHistory.push(path);
  },

  addInvitationWithIndex(index) {
    let people = [{ name: "" }];
    let key = randomKey();
    this.eventRef.child('invitations/' + key).set({ index, people });
    this.editSpecificInvitation(key);
  },

  insertInvitation(after, before, e) {
    e.preventDefault();
    this.addInvitationWithIndex((after + before)/2);
  },

  deleteAll() {
    var verify = prompt("Really delete ALL invitations? Type 'yes' to continue");
    if (verify.toLowerCase() === 'yes') {
      this.eventRef.child('invitations').remove();
    }
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
    let invitation = this.state.event.invitations[inviteId];
    invitations[inviteId] = invitation;

    if (!invitation.email) {
      return;
    }

    if (confirm('Please confirm that you wish to send the invitation to ' + invitation.email)) {
      this.sendEmails(invitations);
    }
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
        let invitation = invitations[inviteId];
        let primaryPerson = _.chain(invitation.people).values().min(person => person.index).value();;
        return {
          "id": inviteId,
          "toAddr": invitation.email,
          "toName": primaryPerson.name
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

  rememberSentEmailAddresses(justSentInvitations) {
    let event = this.state.event;

    _.keys(justSentInvitations).forEach(inviteId => {
      event.invitations[inviteId].sentEmail = justSentInvitations[inviteId].email;
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

  didBounce(email) {
    return _.includes(this.state.event.bouncedEmails, email);
  },

  editInvitation(inviteId, e) {
    e.preventDefault();
    let path = '/event/' + this.props.params.eventId + '/invite/' + inviteId + '/edit';
    browserHistory.push(path);
  },

  viewResponse(inviteId, e) {
    e.preventDefault();
    let path = '/event/' + this.props.params.eventId + '/invite/' + inviteId;
    browserHistory.push(path);
  },

  deleteInvitation(inviteId, e) {
    e.preventDefault();
    let invitation = this.state.event.invitations[inviteId];
    let isBlank = (invitation.email == null || invitation.email == '') &&
      _.every(invitation.people, person => person.name == '');

    if (isBlank || confirm('Are you sure you want to delete this invitation?')) {
      this.eventRef.child('invitations').child(inviteId).remove();
    }
  },

  renderNames(invitation) {
    let renderedNames = this.peopleInInvitation(invitation).map((person, i) => {
      let answers = this.questionsAnsweredBy(person).map((question, j) => (
        <span key={j} className="comment">({person[question.name].trim()})</span>
      ));

      return (
        <div key={i} className="invitation-name">
          <Lozenge label={person.name} type={person.accept} />
          {answers}
        </div>
      );
    });

    let extras = this.extrasInInvitation(invitation);
    if (extras > 0) {
      renderedNames.push(<span key="extras"> +{extras}</span>)
    }

    return renderedNames;
  },

  singleLineResponse(invitation) {
    let people = this.peopleInInvitation(invitation);

    return (
      <div key={invitation.index} className="single-line-invitation" data-invite-id={invitation.inviteId}>
        <div className="invitation-names">
          {this.renderNames(invitation)}
        </div>
        <div className="invitation-response">
          <span className="comment">{invitation.comments.trim()}</span>
        </div>
        <div className="invitation-actions">
          <div className="horizontal-actions">
          </div>
        </div>
      </div>
    );
  },

  singleLineInvitation(invitation) {
    let bounced = this.state.event.bouncedEmails

    let emailClass, emailNote;
    if (this.didBounce(invitation.email)) {
      emailClass = 'bounced-email';
      emailNote = '(Bounced!)';
    } else if (invitation.email && invitation.email === invitation.sentEmail) {
      emailClass = 'sent-email';
      emailNote = '(Sent)';
    }

    return (
      <div key={invitation.index} className="single-line-invitation" data-invite-id={invitation.inviteId}>
        <div className="invitation-names">
          {this.renderNames(invitation)}
        </div>
        <div className="invitation-email">
          <span className={emailClass}>{invitation.email}</span>&nbsp;<b>{emailNote}</b>
        </div>
        <div className="invitation-actions">
          <div className="horizontal-actions">
            <a href="#" onClick={this.editInvitation.bind(this, invitation.inviteId)}>Edit</a>
            <a href="#" onClick={this.deleteInvitation.bind(this, invitation.inviteId)} className="warning-link">Delete</a>
            {invitation.email ? (
              <a href="#" onClick={this.sendOneEmail.bind(this, invitation.inviteId)} className="major-link">Send</a>
            ) : (<span className="disabled-link">Send</span>)}
          </div>
        </div>
      </div>
    );
  },

  invitationsArray() {
    return _.chain(this.state.event.invitations)
      .mapValues((invitation, inviteId) => _.extend(invitation, { inviteId }))
      .toArray()
      .sortBy(invitation => {
        if (this.state.sort === 'date') {
          return -(
            invitation.responseDates && _.max(invitation.responseDates) ||
            invitation.sentEmail && invitation.index + 1e6 ||
            invitation.index
          );
        } else {
          return invitation.index;
        }
      }).value();
  },

  peopleInInvitation(invitation) {
    return _.chain(invitation.people).values()
    .filter(person => person.name || person.accept)
    .sortBy(person => person.index).value();
  },

  extrasInInvitation(invitation) {
    return _.chain(invitation.people).values()
    .filter(person => !person.name && !person.accept)
    .value().length;
  },

  individualQuestions() {
    return _.chain(this.state.event.card.individualQuestions)
    .filter(question => question.name !== 'accept')
    .value();
  },

  questionsAnsweredBy(person) {
    return _.chain(this.individualQuestions())
    .filter(question => person[question.name])
    .value();
  },

  sortReset() {
    this.setState({ sort: 'index' });
  },

  sortNewest() {
    this.setState({ sort: 'date' });
  },

  render() {
    if (this.state.auth && this.state.event) {
      let displayName = this.state.auth[this.state.auth.provider].displayName;

      let inviteId = this.props.params.inviteId;
      let invitation = this.state.event.invitations && this.state.event.invitations[inviteId];
      let modalMode;
      if (this.props.params.action === 'edit') {
        modalMode = 'edit';
      } else if (invitation) {
        modalMode = 'view';
      }

      // Statistics
      let numPeopleEmailed = 0;
      let numPeopleAccepted = 0;
      let numPeopleDeclined = 0;
      let numPeopleNotResponded = 0;
      this.invitationsArray().forEach(invitation => {
        let numAcceptedInGroup = 0;
        let people = _.values(invitation.people)
        if (invitation.sentEmail) {
          numPeopleEmailed += people.length;
        }
        people.forEach(person => {
          if (person.accept === 'yes') {
            numAcceptedInGroup++;
          }
        });
        if (invitation.responseDates) {
          numPeopleAccepted += numAcceptedInGroup;
          numPeopleDeclined += people.length - numAcceptedInGroup;
        } else if (invitation.sentEmail) {
          numPeopleNotResponded += people.length;
        }
      });

      return (
        <div>
          <div className="user-header">
            <span>Logged in as {displayName} - <a href="#" onClick={this.logout}>Logout</a></span>
          </div>
          <div className="scrolling-body">
            <div className="guestbook-header">
              <div>{numPeopleEmailed} people emailed (including fill-ins)<br/>{numPeopleAccepted} accepted<br/>{numPeopleDeclined} declined (or left blank)<br/>{numPeopleNotResponded} not responded</div>
              <div>Sort <a href="#" onClick={this.sortReset}>in original order</a> or <a href="#" onClick={this.sortNewest}>by response date</a></div>
            </div>
            <div className="guestbook">
              {this.invitationsArray().map(invitation => {
                return invitation.responseDates ?
                  this.singleLineResponse(invitation) :
                  this.singleLineInvitation(invitation);
              })}
            </div>
            <div className="event-manager-controls">
              <a className="insert-invitation" href="#" onClick={this.addInvitation}>&#8627; Add Invitation</a>
              {!this.state.showingBulkAdd && <a href="#" onClick={this.toggleBulkAdd}>Bulk add invitations</a>}
              <a className="warning-link" href="#" onClick={this.deleteAll}>Delete all invitations</a>
            </div>
          </div>
          <ModalContainer condition={modalMode === 'view'} onClose={this.showList}>
            <ResponseReview
              card={this.state.event.card}
              data={invitation}
              inviteRef={this.eventRef.child('invitations/' + inviteId)}
            />
          </ModalContainer>
          <ModalContainer condition={modalMode === 'edit'} onClose={this.showList}>
            <InviteEdit
              data={invitation}
              inviteRef={this.eventRef.child('invitations/' + inviteId)}
              eventId={this.props.params.eventId}
              inviteId={inviteId}
            />
          </ModalContainer>
          <ModalContainer condition={this.state.showingBulkAdd} onClose={this.toggleBulkAdd}>
            <BulkAdd eventRef={this.eventRef} onImport={this.toggleBulkAdd}/>
          </ModalContainer>
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

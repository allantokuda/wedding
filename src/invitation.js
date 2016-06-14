import React from 'react';
import Firebase from 'firebase';
import Location from './location';
import Person from './person';
import LinkList from './link-list';

export default React.createClass({
  getInitialState: function() {
    return { edit: true };
  },

  componentWillMount: function() {
    let eventPath = __DATABASE_LOCATION__ + '/event/' + this.props.params.eventId;
    this.cardRef = new Firebase(eventPath + '/card');
    this.cardRef.on("value", function(cardSnapshot) {
      let card = cardSnapshot.val();
      this.invitationRef = new Firebase(eventPath + '/invitations/' + this.props.params.invitationId);
      this.invitationRef.on("value", function(invitationSnapshot) {
        let invitation = invitationSnapshot.val();
        let people = _.sortBy(invitation.people || [], invite => invite.index);
        let comments = invitation.comments || '';
        let edit = invitation.responseDates === undefined;
        this.setState({ card, people, comments, edit, invitation });
      }.bind(this));
    }.bind(this));

    setTimeout(this.checkValidInvitation, 3000);
  },

  checkValidInvitation: function() {
    if (!this.state.people) {
      this.setState({ loadError: 'Sorry, this seems to be the wrong link.' });
    }
  },

  componentWillUnmount: function() {
    this.cardRef.off();
    this.invitationRef.off();
  },

  validForSend() {
    return _.every(this.state.people, person => {
      return person.name == '' || person.name == null || person.accept != null;
    });
  },

  send(e) {
    e.preventDefault();

    if (!this.validForSend()) {
      alert('You must accept or decline for each named guest.');
    } else {
      // add timestamp to state and immediately send it to Firebase (requires direct manipulation and force update)
      this.state.invitation.responseDates = this.state.invitation.responseDates || [];
      this.state.invitation.responseDates.push(Firebase.ServerValue.TIMESTAMP);
      this.state.invitation.people   = this.state.people;
      this.state.invitation.comments = this.state.comments;

      this.invitationRef.set(this.state.invitation);

      this.setState({edit: false});
    }
  },

  anyYesOnThisInvitation() {
    let result = false;
    _.each(this.state.people, person => {
      result = result || person.accept === 'yes';
    });
    return result;
  },

  updatePerson: function(personId, attribute, value) {
    let updatedPeople = this.state.people;
    updatedPeople[personId][attribute] = value;
    this.setState({ people: updatedPeople });
  },

  comment: function(e) {
    this.setState({ comments: e.target.value });
  },

  reEnableForm: function(e) {
    e.preventDefault();
    this.setState({ edit: true });
  },

  renderFlier: function() {
    return (
      <div className="description panel" key={1}>
        <div className="panel-body">
          <h1>{this.state.card.title}</h1>
          <p>{this.state.card.date}</p>
          {this.state.card.locations.map((location, i) => <Location key={i} location={location}/>)}
          <LinkList data={this.state.card.registries} singularLabel="Registry" pluralLabel="Registries"/>
        </div>
      </div>
    );
  },

  renderForm: function() {
    if (this.state.edit) {
      let peopleSections = _.map(this.state.people, (person, personId) => {
        return (
          <Person key={personId} personId={personId} data={person} questions={this.state.card.individualQuestions} changeCallback={this.updatePerson} />
        );
      }, this);

      return (
        <div className="comments panel" key={2}>
          {peopleSections}

          <div className="panel-body">
            <label>Comments:</label>
            <textarea style={{width: "100%"}} value={this.state.comments} onChange={this.comment} />
          </div>

          <div className="panel-body">
            <div className="rsvp">
              <p><b>RSVP by {this.state.card.rsvp_date}</b></p>
              <a className="btn btn-lg btn-default btn-primary" href="#" onClick={this.send}>Send</a>
              <br/>
            </div>
          </div>
        </div>
      );
    } else {
      let response;
      if (this.anyYesOnThisInvitation()) {
        response = 'Looking forward to seeing you!';
      } else {
        response = "Sorry you can't make it!";
      }

      return (
        <div className="description panel">
          <div className="panel-body">
            <p><b>{response}</b></p>
            <p>If things change between now and {this.state.card.rsvp_date}, you may <a href="#" onClick={this.reEnableForm}>update your answers</a>.</p>
            <br/>
          </div>
        </div>
      );
    }
  },

  render: function() {
    if (this.state.card) {
      let backgroundStyle = {
        backgroundImage: this.state.card.backgroundImage,
        backgroundPosition: this.state.card.backgroundPosition
      };

      return (
        <div className="invitation" style={backgroundStyle}>
          {this.renderFlier()}
          {this.renderForm()}
        </div>
      );
    } else if (this.state.loadError) {
      return (
        <div className="comments panel">
          <div className="panel-body">
            <p>{ this.state.loadError }</p>
          </div>
        </div>
      );
    } else {
      return (
        <div className="comments panel">
          <div className="panel-body">
            <p>Loading...</p>
          </div>
        </div>
      );
    }

  }
});

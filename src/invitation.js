import React from 'react';
import Firebase from 'firebase';
import Location from './location';
import Person from './person';

export default React.createClass({
  getInitialState: function() {
    return { edit: true };
  },

  componentWillMount: function() {
    this.invitationRef = new Firebase(__DATABASE_LOCATION__ + '/invitation/' + this.props.params.invitationId);
    this.invitationRef.on("value", function(invitationSnapshot) {
      let invitation = invitationSnapshot.val();
      this.eventRef = new Firebase(__DATABASE_LOCATION__ + '/event/' + invitation.event_id);
      this.eventRef.on("value", function(eventSnapshot) {
        invitation.event = eventSnapshot.val();
        invitation.edit = invitation.responseDates === undefined;
        this.setState(invitation);
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
    this.invitationRef.off();
  },

  send(e) {
    e.preventDefault();

    // add timestamp to state and immediately send it to Firebase (requires direct manipulation and force update)
    this.state.responseDates = this.state.responseDates || [];
    this.state.responseDates.push(Firebase.ServerValue.TIMESTAMP);
    this.forceUpdate();

    this.invitationRef.set(this.state);
  },

  anyYesOnThisInvitation() {
    let result = false;
    this.state.people.forEach(person => {
      result = result || person.accept === 'yes';
    });
    return result;
  },

  updatePerson: function(personNumber, attribute, value) {
    let updatedPeople = this.state.people.slice();
    updatedPeople[personNumber][attribute] = value;
    this.setState({ people: updatedPeople });
  },

  comment: function(e) {
    this.setState({ comments: e.target.value });
  },

  reEnableForm: function(e) {
    e.preventDefault();
    this.setState({ edit: true });
  },

  renderRsvpLine() {
    return this.state.edit ? (
      <p><b>RSVP by {this.state.event.rsvp_date}</b></p>
    ) : (
      <p>&nbsp;</p>
    );
  },

  renderFlier: function() {
    return (
      <div className="description panel" key={1}>
        <div className="panel-body">
          <h1>{this.state.event.title}</h1>
          <p>{this.state.event.date}</p>
          {this.state.event.locations.map((location, i) => <Location key={i} location={location}/>)}
          {this.renderRsvpLine()}
        </div>
      </div>
    );
  },

  renderForm: function() {
    if (this.state.edit) {
      let peopleSections = this.state.people.map(function(person, i) {
        return (
          <Person key={i} personNumber={i} data={person} questions={this.state.event.individualQuestions} changeCallback={this.updatePerson} />
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
            <div>
              {this.renderRsvpLine()}
              <a className="btn btn-lg btn-default btn-primary" href="#" onClick={this.send}>Send</a>
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
            {this.state.event.thankYou}
            <p>If things change between now and {this.state.event.rsvp_date}, you may <a href="#" onClick={this.reEnableForm}>update your answers</a>.</p>
            <br/>
          </div>
        </div>
      );
    }
  },

  render: function() {
    if (this.state.event) {
      let backgroundStyle = {
        backgroundImage: this.state.event.backgroundImage,
        backgroundPosition: this.state.event.backgroundPosition
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

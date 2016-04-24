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
        this.setState(invitation);
        this.setState({ edit: invitation.event.responseDate !== undefined });
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

  send: function(e) {
    e.preventDefault();

    // add timestamp to state and immediately send it to Firebase (requires direct manipulation and force update)
    this.state.responseDate = Firebase.ServerValue.TIMESTAMP;
    this.forceUpdate();

    this.setState({ edit: false });

    this.invitationRef.set(this.state);
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

  render: function() {
    if (this.state.people) {
      let peopleSections = this.state.people.map(function(person, i) {
        return (
          <Person key={i} personNumber={i} data={person} questions={this.state.event.individualQuestions} changeCallback={this.updatePerson} disabled={!this.state.edit} />
        );
      }, this);

      let description_lines = this.state.event && this.state.event.description.split("\n");

      let backgroundStyle = {
        backgroundImage: 'url(' + this.state.event.backgroundImage + ')',
        backgroundPosition: this.state.event.backgroundPosition
      };
      let rsvpLine = this.state.edit ? (
        <p><b>RSVP by {this.state.event.rsvp_date}</b></p>
      ) : <p>&nbsp;</p>

      return (
        <div className="invitation" style={backgroundStyle}>
          <div className="description panel">
            <div className="panel-body">
              <h1>You're invited</h1>
              {description_lines.map(line => <p>{line}</p>)}
              {this.state.event.locations.map((location, i) => <Location key={i} location={location}/>)}
              {rsvpLine}
            </div>
          </div>
          <div className="comments panel">
            {peopleSections}

            <div className="panel-body">
              <label>Comments:</label>
              <textarea style={{width: "100%"}} value={this.state.comments} onChange={this.comment} disabled={!this.state.edit} />
            </div>

            <div className="panel-body">
              {this.state.edit ? (
                <div>
                  {rsvpLine}
                  <a className="btn btn-lg btn-default btn-primary" href="#" onClick={this.send}>Send</a>
                </div>
              ) : (
                <div>
                  <p>Thank you for responding!</p>
                  {this.state.event.thankYou}
                  <p>If things change between now and {this.state.event.rsvp_date}, you may <a href="#" onClick={this.reEnableForm}>update your answers</a>.</p>
                  <br/>
                </div>
              )}
            </div>
          </div>
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

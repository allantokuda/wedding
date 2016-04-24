import React from 'react';
import Firebase from 'firebase';
import Location from './location';
import Person from './person';

export default React.createClass({
  getInitialState: function() {
    return { };
  },

  componentWillMount: function() {
    this.invitationRef = new Firebase(__DATABASE_LOCATION__ + '/invitation/' + this.props.params.invitationId);
    this.invitationRef.on("value", function(invitationSnapshot) {
      let invitation = invitationSnapshot.val();
      this.eventRef = new Firebase(__DATABASE_LOCATION__ + '/event/' + invitation.event_id);
      this.eventRef.on("value", function(eventSnapshot) {
        invitation.event = eventSnapshot.val();
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

  send: function(e) {
    e.preventDefault();

    // add timestamp to state and immediately send it to Firebase (requires direct manipulation and force update)
    this.state.responseDate = Firebase.ServerValue.TIMESTAMP;
    this.forceUpdate();

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

  render: function() {
    if (this.state.people) {
      let peopleSections = this.state.people.map(function(person, i) {
        return (
          <Person key={i} personNumber={i} data={person} questions={this.state.event.individualQuestions} changeCallback={this.updatePerson} />
        );
      }, this);

      let reactionTag;
      if (this.state.responseDate) {
        reactionTag = <div className="reaction panel">
          <div className="panel-body">
            <p>Thank you for responding!</p>
            <div className="backdrop">
            <video className="dancing" src="/dancing.webm" autoplay loop controls width="550"></video>
            </div>
          </div>
        </div>;
      }

      let description_lines = this.state.event && this.state.event.description.split("\n");

      let backgroundStyle = {
        backgroundImage: 'url(' + this.state.event.backgroundImage + ')',
        backgroundPosition: this.state.event.backgroundPosition
      };

      return (
        <div className="invitation" style={backgroundStyle}>
          <div className="description panel">
            <div className="panel-body">
              <h1>You're invited</h1>
              {description_lines.map(line => <p>{line}</p>)}
              {this.state.event.locations.map((location, i) => <Location key={i} location={location}/>)}
            </div>
          </div>
          {peopleSections}
          <div className="comments panel">
            <div className="panel-body">
              <label>Comments:</label>
              <textarea style={{width: "100%"}} value={this.state.comments} onChange={this.comment} />
            </div>
          </div>
          <div className="rsvp">
            <a className="btn btn-lg btn-default" href="#" onClick={this.send}>RSVP by March 31</a>
          </div>
          { reactionTag }
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

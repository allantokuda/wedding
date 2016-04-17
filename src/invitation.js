import React from 'react';
import Firebase from 'firebase';
import { firebaseLocation } from '../config';
import Description from './description';
import Person from './person';

export default React.createClass({
  getInitialState: function() {
    return { };
  },

  componentWillMount: function() {
    this.invitationRef = new Firebase(firebaseLocation + '/invitation/' + this.props.params.invitationId);
    this.invitationRef.on("value", function(invitationSnapshot) {
      let invitation = invitationSnapshot.val();
      this.eventRef = new Firebase(firebaseLocation + '/event/' + this.state.event_id);
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
          <Person key={i} personNumber={i} data={person} changeCallback={this.updatePerson} />
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

      return (
        <div className="invitation">
          <Description group={this.state.group} />
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

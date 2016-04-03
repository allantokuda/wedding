var Invitation = React.createClass({
  getInitialState: function() {
    return { };
  },

  componentWillMount: function() {
    this.firebaseRef = new Firebase(window.firebaseLocation + '/invitation/' + this.props.id);

    this.firebaseRef.on("value", function(dataSnapshot) {
      this.setState(dataSnapshot.val());
    }.bind(this));

    setTimeout(this.checkValidInvitation, 3000);
  },

  checkValidInvitation: function() {
    if (!this.state.people) {
      this.setState({ loadError: 'Sorry, this seems to be the wrong link.' });
    }
  },

  componentWillUnmount: function() {
    this.firebaseRef.off();
  },

  send: function(e) {
    e.preventDefault();

    // add timestamp to state and immediately send it to Firebase (requires direct manipulation and force update)
    this.state.responseDate = Firebase.ServerValue.TIMESTAMP;
    this.forceUpdate();

    this.firebaseRef.set(this.state);
  },

  updatePerson: function(personNumber, attribute, value) {
    var updatedPeople = this.state.people.slice();
    updatedPeople[personNumber][attribute] = value;
    this.setState({ people: updatedPeople });
  },

  comment: function(e) {
    this.setState({ comments: e.target.value });
  },

  render: function() {
    if (this.state.people) {
      peopleSections = this.state.people.map(function(person, i) {
        return (
          <Person key={i} personNumber={i} data={person} changeCallback={this.updatePerson} />
        );
      }, this);

      var reactionTag;
      if (this.state.responseDate) {
        reactionTag = <div className="reaction panel">
          <div className="panel-body">
            <p>Thank you for responding!</p>
            <div className="backdrop">
            <video className="dancing" src="dancing.webm" autoplay loop controls width="550"></video>
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

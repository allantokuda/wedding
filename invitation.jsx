var Invitation = React.createClass({
  getInitialState: function() {
    return { };
  },

  componentWillMount: function() {
    this.firebaseRef = new Firebase(window.firebaseLocation + this.props.id);

    this.firebaseRef.on("value", function(dataSnapshot) {
      this.setState(dataSnapshot.val());
    }.bind(this));
  },

  componentWillUnmount: function() {
    this.firebaseRef.off();
  },

  send: function(e) {
    e.preventDefault();
    this.firebaseRef.set(this.state);
  },

  updatePerson: function(personNumber, attribute, value) {
    var updatedPeople = this.state.people.slice();
    updatedPeople[personNumber][attribute] = value;
    this.setState({ people: updatedPeople });
  },

  render: function() {
    if (this.state.people) {
      console.log(this.state.people[0]);
      console.log(this.state.people[1]);
      peopleSections = this.state.people.map(function(person, i) {
        return (
          <Person key={i} personNumber={i} data={person} changeCallback={this.updatePerson} />
        );
      }, this);

      return (
        <div className="invitation">
          {peopleSections}
          <div className="rsvp">
            <a className="btn btn-lg btn-default" href="#" onClick={this.send}>RSVP</a>
          </div>
        </div>
      );
    } else {
      return null;
    }

  }
});

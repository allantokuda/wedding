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

  render: function() {
    console.log(this.state);
    if (this.state.people) {
      updatePerson = function(personNumber, attribute, value) {
        var updatedPeople = this.state.people.slice();
        updatedPeople[personNumber][attribute] = value;
        this.setState({ people: updatedPeople });
      }.bind(this);

      peopleSections = this.state.people.map(function(person, i) {
        return (
          <div>
            <Person key={i} personNumber={i} name={person.name} changeCallback={this.updatePerson} />;
          </div>
        );
      });

      return (
        <div className="invitation">
          {peopleSections}
          <div className="rsvp">
            <a className="btn btn-lg btn-default" href="#">RSVP</a>
          </div>
        </div>
      );
    } else {
      return null;
    }

  }
});

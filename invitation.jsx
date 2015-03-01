var Invitation = React.createClass({
  getInitialState: function() {
    var match,
        search = /([^&=]+)=?([^&]*)/g,
        decode = function(s) { return decodeURIComponent(s.replace(/\+/g, " ")); },
        query  = window.location.search.substring(1),
        params = {};

    while (match = search.exec(query))
       params[decode(match[1])] = decode(match[2]);

    return { inviteId: params['inviteId'] };
  },

  componentWillMount: function() {
    this.firebaseRef = new Firebase(window.firebaseLocation);
    this.firebaseRef.on("child_changed", function(dataSnapshot) {
      console.log(dataSnapshot.val());
      this.items.push(dataSnapshot.val());
      this.setState({
        items: this.items
      });
    }.bind(this));
  },

  componentWillUnmount: function() {
    this.firebaseRef.off();
  },

  go: function() {
    console.log(this.state.people[0], this.state.people[1]);
  },

  render: function() {
    console.log(this.state);
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
        <a href="#" onClick={this.go}>Test</a>
        <div className="rsvp">
          <a className="btn btn-lg btn-default" href="mailto:praetis@gmail.com?subject=Stacy%20and%20Allan%20wedding&body=Yes, we gladly accept your invitation!%0D%0A%0D%0ADietary restrictions:">RSVP</a>
        </div>
      </div>
    );
  }
});

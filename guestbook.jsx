var Guestbook = React.createClass({
  getInitialState: function() {
    return { items: {} };
  },

  componentWillMount: function() {
    var items;
    this.firebaseRef = new Firebase(window.firebaseLocation);
    this.firebaseRef.on("value", function(dataSnapshot) {
      items = dataSnapshot.val();
      this.setState({
        items: dataSnapshot.val()
      });
    }.bind(this));
  },

  componentWillUnmount: function() {
    this.firebaseRef.off();
  },

  render: function() {
    var result = [];

    console.log(this.state);
    console.log(_.each);
    var result = _.map(this.state.items, function(item, inviteId) {
      var emailLink = <a href={ "mailto:" + item.email + "?body=" + inviteId }>{ item.email }</a>

      people = _.map(item.people, function(person, i) {
        return (
          <tr style={ i == 0 ? { fontWeight: 'bold' } : {} }>
            <td>{ person.name || '+1' }</td>
            <td>{ person.accept || '-' }</td>
            <td>{ person.drinks || '-' }</td>
            <td>{ i == 0 ? emailLink : null }</td>
          </tr>
        );
      });

      return people;
    });

    return (
      <table className="table" style={{width: "300px"}}>
        <thead>
          <th>Name</th>
          <th>Accept?</th>
          <th>Drinks?</th>
        </thead>
        <tbody>
          { result }
        </tbody>
      </table>
    );
  }
});

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
    var result = _.map(this.state.items, function(item, inviteId) {
      var inviteLink = window.siteLocation + "invitation.html?inviteId=" + inviteId
      // TODO remove 'disabled-' later when ready
      var emailLink = "mailto:disabled-" + item.email + "?subject=" + window.emailSubject + "&body=" + inviteLink

      var emailTag = <a href={emailLink}>{ item.email }</a>
      var inviteTag = <a href={inviteLink}>Invitation</a>

      people = _.map(item.people, function(person, i) {
        return (
          <tr style={ i == 0 ? { fontWeight: 'bold' } : {} }>
            <td>{ person.name || '+1' }</td>
            <td>{ person.accept || '-' }</td>
            <td>{ person.drinks || '-' }</td>
            <td>{ i == 0 ? emailTag : null }</td>
            <td>{ i == 0 ? inviteTag : null }</td>
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
          <th>Invitation email</th>
          <th>Invitation</th>
        </thead>
        <tbody>
          { result }
        </tbody>
      </table>
    );
  }
});

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
    var body = "Stacy and I are getting married! Please follow this link to RSVP by March 31. Hope to see you there!";
    var result = _.map(this.state.items, function(item, inviteId) {
      var inviteLink = "invitation.html?inviteId=" + inviteId
      var emailLink = "mailto:" + item.email + "?subject=" + window.emailSubject + "&body=" + body + "%0A%0A" + inviteLink

      var emailTag = <a href={emailLink}>{ item.email }</a>
      var inviteTag = <a href={inviteLink}>Invitation</a>

      people = _.map(item.people, function(person, i) {
        return (
          <tr style={ i == 0 ? { fontWeight: 'bold' } : {} }>
            <td>{ person.name || '+1' }</td>
            <td>{ i == 0 ? emailTag : null }</td>
            <td>{ i == 0 ? inviteTag : null }</td>
            <td>{ person.accept || '-' }</td>
            <td>{ person.drinks || '-' }</td>
            <td>{ i == 0 ? item.comments : '-' }</td>
          </tr>
        );
      });

      return people;
    });

    return (
      <table className="table">
        <thead>
          <th>Name</th>
          <th>Invitation email</th>
          <th>Invitation</th>
          <th>Accept?</th>
          <th>Drinks?</th>
          <th>Comments</th>
        </thead>
        <tbody>
          { result }
        </tbody>
      </table>
    );
  }
});

var Invitation = React.createClass({
  render: function() {
    invitation = this.props.names.map(function(name, i) {
      return (<Person key={i} personNumber={i} name={name} />);
    });

    return (
      <div className="invitation">{invitation}</div>
    );
  }
});

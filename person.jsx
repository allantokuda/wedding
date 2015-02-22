var Person = React.createClass({
  getInitialState: function() {
    return { accept: undefined, drinks: false, comments: "" }
  },

  yes: function() { this.setState({ accept: true  }); },
  no:  function() { this.setState({ accept: false }); },

  render: function() {
    return (
      <div className="person panel panel-default">
        <div className="panel-body">
          <div className="row">
            <div className="name col-sm-4">
              <h3>{ this.props.name }</h3>
            </div>
            <div className="response col-sm-4">
              <label>
                <input type="radio" name={ "accept" + this.props.personNumber } onClick={ this.yes } value="yes" />
                <span>Gladly accept</span>
              </label><br />
              <label>
                <input type="radio" name={ "accept" + this.props.personNumber } onClick={ this.no } value="no" />
                <span>Unable to attend</span>
              </label>
            </div>
            <div className="response col-sm-4">
              <br />
              <label>
                <input type="checkbox" name={ "late" + this.props.personNumber } value="yes" />
                <span>Will join for drinks after reception</span>
              </label><br />
            </div>
          </div>
        </div>
      </div>
    );
  }
});

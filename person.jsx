var Person = React.createClass({
  getInitialState: function() {
    return null;
  },

  yes: function() { this.props.changeCallback(this.props.personNumber, 'accept', true ); },
  no:  function() { this.props.changeCallback(this.props.personNumber, 'accept', false ); },
  drinks: function(e) { console.log(this.refs.drinks); this.props.changeCallback(this.props.personNumber, 'drinks', e ); },

  render: function() {
    return (
      <div className="person panel panel-default">
        <div className="panel-body">
          <div className="row">
            <div className="name col-sm-4">
              <input value={ this.props.name }></input>
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
                <input type="checkbox" name={ "late" + this.props.personNumber } ref="drinks" onChange={ this.drinks } value="yes" defaultChecked="no" />
                <span>Will join for drinks after reception</span>
              </label><br />
            </div>
          </div>
        </div>
      </div>
    );
  }
});

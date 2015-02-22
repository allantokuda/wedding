var Person = React.createClass({
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
                <input type="radio" name={ "accept" + this.props.personNumber } value="yes" />
                Gladly accept
              </label><br />
              <label>
                <input type="radio" name={ "accept" + this.props.personNumber } value="no" />
                Unable to attend
              </label>
            </div>
            <div className="response col-sm-4">
              <br />
              <label>
                <input type="checkbox" name={ "late" + this.props.personNumber } value="yes" />
                Drinks after reception
              </label><br />
            </div>
          </div>
        </div>
      </div>
    );
  }
});

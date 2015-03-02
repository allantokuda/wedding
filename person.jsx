var Person = React.createClass({
  change: function(e) {
    this.props.changeCallback(this.props.personNumber, e.target.name, e.target.value );
  },

  changeCheckbox: function(e) {
    this.props.changeCallback(this.props.personNumber, e.target.name, e.target.checked ? "yes" : "no" );
  },

  render: function() {
    return (
      <form>
        <div className="person panel panel-default">
          <div className="panel-body">
            <div className="row">
              <div className="name col-sm-4">
                <input type="text" name="name" onChange={this.change} value={ this.props.name }></input>
              </div>
              <div className="response col-sm-4">
                <label>
                  <input type="radio" name="accept" onChange={ this.change } value="yes" />
                  <span>Gladly accept</span>
                </label><br />
                <label>
                  <input type="radio" name="accept" onChange={ this.change } value="no" />
                  <span>Unable to attend</span>
                </label>
              </div>
              <div className="response col-sm-4">
                <br />
                <label>
                  <input type="checkbox" name="drinks" onChange={ this.changeCheckbox } defaultChecked="false" />
                  <span>Will join for drinks after reception</span>
                </label><br />
              </div>
            </div>
          </div>
        </div>
      </form>
    );
  }
});

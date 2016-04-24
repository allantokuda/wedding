import React from 'react';

export default React.createClass({
  getInitialState: function() {
    return { plusOne: this.props.data.name == "" };
  },

  change: function(inputName, inputValue, e) {
    this.props.changeCallback(this.props.personNumber, inputName, inputValue );
  },

  changeCheckbox: function(inputName, e) {
    this.props.changeCallback(this.props.personNumber, inputName, e.target.checked ? "yes" : "no" );
  },

  renderRadio(radio, formIndex) {
    return (
      <div className="response col-sm-4" key={formIndex}>
        {radio.options.map((option, i) => {
          return (
            <label key={i} className="checkbox-radio">
              <input type="radio" name={option.name} onChange={ this.change.bind(this, radio.name, option.name) } checked={ this.props.data[radio.name] == option.name } value={option.name} />
              <span>{option.label}</span>
            </label>
          )
        })}
      </div>
    );
  },

  renderCheckbox(checkbox, formIndex) {
    return (
      <div className="response col-sm-4" key={formIndex}>
        <br />
        <label className="checkbox-radio">
          <input type="checkbox" name={checkbox.name} onChange={ this.changeCheckbox.bind(this, checkbox.name) } checked={ this.props.data[checkbox.name] == 'yes' } />
          <span>{checkbox.label}</span>
        </label><br />
      </div>
    );
  },

  renderText(textField, formIndex) {
    // TODO make text field wrap
    let minWidth = 100; //Math.max((textField.placeholder || '').length*6, 200);

    return (
      <div className="response col-sm-4" key={formIndex}>
        <label>
          <span>{textField.label}</span>
          <input type="text" name={textField.name} onChange={ this.changeCheckbox.bind(this, textField.name) } placeholder={textField.placeholder} style={{minWidth}}/>
        </label>
      </div>
    );
  },

  renderOptions: function() {
    return this.props.questions.map((question, i) => {
      if (question.type == 'radio') {
        return this.renderRadio(question, i);
      } else if (question.type == 'checkbox') {
        return this.renderCheckbox(question, i);
      } else if (question.type == 'text') {
        return this.renderText(question, i);
      } else {
        console.error('unknown question type', question);
      }
    });
  },

  render: function() {
    var plusOne = (this.state.plusOne) ? <label style={{fontWeight: "normal", fontStyle: "italic" }}>+1 guest</label> : null;
    return (
      <div className="panel-body invitation-part">
        <form>
          <div className="row">
            <div className="name col-sm-4">
              <input type="text" name="name" onChange={this.change} value={ this.props.data.name }></input>
              { plusOne }
            </div>
            {this.renderOptions()}
          </div>
        </form>
      </div>
    );
  }
});

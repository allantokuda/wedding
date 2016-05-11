import React from 'react';

export default React.createClass({
  getInitialState: function() {
    return { plusOne: this.props.data.name == "" };
  },

  changeRadio: function(inputName, inputValue, e) {
    this.props.changeCallback(this.props.personId, inputName, inputValue );
  },

  changeCheckbox: function(inputName, e) {
    this.props.changeCallback(this.props.personId, inputName, e.target.checked ? "yes" : "no" );
  },

  changeText: function(inputName, e) {
    this.props.changeCallback(this.props.personId, inputName, e.target.value );
  },

  renderRadio(radio, formIndex) {
    return (
      <div className="response" key={formIndex}>
        {radio.options.map((option, i) => {
          return (
            <label key={i} className="checkbox-radio">
              <input type="radio" name={option.name} onChange={ this.changeRadio.bind(this, radio.name, option.name) } checked={ this.props.data[radio.name] == option.name } value={option.name} />
              <span>{option.label}</span>
            </label>
          )
        })}
      </div>
    );
  },

  renderCheckbox(checkbox, formIndex) {
    return (
      <div className="response" key={formIndex}>
        <br />
        <label className="checkbox-radio">
          <input type="checkbox" name={checkbox.name} onChange={ this.changeCheckbox.bind(this, checkbox.name) } checked={ this.props.data[checkbox.name] == 'yes' } />
          <span>{checkbox.label}</span>
        </label><br />
      </div>
    );
  },

  renderText(textField, formIndex) {
    return (
      <div className="response right" key={formIndex}>
        <label className="textarea">
          <span>{textField.label}</span>
          <textarea name={textField.name} onChange={ this.changeText.bind(this, textField.name) } placeholder={textField.placeholder} value={ this.props.data[textField.name] } />
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
    return (
      <div className="panel-body invitation-part">
        <form>
          <div className="row">
            <div className="name response">
              <input type="text" name="name" onChange={this.changeText.bind(this, 'name')} placeholder="Guest name" value={ this.props.data.name }></input>
            </div>
            {this.renderOptions()}
          </div>
        </form>
      </div>
    );
  }
});

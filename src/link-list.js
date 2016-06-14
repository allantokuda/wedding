import React from 'react';
export default React.createClass({
  render() {
    let items = this.props.data;

    if (items == null || items.length === 0) {
      return null;
    }

    let label = (items.length == 1) ? this.props.singularLabel : this.props.pluralLabel;
    return (
      <p className="link-list">{label}: {items.map((item, i) => (
        <span key={i}>
          {i === 0 ? null : ', '}
          <a href={item.url}>{item.name}</a>
        </span>
      ))}</p>
    );
  }
});

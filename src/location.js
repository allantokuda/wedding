import React from 'react';

export default React.createClass({
  render() {
    let loc = this.props.location;
    return (
      <div>
        {loc.what && <h2>{loc.what}</h2>}
        {loc.when && <p>{loc.when}</p>}
        <p>
          {loc.where}
          {loc.map     && <span> (<a target="_blank" href={loc.map    }>Map</a>)</span>}
          {loc.website && <span> (<a target="_blank" href={loc.website}>Website</a>)</span>}
        </p>
        {loc.how && <p className="details">{loc.how}</p>}
      </div>
    );
  }
});

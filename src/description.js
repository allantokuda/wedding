var Description = React.createClass({
  renderPlace: function(place) {
    var result = [];
    result.push(<p>{place.time}</p>);
    result.push(
      <p>{place.name} (<a href={"https://www.google.com/maps/dir//" + place.address + "/"}>Map</a>) (<a href={place.website}>Website</a>)</p>
    );

    if (place.details) {
      result.push(<p className="details">{place.details}</p>);
    }

    return result;
  },

  render: function() {
    var content;

    var date = 'Sunday, May 24, 2015 (day before Memorial Day)';

    var ceremony = {
      time: '10:30am',
      name: 'Minnesota Landscape Arboretum',
      address: '3675 Arboretum Drive, Chaska MN 55318',
      website: 'http://www.arboretum.umn.edu/',
      details: 'Follow the Three Mile Drive loop, and park either at the Prairie Garden or the Weeping Trees (500 feet past Prairie Garden).'
    };

    var reception = {
      time: '4:00pm',
      name: 'Theodore Wirth Park Pavilion',
      address: '3275 Glenwood Ave, Minneapolis, MN 55405',
      website: 'https://www.minneapolisparks.org/rentals__permits/reception__event_sites/events_at_wirth_pavilion/',
      details: 'Alcohol is not allowed at the pavilion, but we will be going for drinks around 9pm (location to be determined).'
    };

    switch(this.props.group) {
      case "1":
        content = (
          <div className="panel-body">
            <h1>You're invited</h1>
            <p>to Stacy and Allan's wedding ceremony and reception!</p>
            <p>{ date }</p>

            <h2>Ceremony</h2>
            { this.renderPlace(ceremony) }

            <h2>Reception</h2>
            { this.renderPlace(reception) }
          </div>
        );
        break;

      default:
        content = (
          <div className="panel-body">
            <h1>You're invited</h1>
            <p>to Stacy and Allan's wedding reception!</p>
            <p>{ date }</p>

            { this.renderPlace(reception) }
          </div>
        );
        break;
    }


    return (
      <div className="description panel">
        { content }
      </div>
    );
  }
});

import React from 'react';
import { render } from 'react-dom';
import { Router, Route, browserHistory } from 'react-router';
import Event from './src/event';
import Invitation from './src/invitation';

require("./node_modules/bootstrap/dist/css/bootstrap.min.css");

render((
  <Router history={browserHistory}>
    <Route path="/event/:eventId/invitation/:invitationId" component={Invitation}/>
    <Route path="/event/:eventId/:mode" component={Event}/>
    <Route path="/event/:eventId" component={Event}/>
    <Route path="/invitation/:invitationId" component={Invitation}/>
  </Router>
), document.getElementById('app'));

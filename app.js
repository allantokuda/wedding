import React from 'react';
import { render } from 'react-dom';
import { Router, Route, browserHistory } from 'react-router';
import Event from './src/event';
import Invitation from './src/invitation';

render((
  <Router history={browserHistory}>
    <Route path="/event/:eventId" component={Event}/>
    <Route path="/invitation/:invitationId" component={Invitation}/>
  </Router>
), document.getElementById('app'));

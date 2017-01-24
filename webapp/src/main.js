import React from 'react';
import ReactDOM from 'react-dom';

import routes from './routes';
import render from '@sketchpixy/rubix/lib/node/router';


render(routes, () => {
  console.log('Completed rendering!');
});

if (module.hot) {
  module.hot.accept('./routes', () => {
    // reload routes again
    require('./routes').default;
    render(routes);
  });
}

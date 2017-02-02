import React from 'react';
import classNames from 'classnames';
import { IndexRoute, Route } from 'react-router';

import { Grid, Row, Col, MainContainer } from '@sketchpixy/rubix';

import Footer from './components/common/footer';
import Header from './components/common/header';

import HomeContainer from './components/home/homeContainer';

class App extends React.Component {
  render() {
    return (
      <MainContainer {...this.props}>
        <Header />
        <div id='body'>
          <Grid>
            <Row>
              <Col xs={12}>
                {this.props.children}
              </Col>
            </Row>
          </Grid>
        </div>
        <Footer />
      </MainContainer>
    );
  }
}

export default (
  <Route path='/' component={App}>
    <IndexRoute component={HomeContainer}/>
  </Route>
);

import React from 'react';

import {
  Row,
  Col,
  Grid,
} from '@sketchpixy/rubix';

export default class Footer extends React.Component {
  state = {
    version: 0
  };

  componentDidMount() {
    this.setState({
      version: document.body.getAttribute('data-version')
    });
  }

  render() {
    var year = new Date().getFullYear();
    return (
      <div id='footer-container'>
        <Grid id='footer' className='text-center'>
          <Row>
            <Col xs={12}>
              <div>© {year} DX Liquid Intel</div>
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

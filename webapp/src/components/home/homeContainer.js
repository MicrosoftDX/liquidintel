import React from 'react';
import KegStatus from './kegStatus';
import BeerActivity from './beerActivity';
import ErrorMessage from './errorMessage';
import LoadingMessage from './loadingMessage';
import { webAppConfig } from '../../config/default.js';


import {
  Row,
  Col,
  Grid,
  Panel,
  PanelBody,
  PanelHeader,
  FormControl,
  PanelContainer,
} from '@sketchpixy/rubix';

export default class HomeContainer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      kegs: [],
      activity: []
    };
  }

  componentDidMount() {
    //Using a polling strategy
    this._timer = setInterval(() => this.poll(), 1000);

  }
  componentWillUnmount() {
    const kegs = [];
    const activity = [];
    const kegsError = false;
    const activityError = false;
    this.setState({ kegs, activity });
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
  }

  poll() {
    var numberOfElems = 25;
    var myHeaders = new Headers();
    myHeaders.append("Accept", "application/json");
    myHeaders.append("Cache-Control", "no-cache");
    myHeaders.delete("X-Requested-With");
    myHeaders.append("Authorization",
      "Basic " + btoa(webAppConfig.api.username + ":" + webAppConfig.api.password));
    var myInit = {
      method: 'GET',
      headers: myHeaders
    };
    fetch(webAppConfig.api.url + '/currentKeg', myInit)
      .then(function (res) {
        if (res.ok) {
          res = res.json();
        } else {
          var error = new Error(res.statusText);
          error.res = res;
          throw error;
        }
        return res;
      }).then(res => {
        const kegs = res;
        const kegsError = false;
        var prevKegs = this.state.kegs;
        this.setState({ kegs,kegsError});
      }).catch(error => {
        const kegsError = true;
        this.setState({ kegsError });
        console.log("Error: ");
        console.log(error);
      });

    fetch(webAppConfig.api.url + '/activity?count=' + numberOfElems, myInit)
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw Error(response.statusText);
        }
      }).then(res => {
        if (res.length > 0) {
          const activity = res;
          const activityError = false;
          var prevActivity = this.state.activity;
          this.setState({ activity ,activityError });
        }
      }).catch(error => {
        const activityError = true;
        this.setState({ activityError });
        console.log("Error: ");
        console.log(error);
      });
  }

  render() {
    return (
      <div>
        <Row>
          <Col sm={12} md={7}>
            {this.state.kegs.length > 0 ? (
              <KegStatus kegs={this.state.kegs} />
            ) : this.state.kegsError ? (
              <ErrorMessage />
            ) : (
                <LoadingMessage />
              )}
          </Col>
          <Col sm={12} md={5}>
            {this.state.activity.length > 0 ? (
              <BeerActivity activity={this.state.activity} />
            ) : this.state.activityError ? (
              <ErrorMessage />
            ) : (
                  <LoadingMessage />
                )}
          </Col>
        </Row>
      </div>
    );
  }
}

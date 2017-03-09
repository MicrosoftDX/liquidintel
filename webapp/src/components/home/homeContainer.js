import React from 'react';
import KegStatus from './kegStatus';
import BeerActivity from './beerActivity';
import ErrorMessage from './errorMessage';
import {webAppConfig} from '../../config/default.js';


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
    this._timer = setInterval(() => this.poll(), 5000);

  }
  componentWillUnmount() {
    const kegs =[];
    const activity = [];
    this.setState({kegs,activity});
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
  }

  poll(){
    var numberOfElems = 25;
    var myHeaders = new Headers();
    myHeaders.append("Accept", "application/json");
    myHeaders.append("Cache-Control", "no-cache");
    myHeaders.delete("X-Requested-With");
    myHeaders.append("Authorization", 
    "Basic " + btoa(webAppConfig.api.username+ ":" + webAppConfig.api.password ));
    
    var myInit = { method: 'GET',
                headers: myHeaders};

    fetch(webAppConfig.api.url + '/currentKeg',myInit)
    .then(function(response) { 
        return response.json();
    }).then(res => {
      if (res.length > 0){
        const kegs = res;
        var prevKegs = this.state.kegs;
        if(prevKegs.toString() != kegs.toString()){
          console.log("Kegs have changed - Updating kegs")
          this.setState({ kegs });
        }
      }
      });

    fetch(webAppConfig.api.url + '/activity?count=' + numberOfElems,myInit)
    .then(function(response) { 
        return response.json();
    }).then(res => {
      if (res.length > 0){
        const activity = res;
        var prevActivity = this.state.activity;
        if(prevActivity.toString() != activity.toString()){
          console.log("Activity have changed - Updating Activity")
          this.setState({ activity });
        }
      }
      }); 
  }

 render() {
    return (
      <div>
        <Row>
          <Col sm={12} md={7}>
            {this.state.kegs.length > 0 ? (
              <KegStatus kegs={this.state.kegs}/>
            ) : (
              <ErrorMessage />
            )}
          </Col>
          <Col sm={12} md={5}>
            {this.state.activity.length > 0 ? (
              <BeerActivity activity={this.state.activity} />
            ) : (
              <ErrorMessage />
            )}
          </Col>
        </Row>
      </div>
    );
  }
}

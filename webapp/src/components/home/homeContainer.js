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
    //Get Keg status
    var myHeaders = new Headers();
    var actAmount = 15;
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
        console.log("kegs dice: ");
        console.log(kegs);
        this.setState({ kegs });
      }
      });

    fetch(webAppConfig.api.url + '/activity?count=20',myInit)
    .then(function(response) { 
        return response.json();
    }).then(res => {
      if (res.length > 0){
        const activity = res;
        console.log("Activity says: ");
        console.log(activity);
        this.setState({ activity });
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

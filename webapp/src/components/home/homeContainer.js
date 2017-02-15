import React from 'react';
import KegStatus from './kegStatus';
import BeerActivity from './beerActivity';
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
      kegRefills: [],
      timeline: []
    };
  }

  componentDidMount() {
    var apiUrl = webAppConfig.api.url;
    //Get Keg status
    var myHeaders = new Headers();
    myHeaders.append("Acept", "application/json");
    myHeaders.append("Cache-Control", "no-cache");
    myHeaders.delete("X-Requested-With");
    myHeaders.append("Authorization", 
    btoa(webAppConfig.api.username+":" +webAppConfig.api.password ));
    
    var myInit = { method: 'GET',
                headers: myHeaders};

    fetch(apiUrl + '/currentKeg',myInit)
    .then(function(response) { 
        return response.json();
    }).then(res => {
      if (res.length > 0){
        const kegRefills = res;
        console.log("KegRefills dice: ");
        console.log(kegRefills);
        this.setState({ kegRefills });
      }
      });

    fetch(apiUrl+'/users',myInit)
    .then(function(response) { 
        return response.json();
    }).then(res => {
      if (res.length > 0){
        const timeline = res;
        console.log("pouredBeer dice: ");
        console.log(timeline);
        this.setState({ timeline });
      }
      }); 

  }

  render() {
    return (
      <div>
        <Row>
          <Col sm={12} md={7}>
            <KegStatus data={this.state.kegRefills}/>
          </Col>
          <Col sm={12} md={5}>
            <BeerActivity data={this.state.timeline} />
          </Col>
        </Row>
      </div>
    );
  }
}

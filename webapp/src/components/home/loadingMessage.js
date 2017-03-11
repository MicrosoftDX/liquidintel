import React from 'react';
import classNames from 'classnames';
import { withRouter } from 'react-router';

import {
    //Common
    Grid,
    Row,
    Col,
    Panel,
    PanelBody,
    PanelHeader,
    PanelContainer,
    //format for the elements
    Badge,
     LoremIpsum,
} from '@sketchpixy/rubix';


export default class ErrorMessage extends React.Component{
    constructor(props){
        super(props);
    }
    render(){
        return(
            <PanelContainer>
                <PanelHeader className='bg-purple fg-white'>
                    <Grid>
                        <Row>
                            <Col xs={12}>
                                <h3>Retrieving info...</h3>
                            </Col>
                        </Row>
                    </Grid>
                </PanelHeader>
                <PanelBody className='panel-sm-12 panel-xs-12' style={{ paddingTop: 0}}>
                    <Grid>
                        <Row>
                            <Col  xs={12}>
                                <h3>Beer in progress</h3>
                                <p>Fermenting the malted barley... </p>
                            </Col>
                        </Row>
                    </Grid>
                </PanelBody>
            </PanelContainer>
        );
    }
}
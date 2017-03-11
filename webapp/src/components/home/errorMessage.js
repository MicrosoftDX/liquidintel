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
    Badge
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
                                <h3>Error retrieving info...</h3>
                            </Col>
                        </Row>
                    </Grid>
                </PanelHeader>
                <PanelBody className='panel-sm-12 panel-xs-12' style={{ paddingTop: 0}}>
                    <Grid>
                        <Row>
                            <Col  xs={12}>
                                <h3>Connection error</h3>
                                <p>Somehow we couldn't retrieve information for this component, please verify the service is up and running</p>
                            </Col>
                        </Row>
                    </Grid>
                </PanelBody>
            </PanelContainer>
        );
    }
}
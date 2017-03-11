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
    FormControl,
    PanelContainer,
    Media,
    Label,
    //format for the elements
    Badge,
    LoremIpsum,
} from '@sketchpixy/rubix';
export default class BeerActivity extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: []
        };
    }
    render() {
        return (
            <PanelContainer>
                <PanelHeader className='bg-purple fg-white'>
                    <Grid>
                        <Row>
                            <Col xs={12}>
                                <h3>Latest beer activity...</h3>
                            </Col>
                        </Row>
                    </Grid>
                </PanelHeader>
                <PanelBody className='panel-sm-12 panel-xs-12' style={{ paddingTop: 0, maxHeight: '75vh', overflowY: 'auto' }}>
                    <Grid>
                        {this.props.activity.map(function (elem, index) {
                            var relDate = moment(elem.PourTime).fromNow();
                            var badgeColor = elem.BeerType.toLowerCase().includes("red") ? "bg-red" : elem.BeerType.toLowerCase().includes("ipa") ? "bg-blue" : "bg-purple";

                            return <Media key={index} itemID={elem.SessionId}><Media.Left><img className="border-purple" style={{ paddingTop: 0 }} height={70} width={70} src={elem.BeerImagePath} alt={elem.BeerName} /></Media.Left><Media.Body><Media.Heading>{elem.FullName}</Media.Heading><span className="fg-darkgrayishblue75">poured <strong>{elem.PourAmount} ml</strong> of <strong>{elem.BeerName}  </strong></span><small><Badge className={badgeColor} style={{ marginRight: 5, display: 'inline' }}>{elem.BeerType}</Badge></small><br /><small className='fg-darkgray40'>{relDate}</small></Media.Body></Media>;
                        })}
                    </Grid>
                </PanelBody>
            </PanelContainer>
        );
    }
}
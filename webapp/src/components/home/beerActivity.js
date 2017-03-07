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
    //format for the elements
    Badge,
     LoremIpsum,
} from '@sketchpixy/rubix';

@withRouter
class ActivityItem extends React.Component {
  handleClick(e) {
    e.preventDefault();
    e.stopPropagation();

    this.props.router.push('/ltr/mailbox/mail');
  }
  render() {
    var classes = classNames({
      'inbox-item': true,
      'unread': this.props.unread
    });

    var linkProps = {
      href: '/ltr/mailbox/mail',
      onClick: ::this.handleClick,
      className: classes,
    };

    return (
      <a {...linkProps}>
      <Row sm="12">
        <div className='inbox-avatar'>
            <Col sm={2} xs={3}>
                <img src={this.props.src} width='48' className={this.props.imgClass} />
            </Col>
            <Col sm={10} xs={9}>
                <div className='text-left'>
                    <div className='fg-darkgrayishblue75'>{this.props.name} {this.props.description}</div>
                    <div><small><span><Badge className={this.props.labelClass} style={{marginRight: 5, display: this.props.labelValue ? 'inline':'none'}}>{this.props.labelValue}</Badge> </span></small><span className='fg-darkgray40'>{this.props.date}</span></div>
                </div>
            </Col>

        </div>
        </Row>
        <Row>
            <hr align="center"/>
        </Row>
      </a>
    );
  }
}

export default class BeerActivity extends React.Component{
    constructor(props){
        super(props);
        this.state ={
            history :[]
        };
    }
    render(){
        return(
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
                <PanelBody className='panel-sm-12 panel-xs-12' style={{ paddingTop: 0 }}>
                    <Grid>
                        <Row>
                            <Col xs={12}>
                            {this.props.activity.map(function(elem,index) {
                            var relDate = moment(elem.PourTime).fromNow();
                            return <ActivityItem key={index} itemId={elem.SessionId} unread src={elem.BeerImagePath} imgClass='border-green' name={elem.FullName} labelValue={elem.BeerType} labelClass='bg-green fg-white' description={<span> poured <strong>{elem.PourAmount} ml</strong> of <strong><span>{elem.BeerName}</span></strong></span>} date={relDate}/>;
                            })}
                            </Col>
                        </Row>
                    </Grid>
                </PanelBody>
            </PanelContainer>
        );
    }
}
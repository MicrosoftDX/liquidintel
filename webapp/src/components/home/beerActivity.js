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
      <Row>
        <div className='inbox-avatar'>
            <Col sm={1}>
                <img src={this.props.src} width='40' height='40' className={this.props.imgClass + ' hidden-xs'} />
            </Col>
            <Col sm={7}>
                    <div className='fg-darkgrayishblue75'>{this.props.name}</div>
                    <div><small><Badge className={this.props.labelClass} style={{marginRight: 5, display: this.props.labelValue ? 'inline':'none'}}>{this.props.labelValue}</Badge><span>{this.props.description}</span></small></div>
            </Col>
            <Col sm={4}>
                <div className='inbox-date hidden-sm hidden-xs fg-darkgray40 text-right'>
                    <div style={{position: 'relative', top: 5}}>{this.props.date}</div>
                    <div style={{position: 'relative', top: -5}}><small>#{this.props.itemId}</small></div>
                </div>
            </Col>
        </div>
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
                            {this.props.data.map(data => {
                            var minutes = Math.round(Math.random()*10) + 1;
                            minutes = minutes + ' mins ago'
                            return <ActivityItem itemId={data.badge} unread src={data.photo} imgClass='border-green' name={data.name} labelValue='IPA LOVER' labelClass='bg-green fg-white' description={<span><strong>Enjoying: </strong><span><LoremIpsum query='1s'/></span></span>} date={minutes}/>;
                            })}
                            </Col><hr />
                        </Row>
                    </Grid>
                </PanelBody>
            </PanelContainer>
        );
    }
}
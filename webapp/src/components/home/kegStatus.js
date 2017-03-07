import React from 'react';

import {
    Row,
    Col,
    Grid,
    Panel,
    Label,
    PanelBody,
    PanelHeader,
    FormControl,
    PanelContainer,
} from '@sketchpixy/rubix';

export default class KegStatus extends React.Component {
    constructor(props) {
        super(props);
    }
    drawKnobs() {
        $('.dial').knob();
        $('.knob').knob({
            draw: function () {
                // 'tron' case
                if (this.$.data('skin') == 'tron') {
                    var a = this.angle(this.cv)  // Angle
                        , sa = this.startAngle          // Previous start angle
                        , sat = this.startAngle         // Start angle
                        , ea                            // Previous end angle
                        , eat = sat + a                 // End angle
                        , r = true;

                    this.g.lineWidth = this.lineWidth;

                    this.o.cursor
                        && (sat = eat - 0.3)
                        && (eat = eat + 0.3);

                    if (this.o.displayPrevious) {
                        ea = this.startAngle + this.angle(this.value);
                        this.o.cursor
                            && (sa = ea - 0.3)
                            && (ea = ea + 0.3);
                        this.g.beginPath();
                        this.g.strokeStyle = this.previousColor;
                        this.g.arc(this.xy, this.xy, this.radius - this.lineWidth, sa, ea, false);
                        this.g.stroke();
                    }

                    this.g.beginPath();
                    this.g.strokeStyle = r ? this.o.fgColor : this.fgColor;
                    this.g.arc(this.xy, this.xy, this.radius - this.lineWidth, sat, eat, false);
                    this.g.stroke();

                    this.g.lineWidth = 2;
                    this.g.beginPath();
                    this.g.strokeStyle = this.o.fgColor;
                    this.g.arc(this.xy, this.xy, this.radius - this.lineWidth + 1 + this.lineWidth * 2 / 3, 0, 2 * Math.PI, false);
                    this.g.stroke();

                    return false;
                }
            }
        });
    }
    componentDidMount() {
        this.drawKnobs();
    }
    render() {
        console.log("this.props.kegs says: ");
        console.log(this.props.kegs);
         var keg = {
            "Name":"No name provided",
            "Level":1,
            "imagePath":"https://camo.githubusercontent.com/edfa223e201418f8f519ea0c048c96da76dd952a/68747470733a2f2f7261772e6769746875622e636f6d2f766f6f646f6f74696b69676f642f6c6f676f2e6a732f6d61737465722f626565726a732f626565726a732e706e67",
            "BeerDescription":"No description available",
            "Brewery":"NA",
            "BeerType":"NA",
            "ABV":"ABV NA",
            "IBU":"IBU NA",
            "InstallDate":"2017-01-18T23:30:00.000Z"

        }
        var kegs = [keg,Object.assign({}, keg)];

        console.log("Kegs default has: ")
        console.log(kegs);
        this.props.kegs.forEach(function(elem,index){
            console.log("Going for round " + index);
            console.log("elem says: ");
            console.log(elem);
            console.log("TapId is:" + elem.TapId);
            console.log("And keg[elem.TapId -1] is: ");
            console.log(elem.TapId - 1);
            if(elem.length === 0 && elem.constructor === Object){
                return;
            }
            if(elem.Name.length > 0){
                kegs[elem.TapId - 1].Name = elem.Name;
            }
            if(elem.CurrentVolume >0 && elem.KegSize > 0){
                kegs[elem.TapId - 1].Level = Math.round(elem.CurrentVolume / elem.KegSize * 100);
            }
            if(elem.imagePath.length > 0){
                kegs[elem.TapId - 1].imagePath = elem.imagePath;
            }
            if(elem.BeerDescription.length > 0){
                kegs[elem.TapId - 1].BeerDescription = elem.BeerDescription;
            }
            if(elem.Brewery.length > 0){
                kegs[elem.TapId - 1].Brewery = elem.Brewery;
            }
            if(elem.BeerType.length > 0){
                kegs[elem.TapId - 1].BeerType = elem.BeerType;
            }
            if(elem.ABV && elem.ABV != "NA"){
                kegs[elem.TapId - 1].ABV = elem.ABV + "% ABV";
            }
            if(elem.IBU && elem.IBU != "NA"){
                kegs[elem.TapId - 1].IBU = elem.IBU +  " IBU";
            }
            if(elem.InstallDate.length > 0){
                kegs[elem.TapId - 1].InstallDate = moment(elem.InstallDate).fromNow;
            }
        });
        console.log("Changing the keg array says: ");
        console.log(kegs);

        return (
            <PanelContainer>
                <PanelHeader className='bg-purple fg-white'>
                    <Grid>
                        <Row>
                            <Col xs={12}>
                                <h3>Keg Status</h3>
                            </Col>
                        </Row>
                    </Grid>
                </PanelHeader>
                <PanelBody>
                    <Grid>
                        <br />
                        <Row>
                            {kegs.map(function(elem,index,ar){
                                var color = elem.Level > 25? (elem.level > 75 ? "#4DBD33" :  '#FFA500') : '#ffcccc';
                                return (
                                    <Col xs={6} className='text-center'>
                                        <input key={index} type='text' defaultValue={elem.Level} className='dial autosize' data-width='100%' data-fgcolor={color} readOnly='readOnly' />
                                    </Col>
                                    );
                            })}
                        </Row>
                        <Row>
                            {kegs.map(function(elem,index,ar){
                                return (
                                    <Col xs={6} className='text-center'>
                                        <img key={index} src={elem.imagePath} height="100"/>
                                    </Col>
                                    );
                            })}
                        </Row>
                        <Row>
                            {kegs.map(function(elem,index,ar){
                                return (
                                    <Col xs={6} className='text-center'>
                                        <h1>{elem.Name}</h1>
                                    </Col>
                                    );
                            })}
                        </Row>
                        <Row>
                            {kegs.map(function(elem,index,ar){
                                return (
                                    <Col xs={6} className='text-center'>
                                        <h3 key={index}>{elem.Brewery}</h3>
                                    </Col>
                                    );
                            })}
                        </Row>
                        <Row>
                            {kegs.map(function(elem,index,ar){
                                return (
                                    <Col xs={6} className='text-center'>
                                        <p key={index}>{elem.BeerType}</p>
                                    </Col>
                                    );
                            })}
                        </Row>
                        <Row>
                            {kegs.map(function(elem,index,ar){
                                return (
                            <Col xs={6} className='text-center'>
                                <p><Label key={index} className='bg-darkgreen45 fg-white'>{elem.ABV}</Label> <Label className='bg-blue fg-white'>{elem.IBU}</Label></p>
                            </Col>
                                    );
                            })}
                        </Row>
                        <br />
                    </Grid>
                </PanelBody>
            </PanelContainer>
        );
    }
}

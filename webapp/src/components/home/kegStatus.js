import React from 'react';

import {
    Row,
    Col,
    Grid,
    Panel,
    Label,
    Badge,
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
        console.log("Drawing knobs");
        $('.dial').knob({
            draw: function () {
                var color = (this.v >= 25) ? ((this.v >= 75) ? '#4DBD33' : '#FFA500') : '#ffcccc';
                this.o.fgColor = color;
                this.o.inputColor = color;
            },
            'change': function (v) {
                var color = (v >= 25) ? ((v >= 75) ? '#4DBD33' : '#FFA500') : '#ffcccc';
                this.o.fgColor = color;
                this.o.inputColor = color;
            }
        });
    }
    componentDidMount() {
        this.drawKnobs();
    }
    componentDidUpdate(prevProps, prevState) {
        for (var i = 0; i < 2; i++) {
            if (this.props.kegs[i].CurrentVolume != prevProps.kegs[i].CurrentVolume) {
                var newVol = this.props.kegs[i].KegSize > 0 ? this.props.kegs[i].CurrentVolume / this.props.kegs[i].KegSize * 100 : 0;
                var selec = ".dial.knob-" + this.props.kegs[i].TapId;
                $(selec)
                    .val(newVol)
                    .trigger('change');
            }
        }
    }
    render() {
        var keg = {
            "Name": "No name provided",
            "Level": 1,
            "imagePath": "/imgs/app/avatars/beer.png",
            "BeerDescription": "No description available",
            "Brewery": "NA",
            "BeerType": "NA",
            "ABV": "ABV NA",
            "IBU": "IBU NA",
            "InstallDate": "2017-01-18T23:30:00.000Z",
            "TapId": "1"

        }


        var kegs = [keg, Object.assign({}, keg)];
        this.props.kegs.forEach(function (elem, index) {
            kegs[elem.TapId - 1].TapId = elem.TapId;
            if (elem.length === 0 && elem.constructor === Object) {
                return;
            }
            if (elem.Name != null && elem.Name.length > 0) {
                kegs[elem.TapId - 1].Name = elem.Name;
            }
            if (elem.CurrentVolume > 0 && elem.KegSize > 0) {
                kegs[elem.TapId - 1].Level = Math.round(elem.CurrentVolume / elem.KegSize * 100);
            }
            if (elem.imagePath != null && elem.imagePath.length > 0) {
                kegs[elem.TapId - 1].imagePath = elem.imagePath;
            }
            if (elem.BeerDescription != null && elem.BeerDescription.length > 0) {
                kegs[elem.TapId - 1].BeerDescription = elem.BeerDescription;
            }
            if (elem.Brewery != null && elem.Brewery.length > 0) {
                kegs[elem.TapId - 1].Brewery = elem.Brewery;
            }
            if (elem.BeerType != null && elem.BeerType.length > 0) {
                kegs[elem.TapId - 1].BeerType = elem.BeerType;
            }
            if (elem.ABV && elem.ABV != "NA") {
                kegs[elem.TapId - 1].ABV = elem.ABV + "% ABV";
            }
            if (elem.IBU && elem.IBU != "NA") {
                kegs[elem.TapId - 1].IBU = elem.IBU + " IBU";
            }
            if (elem.InstallDate != null && elem.InstallDate.length > 0) {
                kegs[elem.TapId - 1].InstallDate = moment(elem.InstallDate).fromNow;
            }
        });
        return (
            <PanelContainer>
                <PanelHeader className='bg-blue fg-white'>
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
                            {kegs.map(function (elem, index, ar) {
                                return (
                                    <Col key={"col-1-" + index} xs={6} className='text-center'>
                                        <img key={index} src={elem.imagePath} height="100" />
                                    </Col>
                                );
                            })}
                        </Row>
                        <Row>
                            {kegs.map(function (elem, index, ar) {
                                return (
                                    <Col key={"col-2-" + index} xs={6} className='text-center fg-darkgrayishblue75'>
                                        <h2>{elem.Name}</h2>
                                    </Col>
                                );
                            })}
                        </Row>
                        <Row>
                            {kegs.map(function (elem, index, ar) {
                                return (
                                    <Col key={"col-3-" + index} xs={6} className='text-center'>
                                        <h4 key={index}>{elem.Brewery}</h4>
                                    </Col>
                                );
                            })}
                        </Row>
                        <Row className="hidden-xs">
                            {kegs.map(function (elem, index, ar) {
                                var level = elem.Level;
                                return (
                                    <Col key={"col-4a-" + index} xs={6} className='text-center'>
                                        <input key={index} type='text' value={level + "%"} className={"dial autosize knob-" + elem.TapId} data-width='100%' data-fcolor="" readOnly='readOnly' />
                                    </Col>
                                );
                            })}
                        </Row>
                        <Row className="visible-xs">
                            {kegs.map(function (elem, index, ar) {
                                var level = elem.Level;
                                var badgeColor = (level >= 25) ? ((level >= 75) ? "bg-green" : "bg-orange") : "bg-red";
                                return (
                                    <Col key={"col-4b-" + index} xs={6} className='text-center'>
                                        <Label key={index + "b"} className={badgeColor}>{level}% full</Label>
                                    </Col>
                                );
                            })}
                        </Row>
                        <Row>
                            {kegs.map(function (elem, index, ar) {
                                var badgeColor = elem.BeerType.toLowerCase().includes("red") ? "bg-red" : elem.BeerType.toLowerCase().includes("ipa") ? "bg-blue" : "bg-purple";
                                return (
                                    <Col key={"col-5a-" + index} xs={6} className='text-center'>
                                        <Badge key={index + "a"} className={badgeColor + " hidden-xs"} style={{ marginRight: 5, display: 'inline' }}>{elem.BeerType}</Badge>
                                        <p key={index + "b"} className="visible-xs">{elem.BeerType}</p>

                                    </Col>
                                );
                            })}
                        </Row>

                        <Row>
                            {kegs.map(function (elem, index, ar) {
                                return (
                                    <Col key={"col-6-" + index} xs={6} className='text-center'>
                                        <p><Label key={index} className='bg-orange75 fg-white'>{elem.ABV}</Label> <Label className='bg-yellow fg-white'>{elem.IBU}</Label></p>
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

import React from "react";
import {Col, Grid, Row} from "react-flexbox-grid";
import CodeHighlighter from "./highlighter";
import CodePlayback from "./codePlayback";
import CodePlot from "./historyPlot_new";

import codes from "../data/diff_book.csv";
import finalCode from '../data/code_book.txt'
import image from '../data/image.jpeg';
import copy_codes from "../copy_data/diff_book.csv";
import copyFinalCode from '../copy_data/code_book.txt';
import copyImage from '../copy_data/img.png';
import grid_point from '../data/grid_point.json';
import copy_grid_point from '../data/copy_grid_point.json';

class CodeViz extends React.Component{
    constructor(props) {
        super(props);
        console.log("Called constructor....")
        this.state = {
            'user': null,
            'code': '',
            'startIndex': 0,
            'chars': 0,
            'highlight': true,
            'code_blocks': [],
            'playBackIndex': 0,
            'endPlayBackIndex': 0,
            'events': 0,
            'image': null,
            'grid_points': [],
            'loaded': false
        }

        this.changeHighlighterRange = this.changeHighlighterRange.bind(this);
        this.changePlaybackRange = this.changePlaybackRange.bind(this);
        this.loadLegitimate = this.loadLegitimate.bind(this);
        this.loadCopy = this.loadCopy.bind(this);
        this.changeDropDown = this.changeDropDown.bind(this);
        this.changeSelectionRange = this.changeSelectionRange.bind(this);
    }

    loadLegitimate(){
        fetch(codes)
            .then(r => r.text())
            .then(text => {
                console.log("Called didmount....")
                // this.state.code_blocks = JSON.parse(text);
                this.setState({
                    'code_blocks': JSON.parse(text),
                    'playBackIndex': 0,
                    'endPlayBackIndex': 0,
                    'code': '',
                    'image': image
                    // 'num_events': code_blocks.length
                });

                fetch(finalCode)
                    .then(r => r.text())
                    .then(text => {
                        this.setState({
                            'code': text,
                            'image': image,
                            'grid_points': grid_point,
                            'loaded': true,
                            'user': '1'
                        })
                    });
                // console.log('text decoded:', text);
                // this.state.num_events = this.state.code_blocks.length;
            });
    }

    loadCopy(){
        fetch(copy_codes)
            .then(r => r.text())
            .then(text => {
                console.log("Called didmount....")
                // this.state.code_blocks = JSON.parse(text);
                this.setState({
                    'code_blocks': JSON.parse(text),
                    'playBackIndex': 0,
                    'endPlayBackIndex': 0,
                    'code': '',
                    'image': image,
                    // 'grid_points': copy_grid_point
                    // 'num_events': code_blocks.length
                });

                fetch(copyFinalCode)
                    .then(r => r.text())
                    .then(text => {
                        this.setState({
                            'code': text,
                            'image': copyImage,
                            'grid_points': copy_grid_point,
                            'user': '2'
                        })
                    });
                // console.log('text decoded:', text);
                // this.state.num_events = this.state.code_blocks.length;
            });
    }

    componentDidMount() {
        this.loadLegitimate();
    }

    changeDropDown(event){
        const student = event.target.value;
        if(student === 'copy'){
            this.loadCopy()
        } else {
            this.loadLegitimate()
        }
    }

    changeSelectionRange(points){
        console.log('Change selection range.... : ', points)
        this.setState({
            'startIndex': points.x1,
            'chars': points.x2 - points.x1,
            'playBackIndex': points.y1,
            'endPlayBackIndex': this.state.code_blocks.length > points.y2 ? points.y2 : this.state.code_blocks.length
        })
    }

    changeHighlighterRange(values){
        const initial = values[0];
        const final = values[1];
        this.setState({
            "startIndex": initial,
            "chars": final - initial
        });
    }

    changePlaybackRange(values){
        console.log("Playback changed....: ", values)
        const initial = values[0];
        const final = values[1];
        this.setState({
            "playBackIndex" : initial,
            "endPlayBackIndex": final,
            'resetPlayBack': false
        });
    }


    render() {
        return(
            <Grid fluid>
                <Row>
                    <Col xs={1} sm={1} md={1} lg={1} >
                    </Col>

                    <Col xs={11} sm={10} md={6} lg={6}>

                        <Row>

                            <div className={'card-body'} style={{
                                'width': '100%'

                            }}>
                                <div className={'code-block-header'} style={{
                                    'width': '100%'
                                }}>
                                    <center>
                                        <h4 style={{
                                            'float': 'left',
                                            'margin-left': '40%'
                                        }}>
                                            <label htmlFor="student">Choose a student: </label>
                                        </h4>

                                        <select name="student" id="cars" onChange={this.changeDropDown} style={{
                                            'float': 'left',
                                            'margin-top': '15px',
                                            'margin-left': '10px'
                                        }}>
                                            <option value="legitmate">Legitmate</option>
                                            <option value="copy">Mr. Copy</option>
                                        </select>
                                    </center>
                                </div>


                                <CodePlot
                                    key = {this.state.user}
                                    change_selection = {this.changeSelectionRange}
                                    data={this.state.grid_points}
                                    loaded={this.state.loaded}
                                />

                            </div>





                            {/*<img*/}
                            {/*    src={this.state.image} alt={'image'}*/}
                            {/*    style={{*/}
                            {/*        'width': '90%',*/}
                            {/*        'margin-bottom': '10px'*/}
                            {/*    }}*/}
                            {/*/>*/}
                            {/*<PlaybackSlider*/}
                            {/*    style={{*/}
                            {/*        'width': '10%'*/}
                            {/*    }}*/}
                            {/*    max_range = {this.state.code_blocks.length}*/}
                            {/*    on_slider_change = {this.changePlaybackRange}*/}
                            {/*/>*/}

                        </Row>
                        {/*<Row*/}
                        {/*    start={'lg'}*/}
                        {/*    style={{*/}
                        {/*        'margin-left': '12px'*/}
                        {/*    }}*/}
                        {/*>*/}
                        {/*    <DualSlider*/}
                        {/*        max_range={this.state.code.length}*/}
                        {/*        on_slider_change = {this.changeHighlighterRange}*/}
                        {/*    />*/}
                        {/*</Row>*/}



                    </Col>
                    <Col xs={12} sm={10} md={4} lg={4}>
                        <div>
                            <CodeHighlighter
                                // key={this.state.user+'-highlighter'}
                                {...this.state}
                            />
                            <CodePlayback
                                // key={this.state.user+'-playback'}
                                code_blocks = {this.state.code_blocks}
                                startIndex = {this.state.playBackIndex}
                                endIndex = {this.state.endPlayBackIndex}
                                resetPlayBack = {this.state.resetPlayBack}

                            />
                        </div>

                    </Col>

                    <Col xs={1} sm={1} md={1} lg={1} >
                    </Col>
                </Row>
                {/*<Row>*/}
                {/*    <CodePlot change_selection = {this.changeSelectionRange}/>*/}
                {/*</Row>*/}
            </Grid>
        )
    }
}

export default CodeViz;
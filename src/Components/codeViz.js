import React from "react";
import {Col, Grid, Row} from "react-flexbox-grid";
import CodeHighlighter from "./highlighter";
import CodePlayback from "./codePlayback";
import CodePlot from "./historyPlot_new";
import JSZip from "jszip";
const zlib = require('zlib');
// import '../data/';
// import codes from "../data/diff_book.csv";
// import finalCode from "../data/code_book.txt";


class CodeViz extends React.Component{
    constructor(props) {
        super(props);
        // console.log("Called constructor....")
        const x = window.innerHeight - 0.02*window.innerHeight;
        this.layout_dimension = {
            'code_div': {
                // 'height': 'auto'
                'height': window.innerHeight - 0.02*window.innerHeight
            },
            'code_mirror': {
                // 'height': '100%'
                'height': x*0.85
            }
        }
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
            'loaded': false,
            'playBackProgress': 0,
            'selection': null,
            'display': 'none',
            'match_blocks': [],
            'highLightOption':  null,
            'diff_line': null,
            'highLightDiffToggle': false
        }
        this.changeHighlighterRange = this.changeHighlighterRange.bind(this);
        this.changePlaybackRange = this.changePlaybackRange.bind(this);
        this.changeDropDown = this.changeDropDown.bind(this);
        this.changeSelectionRange = this.changeSelectionRange.bind(this);
        this.updatePlaybackProgress = this.updatePlaybackProgress.bind(this);
        this.loadFiles = this.loadFiles.bind(this);
        this.showLoading = this.showLoading.bind(this);
        this.resetPlayBack = this.resetPlayBack.bind(this);
        this.highLightDiff = this.highLightDiff.bind(this);
        this.updateHighLightDiff = this.updateHighLightDiff.bind(this);
    }

    getFileURL(folder, file){
        // return `http://localhost:5000/data/${folder}/${file}`;
        return `https://codeviz-app.herokuapp.com/data/${folder}/${file}`;
    }



    loadFiles(dir){


        const fetch_file = function (file_name, callback){
            console.log("Fetching...", file_name)
            fetch(_this.getFileURL(dir, file_name.split('.')[0] + ".zip"))
                .then(function (response) {                       // 2) filter on 200 OK
                    if (response.status === 200 || response.status === 0) {
                        return Promise.resolve(response.blob());
                    } else {
                        console.log("Server error... 500")
                        return "Error"
                    }
                })
                .then(JSZip.loadAsync)                            // 3) chain with the zip promise
                .then(function (zip) {
                    const text = zip.file(file_name).async("string"); // 4) chain with the text content promise
                    console.log("Fetched:   ", file_name)
                    return text
                })
                .then(callback)};

        const _this = this;

        const diffBookLoader = function () {
            fetch_file('diff_book.csv', (text)=> {
                _this.setState({
                    'code_blocks': JSON.parse(text),
                    'playBackIndex': 0,
                    'endPlayBackIndex': 0,
                });
            })}

        const _diffBookLoader = function (codes) {
            fetch(_this.getFileURL(dir, 'diff_book.csv'))
                // .then(r => zlib.gunzip(r, (err, dezipped) => dezipped.toString()))
                .then(r => r.text())
                .then(text => {
                    // console.log("Dezipped: ", zlib.gunzip(text, (err, dezipped) => dezipped))
                    _this.setState({
                        'code_blocks': JSON.parse(text),
                        'playBackIndex': 0,
                        'endPlayBackIndex': 0,
                    });
                });
        }

        const finalCodeLoader = function () {
            fetch_file('code_book.txt', (text)=> {
                _this.setState({
                    'code': text,
                });
            })}

        const _finalCodeLoader = function (finalCode){
            fetch(_this.getFileURL(dir, 'code_book.txt'))
                .then(r => r.text())
                .then(text => {
                    _this.setState({
                        'code': text,
                    })
                });
        }

        // const gridPointLoader = function (grid){
        //     fetch(_this.getFileURL(dir, 'grid_point.json'))
        //         .then(r => r.text())
        //         .then(text => {
        //             _this.setState({
        //                 'grid_points': JSON.parse(text),
        //                 'user': dir,
        //                 'loaded': true
        //             })
        //         });
        // }

        const gridPointLoader = function () {
            fetch_file('grid_point.json', (text)=> {
            _this.setState({
                'grid_points': JSON.parse(text),
                'user': dir,
                'loaded': true
            });
        })}


        const matchBlockLoader = function () {
            fetch_file('match_block.json', (text)=> {
                _this.setState({
                    'match_blocks': JSON.parse(text)
                })
            })}

        const _matchBlockLoader = function (){
            fetch(_this.getFileURL(dir, 'match_block.json'))
                .then(r => r.text())
                .then(text => {
                    _this.setState({
                        'match_blocks': JSON.parse(text)
                    })
                });
        }


        const diffLineLoader = function () {
            fetch_file('diff_line.json', (text)=> {
                _this.setState({
                    'diff_line': JSON.parse(text)
                })
            })}

        // const _diffLineLoader = function (){
        //     fetch(_this.getFileURL(dir, 'diff_line.json'))
        //         .then(r => r.text())
        //         .then(text => {
        //             _this.setState({
        //                 'diff_line': JSON.parse(text)
        //             })
        //         });
        // }
        this.setState({
            'loaded': false,
            'user': null,
            'diff_line': [],
            'match_blocks': [],
            'grid_points': [],
            'code': null,
            'code_blocks': [],
            'playBackIndex': 0,
            'endPlayBackIndex': 0

        }, ()=>{
            gridPointLoader(dir);
            finalCodeLoader(dir);
            diffBookLoader(dir);
            matchBlockLoader(dir);
            diffLineLoader(dir);
        });

    }

    componentDidMount() {
        this.loadFiles('LO1A2F01-U1-BM-task1');
    }

    resetPlayBack(value){
        this.setState({
            'resetPlayBack': value,
            'playBackProgress': 0
        })
    }

    changeDropDown(event){
        const student = event.target.value;
        console.log("Student: ", student)
        this.setState({
            'loaded': false
        }, this.loadFiles(student));

        // if(student === 'copy'){
        //     this.loadFiles('copy');
        // } else if (student === "coon-task"){
        //     this.loadFiles('coon-task1');
        // } else if (student === "coon-pattern"){
        //     this.loadFiles('coon-pattern');
        // } else if (student === "gordon") {
        //     this.loadFiles('gordon')
        // }
        // else {
        //     this.loadFiles('normal');
        // }
        this.resetPlayBack(true);
    }

    changeSelectionRange(points){
        // console.log('Change selection range.... : ', points)
        this.setState({
            'startIndex': points.x1,
            'chars': points.x2 - points.x1,
            'playBackIndex': points.y1,
            'endPlayBackIndex': this.state.code_blocks.length > points.y2 ? points.y2 : this.state.code_blocks.length,
            'selection': points
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
        // console.log("Playback changed....: ", values)
        const initial = values[0];
        const final = values[1];
        this.setState({
            "playBackIndex" : initial,
            "endPlayBackIndex": final
        });
    }

    updatePlaybackProgress(progress){
        this.setState({'playBackProgress': progress, 'highLightOption': null}, ()=>{
            if(this.state.highLightDiffToggle)
                this.updateHighLightDiff();
        });

    }

    async showLoading(flag){
        if(flag) {
            // console.log("Called show Loading...")
            this.setState({
                'display': 'none'
            })
        } else {
            // console.log("Called exit Loading...")
            this.setState({
                'display': 'auto'
            })
        }
    }

    updateHighLightDiff() {
        const match_block = this.state.match_blocks[this.state.playBackIndex + this.state.playBackProgress];
        this.setState({
            'highLightOption': {
                'final': match_block.final,
                'snapShot': match_block.snapShot
            }
        })
    }

    highLightDiff(){
        if(this.state.highLightOption === null) {
            this.updateHighLightDiff();
            this.setState({
                'highLightDiffToggle': true
            })
        } else {
            console.log("Clear highlightdiff")
            this.setState({
                'highLightOption': null,
                'highLightDiffToggle': false
            })
        }
    }

    render() {
        return(
            <Grid fluid>
                <Row style={{
                }}>
                    {/*<Col xs={1} sm={1} md={1} lg={1} >*/}
                    {/*</Col>*/}

                    <div
                        // xs={11} sm={10} md={12} lg={5} xl={4}
                        className={'viz-col'}

                    >
                        <Row>

                            <div className={'card-body'} style={{
                                'width': '100%',
                                'height': this.layout_dimension.code_div.height,
                                'background-color': 'white'

                            }}>
                                <div className={'code-block-header'} style={{
                                    'width': '100%'
                                }}>
                                    <center>
                                        <h4 style={{
                                            'float': 'left',
                                            'margin-left': '40%'
                                        }}>
                                            <label htmlFor="student">Submission: </label>
                                        </h4>

                                        <select name="student" onChange={this.changeDropDown} style={{
                                            'float': 'left',
                                            'margin-top': '20px',
                                            'margin-left': '10px',
                                            'margin-bottom': '27px',
                                            'width': '150px',
                                            // 'height': '20px',
                                            'text-align': 'center',
                                            'background-color': 'white',
                                            'border-radius': '5px'

                                        }}>
                                            <option value="LO1A2F01-U1-BM-task1">Student 1</option> {/*87750365*/}
                                            <option value="LO1A2F01-U1-BM-task2">Student 2</option> {/*46137255*/}
                                            <option value="LO1A2F01-U2-FP-demo">Student 3</option> {/*19667384*/}
                                            <option value="LO1A2F01-U2-FP-task4">Student 4</option> {/*36989533*/}
                                            <option value="LO1A2F01-U3-RA-task2">Student 5</option> {/*34618362*/}
                                            <option value="LO1A3F08-U4-FP-task3">Student 6</option> {/*91703258*/}
                                            <option value="LO1A3F08-U4-FP-task4">Student 7</option> {/*71542376*/}
                                            <option value="LO1A3F08-U5-WA-Task3">Student 8</option> {/*45941528*/}
                                            <option value="LO1A4F16-U6-BM-pattern">Student 9</option> {/*71585317*/}
                                            <option value="LO1A4F16-U7-RA-chessboard">Student 10</option> {/*97680523*/}
                                            <option value="LO1A7M08-TG-Unit7-main">Student 11</option> {/*65027619*/}


                                            {/*<option value="legitmate">Legitmate</option>*/}
                                            {/*<option value="copy">Mr. Copy</option>*/}
                                            {/*<option value="coon-pattern">Cooney Joseph Assgn: 8 (pattern.py)</option>*/}
                                            {/*<option value="coon-task">Cooney Joseph Assgn: 8 (task1.py)</option>*/}
                                            {/*<option value="gordon">Gordon</option>*/}

                                            {/*<option value="LO1A2F01-U1-task2">U1 (task2)</option>*/}
                                            {/*<option value="LO1A2F01-U1-task#2-2">U1 (task2.2)</option>*/}
                                            {/*<option value="LO1A2F01-U2-task4">U2 (task4)</option>*/}
                                            {/*<option value="LO1A2F01-U3-task2">U3 (task2)</option>*/}

                                        </select>
                                    </center>


                                </div>

                                {!this.state.loaded ? <img
                                    // id={'loading'} className={'loading'}
                                    src={process.env.PUBLIC_URL+ "/img/loading.gif"} width={window.innerWidth * 0.4} height={window.innerHeight * 0.6}/> :
                                    // <p></p> }
                                <CodePlot
                                    resetPlayBack = {this.resetPlayBack}
                                    showLoading = {this.showLoading}
                                    key = {this.state.user}
                                    change_selection = {this.changeSelectionRange}
                                    data={this.state.grid_points}
                                    loaded={this.state.loaded}
                                    playBackProgress = {this.state.playBackProgress}
                                    selection = {this.state.selection}
                                    highLightDiff = {this.highLightDiff}
                                    highLightOption = {this.state.highLightOption}
                                    highLightToggle = {this.state.highLightDiffToggle}
                                />
                                }


                                <ul
                                    // style={{this.state.loaded ? {
                                    //     "float": "left",
                                    //     "text-align": "left"
                                    // } :  }>
                                    className={'shortcut-div'}
                                    style={{
                                        "float": "left",
                                        "text-align": "left",
                                        "padding-top":"0px"
                                    }}>
                                    <p
                                        style={{
                                            'margin': '0px',
                                        }}
                                    ><b>Shortcuts:</b></p>
                                    <li>"s" -> Selection</li>
                                    <li>"z" -> Zoom</li>
                                    <li>"p" -> Pan</li>
                                    <li>"r" -> Reset View</li>
                                    <li>"c" -> Clear Selection</li>
                                    <li>"SpaceBar" -> Pause/Play Playback Window</li>
                                    <li>"["/"]" Left and Right Bracket to control playback</li>
                                </ul>

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



                    </div>
                    <div
                        // xs={12} sm={10} md={12} lg={3} xl={4}
                        className={'playBack-col'}

                        // style={{
                        //     'width': '27%',
                        //     'margin-left':'1%',
                        //     // 'margin-right':'1%'
                        // }}
                    >
                        <CodePlayback
                            // key={this.state.user+'-playback'}
                            startChar = {this.state.startIndex}
                            code_blocks = {this.state.code_blocks}
                            startIndex = {this.state.playBackIndex}
                            endIndex = {this.state.endPlayBackIndex}
                            resetPlayBack = {this.resetPlayBack}
                            resetPlayBackFlag = {this.state.resetPlayBack}
                            progressUpdate = {this.updatePlaybackProgress}
                            highLightOption = {this.state.highLightOption}
                            loaded={this.state.loaded}
                            updateHighLightDiff = {this.updateHighLightDiff}
                            diffLineNumber = {this.state.diff_line}
                            code = {this.state.code}
                            dimension = {this.layout_dimension}
                            finalCodeProps = {{
                                'highLightDiff' : this.highLightDiff,
                                'updateHighLightDiff' :this.updateHighLightDiff,
                                'highLightToggle' : this.state.highLightDiffToggle,
                                ...this.state
                            }}
                        />
                        <div style={{
                            'margin-top': '1%'
                        }}>
                            {/*<CodeHighlighter*/}
                            {/*    // key={this.state.user+'-highlighter'}*/}
                            {/*    {...this.state}*/}
                            {/*    highLightDiff = {this.highLightDiff}*/}
                            {/*    updateHighLightDiff = {this.updateHighLightDiff}*/}
                            {/*    highLightToggle = {this.state.highLightDiffToggle}*/}

                            {/*/>*/}
                        </div>

                    </div>
                    {/*<div*/}
                    {/*    className={'final-code-col'}*/}

                    {/*     // style={{*/}
                    {/*     //     'width': '27.5%',*/}
                    {/*     //     'margin-left': '0.5%',*/}
                    {/*     //     'margin-right': '0'*/}
                    {/*     // }}*/}
                    {/*>*/}
                    {/*    <div>*/}

                    {/*        <CodeHighlighter*/}
                    {/*            // key={this.state.user+'-highlighter'}*/}
                    {/*            {...this.state}*/}
                    {/*            highLightDiff = {this.highLightDiff}*/}
                    {/*            updateHighLightDiff = {this.updateHighLightDiff}*/}
                    {/*            highLightToggle = {this.state.highLightDiffToggle}*/}

                    {/*        />*/}

                    {/*    </div>*/}

                    {/*</div>*/}
                </Row>
                {/*<Row>*/}
                {/*    <CodePlot ch
     ange_selection = {this.changeSelectionRange}/>*/}
                {/*</Row>*/}
            </Grid>
        )
    }
}

export default CodeViz;
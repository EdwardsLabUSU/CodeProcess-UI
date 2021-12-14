import React from "react";
import {Col, Grid, Row} from "react-flexbox-grid";
import CodeHighlighter from "./highlighter";
import CodePlayback from "./codePlayback";
import CodePlot from "./historyPlot";
import JSZip from "jszip";
import axios from "axios";
import API_URL from "../config";

const zlib = require('zlib');

class CodeViz extends React.Component {
    constructor(props) {
        super(props);
        const x = window.innerHeight - 0.02 * window.innerHeight;
        this.layout_dimension = {
            'code_div': {
                'height': window.innerHeight - 0.02 * window.innerHeight
            },
            'code_mirror': {
                'height': x * 0.85
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
            'highLightOption': null,
            'diff_line': null,
            'highLightDiffToggle': false,
            'files': Object()
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

        this.listFiles = this.listFiles.bind(this);
    }

    getFileURL(file_id, file_type, file_name) {
        return API_URL + "/files/" + file_id + "?file_type=" + file_type + "&file_name=" + file_name;
    }

    listFiles() {
        axios.get(API_URL + '/files').then(res => {
            let count = 1;
            let res_objects = {};
            for (const each of res.data.data.rows) {
                res_objects[count] = each;
                count++;
            }
            this.setState({
                'files': res_objects
            }, () => count > 1 ? this.loadFiles(1) : null);
        });
    }


    loadFiles(submission) {
        const row = this.state.files[submission];
        console.log("Here inside.....");
        console.log(row, submission);
        console.log("Data row: ", row);
        if (row == undefined) {
            console.log("The object is undefined....")
            return;
        }

        const fetch_file = function (file_type, callback) {
            console.log("Fetching...", file_type)
            fetch(_this.getFileURL(row['id'], file_type, row['file_name']))
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
                    const text = zip.file(file_type).async("string"); // 4) chain with the text content promise
                    console.log("Fetched:   ", file_type)
                    return text
                })
                .then(callback)
        };

        const _this = this;

        const diffBookLoader = function () {
            fetch_file('diff_book.csv', (text) => {
                _this.setState({
                    'code_blocks': JSON.parse(text),
                    'playBackIndex': 0,
                    'endPlayBackIndex': 0,
                });
            })
        }


        const finalCodeLoader = function () {
            fetch_file('code_book.txt', (text) => {
                _this.setState({
                    'code': text,
                });
            })
        }

        const gridPointLoader = function () {
            fetch_file('grid_point.json', (text) => {
                _this.setState({
                    'grid_points': JSON.parse(text),
                    'user': row['file_id'],
                    'loaded': true
                });
            })
        }


        const matchBlockLoader = function () {
            fetch_file('match_block.json', (text) => {
                _this.setState({
                    'match_blocks': JSON.parse(text)
                })
            })
        }

        const diffLineLoader = function () {
            fetch_file('diff_line.json', (text) => {
                _this.setState({
                    'diff_line': JSON.parse(text)
                })
            })
        }

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

        }, () => {
            gridPointLoader();
            finalCodeLoader();
            diffBookLoader();
            matchBlockLoader();
            diffLineLoader();
        });

    }

    componentDidMount() {
        this.listFiles();
    }

    resetPlayBack(value) {
        this.setState({
            'resetPlayBack': value,
            'playBackProgress': 0
        })
    }

    changeDropDown(event) {
        const submission = event.target.value;
        this.setState({
            'loaded': false
        }, this.loadFiles(submission));
        this.resetPlayBack(true);
    }

    changeSelectionRange(points) {
        this.setState({
            'startIndex': points.x1,
            'chars': points.x2 - points.x1,
            'playBackIndex': points.y1,
            'endPlayBackIndex': this.state.code_blocks.length > points.y2 ? points.y2 : this.state.code_blocks.length,
            'selection': points
        })
    }

    changeHighlighterRange(values) {
        const initial = values[0];
        const final = values[1];
        this.setState({
            "startIndex": initial,
            "chars": final - initial
        });
    }

    changePlaybackRange(values) {
        const initial = values[0];
        const final = values[1];
        this.setState({
            "playBackIndex": initial,
            "endPlayBackIndex": final
        });
    }

    updatePlaybackProgress(progress) {
        this.setState({'playBackProgress': progress, 'highLightOption': null}, () => {
            if (this.state.highLightDiffToggle)
                this.updateHighLightDiff();
        });

    }

    async showLoading(flag) {
        if (flag) {
            this.setState({
                'display': 'none'
            })
        } else {
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

    highLightDiff() {
        if (this.state.highLightOption === null) {
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
        return (
            <Grid fluid>
                <Row style={{}}>
                    <div
                        className={'viz-col'}>
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
                                            'margin-left': '20%'
                                        }}>
                                            <label htmlFor="student">Submission: </label>
                                        </h4>

                                        <select name="student" onChange={this.changeDropDown} style={{
                                            'float': 'left',
                                            'margin-top': '20px',
                                            'margin-left': '10px',
                                            'margin-bottom': '27px',
                                            'width': '300px',
                                            // 'height': '20px',
                                            'text-align': 'center',
                                            'background-color': 'white',
                                            'border-radius': '5px'

                                        }}>

                                            {Object.entries(this.state.files).map(([key, each]) => {
                                                return (<option value={key}
                                                                key={key}>{each["uploaded_file_name"]}-{each["file_name"]}-({each["created_at"]})</option>);
                                            })}
                                            {/*<option value="LO1A2F01-U1-BM-task1">Student 1</option> /!*87750365*!/*/}
                                            {/*<option value="LO1A2F01-U1-BM-task2">Student 2</option> /!*46137255*!/*/}
                                            {/*<option value="LO1A2F01-U2-FP-demo">Student 3</option> /!*19667384*!/*/}
                                            {/*<option value="LO1A2F01-U2-FP-task4">Student 4</option> /!*36989533*!/*/}
                                            {/*<option value="LO1A2F01-U3-RA-task2">Student 5</option> /!*34618362*!/*/}
                                            {/*<option value="LO1A3F08-U4-FP-task3">Student 6</option> /!*91703258*!/*/}
                                            {/*<option value="LO1A3F08-U4-FP-task4">Student 7</option> /!*71542376*!/*/}
                                            {/*<option value="LO1A3F08-U5-WA-Task3">Student 8</option> /!*45941528*!/*/}
                                            {/*<option value="LO1A4F16-U6-BM-pattern">Student 9</option> /!*71585317*!/*/}
                                            {/*<option value="LO1A4F16-U7-RA-chessboard">Student 10</option> /!*97680523*!/*/}
                                            {/*<option value="LO1A7M08-TG-Unit7-main">Student 11</option> /!*65027619*!/*/}


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
                                        <a href={'/upload'} style={{
                                            'float': 'left',
                                            'margin-top': '20px',
                                            'margin-left': '10px',
                                            'margin-bottom': '27px',
                                            'width': '100px',
                                            'text-align': 'center',
                                            'background-color': 'white',
                                            'border-radius': '5px'
                                        }}><img src={'/img/upload.png'} height={'18px'}/> Upload</a>
                                    </center>


                                </div>

                                {!this.state.loaded ? <img
                                        // id={'loading'} className={'loading'}
                                        src={process.env.PUBLIC_URL + "/img/loading.gif"} width={window.innerWidth * 0.4}
                                        height={window.innerHeight * 0.6}/> :
                                    // <p></p> }
                                    <CodePlot
                                        resetPlayBack={this.resetPlayBack}
                                        showLoading={this.showLoading}
                                        key={this.state.user}
                                        change_selection={this.changeSelectionRange}
                                        data={this.state.grid_points}
                                        loaded={this.state.loaded}
                                        playBackProgress={this.state.playBackProgress}
                                        selection={this.state.selection}
                                        highLightDiff={this.highLightDiff}
                                        highLightOption={this.state.highLightOption}
                                        highLightToggle={this.state.highLightDiffToggle}
                                    />
                                }


                                <ul
                                    className={'shortcut-div'}
                                    style={{
                                        "float": "left",
                                        "text-align": "left",
                                        "padding-top": "0px"
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
                    </div>
                    <div
                        className={'playBack-col'} >
                        <CodePlayback
                            // key={this.state.user+'-playback'}
                            startChar={this.state.startIndex}
                            code_blocks={this.state.code_blocks}
                            startIndex={this.state.playBackIndex}
                            endIndex={this.state.endPlayBackIndex}
                            resetPlayBack={this.resetPlayBack}
                            resetPlayBackFlag={this.state.resetPlayBack}
                            progressUpdate={this.updatePlaybackProgress}
                            highLightOption={this.state.highLightOption}
                            loaded={this.state.loaded}
                            updateHighLightDiff={this.updateHighLightDiff}
                            diffLineNumber={this.state.diff_line}
                            code={this.state.code}
                            dimension={this.layout_dimension}
                            finalCodeProps={{
                                'highLightDiff': this.highLightDiff,
                                'updateHighLightDiff': this.updateHighLightDiff,
                                'highLightToggle': this.state.highLightDiffToggle,
                                ...this.state
                            }}
                        />
                        <div style={{
                            'margin-top': '1%'
                        }}>
                        </div>

                    </div>
                </Row>
            </Grid>
        )
    }
}

export default CodeViz;
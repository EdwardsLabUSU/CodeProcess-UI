import React from "react";
import {Col, Grid, Row} from "react-flexbox-grid";
import CodeHighlighter from "./highlighter";
import CodePlayback from "./codePlayback";
import CodePlot from "./historyPlot_new";
// import '../data/';
// import codes from "../data/diff_book.csv";
// import finalCode from "../data/code_book.txt";


class CodeViz extends React.Component{
    constructor(props) {
        super(props);
        // console.log("Called constructor....")
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
            'display': 'none'
        }
        this.changeHighlighterRange = this.changeHighlighterRange.bind(this);
        this.changePlaybackRange = this.changePlaybackRange.bind(this);
        this.changeDropDown = this.changeDropDown.bind(this);
        this.changeSelectionRange = this.changeSelectionRange.bind(this);
        this.updatePlaybackProgress = this.updatePlaybackProgress.bind(this);
        this.loadFiles = this.loadFiles.bind(this);
        this.showLoading = this.showLoading.bind(this);
        this.resetPlayBack = this.resetPlayBack.bind(this);
    }

    getFileURL(folder, file){
        return `https://codeviz-app.herokuapp.com/data/${folder}/${file}`;
    }

    loadFiles(dir){
        const _this = this;
        const diffBookLoader = function (codes) {
            fetch(_this.getFileURL(dir, 'diff_book.csv'))
                .then(r => r.text())
                .then(text => {
                    _this.setState({
                        'code_blocks': JSON.parse(text),
                        'playBackIndex': 0,
                        'endPlayBackIndex': 0,
                    });
                });
        }

        const finalCodeLoader = function (finalCode){
            fetch(_this.getFileURL(dir, 'code_book.txt'))
                .then(r => r.text())
                .then(text => {
                    _this.setState({
                        'code': text,
                    })
                });
        }

        const gridPointLoader = function (grid){
            fetch(_this.getFileURL(dir, 'grid_point.json'))
                .then(r => r.text())
                .then(text => {
                    _this.setState({
                        'grid_points': JSON.parse(text),
                        'loaded': true,
                        'user': dir
                    })
                });
        }

        finalCodeLoader(dir);
        diffBookLoader(dir);
        gridPointLoader(dir);
    }

    componentDidMount() {
        this.loadFiles('normal');
    }

    resetPlayBack(value){
        this.setState({
            'resetPlayBack': value
        })
    }

    changeDropDown(event){
        const student = event.target.value;
        if(student === 'copy'){
            this.loadFiles('copy');
        } else if (student === "coon-task"){
            this.loadFiles('coon-task1');
        } else if (student === "coon-pattern"){
            this.loadFiles('coon-pattern');
        } else if (student === "gordon") {
            this.loadFiles('gordon')
        }
        else {
            this.loadFiles('normal');
        }
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
        this.setState({'playBackProgress': progress});
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
                                            <option value="coon-pattern">Cooney Joseph Assgn: 8 (pattern.py)</option>
                                            <option value="coon-task">Cooney Joseph Assgn: 8 (task1.py)</option>
                                            <option value="gordon">Gordon</option>

                                        </select>
                                    </center>
                                </div>

                                {!this.state.loaded ? <img
                                    // id={'loading'} className={'loading'}
                                    src={process.env.PUBLIC_URL+ "/img/loading.gif"}/> :
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
                                />
                                }

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
                                startChar = {this.state.startIndex}
                                code_blocks = {this.state.code_blocks}
                                startIndex = {this.state.playBackIndex}
                                endIndex = {this.state.endPlayBackIndex}
                                resetPlayBack = {this.resetPlayBack}
                                resetPlayBackFlag = {this.state.resetPlayBack}
                                progressUpdate = {this.updatePlaybackProgress}

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
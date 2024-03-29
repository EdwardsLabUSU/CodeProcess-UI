import React from "react";
import Slider from '@material-ui/core/Slider';
import PlayCircleOutlineIcon from '@material-ui/icons/PlayCircleOutline';
import PauseIcon from '@material-ui/icons/Pause';
import {FastForward, FastRewind} from "@material-ui/icons";
import {Controlled as CodeMirror} from 'react-codemirror2';
import BaseIDE from "../lib/codeMirror";
import {Col, Row} from "react-flexbox-grid";
import CodeHighlighter from "./highlighter";

// import CodeMirror from "react-code"

class CodePlayback extends BaseIDE {
    constructor(props) {
        super(props);
        this.state = {
            'pause': true,
            'playback_code': 'This is playback...',
            'button_comp': 'Play Code',
            'button_label': 'Play Code',
            'progress': -1,
            'num_events': props.code_blocks.length,
            'delay': 300,
            'prevStart': 0,
            'prevEnd': 0,
            'currentIndex': props.startIndex,
            'scroll': true,
            // 'code': this.props.code.split('\n').map(()=> '\n').join('')
        }
        this.play_icon = <PlayCircleOutlineIcon/>
        this.editor = null;
        this.getLineNumber = this.getLineNumber.bind(this);
        this.scrollToLine = this.scrollToLine.bind(this);
        this.getCode = this.getCode.bind(this);
        this.playCode = this.playCode.bind(this);
        this.brushPositionChanged = this.brushPositionChanged.bind(this);
        this.currentPosition = this.currentPosition.bind(this);
        this.blockLength = this.blockLength.bind(this);
        this.arrowKeysHandler = this.arrowKeysHandler.bind(this);
        this.updateCode = this.updateCode.bind(this);
        this.progressUpdate = this.progressUpdate.bind(this);
        this.highlightDiff = this.highlightDiff.bind(this);
    }

    updateCode() {
        this.setState({
            'code': this.props.code_blocks[this.currentPosition()]
        })
    }

    arrowKeysHandler(event) {
        if (event.keyCode === 219) {
            const progress = Math.max(this.state.progress - 1, 0);
            this.setState({
                'progress': progress,
                'pause': true
            }, this.updateCode);
            this.progressUpdate(progress);
            // this.props.update{/*editor.markText({line:1,ch:1},{line:13,ch:1},{readOnly:false})*/}HighLightDiff();
        }
        // this.enableBrush(); // Left
        else if (event.keyCode === 221) // Right
        {
            const progress = Math.min(this.state.progress + 1, this.blockLength() - 1)
            this.setState({
                'progress': progress,
                'pause': true
            }, this.updateCode);
            this.progressUpdate(progress);
            // this.props.updateHighLightDiff();
        } else if (event.keyCode === 32) {
            this.setState({
                'pause': !this.state.pause
            }, this.getCode)
        }
    }

    componentDidMount() {
        document.addEventListener('keydown', this.arrowKeysHandler, false);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.arrowKeysHandler, false);
    }

    highlightDiff() {
        this.clearDiffMarkers();
        const option = this.props.highLightOption;
        option.snapShot.forEach((each) => {
            // this.highlightRange(this.editor, this.state.code, each[0],
            //     each[1]);
            this.highlightRange(this.editor, this.state.code, each);
        });
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.loaded === false && this.props.loaded) {
            this.setState({
                'code': this.props.code_blocks[this.props.startIndex]
            })
        }

        if (this.props.resetPlayBackFlag) {
            this.setState({
                'progress': -1,
                'code': this.props.code_blocks[this.props.startIndex]
            });
            this.props.resetPlayBack(false);
        }

        if (this.props.highLightOption !== null) {
            this.highlightDiff();
        } else {
            this.clearDiffMarkers();
        }
    }

    currentPosition() {
        return this.props.startIndex + Math.max(this.state.progress, 0)
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    brushPositionChanged() {
        return (this.props.startIndex !== this.state.prevStart
            || this.props.endIndex !== this.state.prevEnd
        )
    }

    blockLength() {
        return this.props.code_blocks.slice(this.props.startIndex, this.props.endIndex + 1).length;
    }

    getLineNumber(offset = 0) {
        if (this.props.diffLineNumber === null)
            return 0
        let current_pos = this.currentPosition();
        let lineNumber = this.props.diffLineNumber[current_pos + offset];
        lineNumber = Math.max(lineNumber - 1, 0);
        return lineNumber;
    }

    progressUpdate(progress) {
        this.props.progressUpdate(progress);
        if (progress !== -1) {
            let lineNumber = this.getLineNumber();
            if (this.state.scroll && lineNumber) {
                this.editor.focus();
                this.editor.refresh();
                this.editor.setCursor({line: lineNumber, ch: null});
                var rect = this.editor.getWrapperElement().getBoundingClientRect();
                this.editor.setSelection({
                        line: lineNumber + 1, ch: -1
                    },
                    {line: lineNumber, ch: -1}, {'scroll': true})
            }
        }
    }

    scrollToLine(lineNumber = this.getLineNumber()) {
        // this.editor.scrollTo({line: lineNumber, char:0}, 0);


        // var t = this.editor.charCoords({line: lineNumber, ch: 0}, "local").top;
        // var middleHeight = this.editor.getScrollerElement().offsetHeight / 2;
        // this.editor.scrollTo(null, t - middleHeight - 5);

        // let lineNumber = this.getCurrentLineNumber();
        // var t = this.editor.charCoords({line:  - 1, ch: 0}, "local").top;
        // var middleHeight = this.editor.getScrollerElement().offsetHeight / 2;
        // this.editor.scrollTo(null, t - middleHeight - 5);
    }

    async getCode() {
        const code_blocks = this.props.code_blocks.slice(this.currentPosition(), this.props.endIndex + 1);
        const block_length = this.blockLength()
        // console.log("Code blocks length: ", code_blocks.length, this.state.progress)
        for (const [i, _code] of code_blocks.entries()) {
            if (this.state.pause) {
                break;
            }
            // If user changes the brush area while playing re-start the code.
            else if (this.brushPositionChanged()) {
                this.scrollToLine(this.getLineNumber(1));
                this.setState({
                    'progress': -1
                }, this.playCode);
                this.progressUpdate(-1);
                break;
            } else {
                const progress = Math.min(this.state.progress + 1, block_length - 1);
                // this.progressUpdate(progress);
                this.scrollToLine(this.getLineNumber(1));
                this.setState({
                    'code': _code,
                    'progress': progress,
                    'blockLength': block_length
                    // });
                }, () => this.progressUpdate(progress));
            }
            await this.sleep(this.state.delay);
        }
        this.setState({
            'pause': true
        });
    }

    playCode() {
        // this.togglePlay();
        if (this.state.pause) {
            // console.log('Stoppped ...... ', this.state.progress)
            this.setState({
                'button_label': 'Stop Playback',
                'pause': false,
                'prevStart': this.props.startIndex,
                'prevEnd': this.props.endIndex,

            }, this.getCode);
        } else {
            this.setState({
                'button_label': 'Play Code',
                'pause': 'true',
                'code': this.props.code_blocks[this.currentPosition()]
            });
        }

    }

    render() {
        const code_div_dim = this.props.dimension.code_div;
        const code_mirror_dim = this.props.dimension.code_mirror;
        // TODO: Fix playback progress bug when changed index.
        return (
            <div className={'card-body'} style={{
                'height': code_div_dim.height,
            }}>
                <div className={'code-block-header'}
                     style={{
                         'height': code_div_dim.height * 0.08,
                         // 'height': '10%',
                         'padding-bottom': '0%'
                     }}>
                    <div style={{
                        'float': 'left',
                        'margin-left': '1%',
                        'width': '20%',
                        // 'border': '1px solid white',
                        // 'margin-bottom': '2%'
                    }}>
                        <h4 style={{
                            'margin-top': '25px',
                            'margin-bottom': '5px'
                        }}
                        >Code Playback</h4>
                    </div>


                    <div style={{
                        'float': 'right',
                        'margin-right': '2%',
                        'width': '70%',
                        // 'border': '1px solid white',
                        'margin-bottom': '0%',
                        // 'border-radius': '5px 5px 0px 0px',
                        'padding-top': '1%',
                        'padding-bottom': '0%'


                    }}>

                        <button style={{
                            'color': 'black',
                            'background': 'white',
                            'border': 'none',
                            'border-radius': '5px 0px 0px 5px'
                        }}
                                onClick={() => this.setState({'delay': Math.min(10000, this.state.delay + 50)})}>
                            <FastRewind/>
                        </button>
                        <button style={{
                            'color': 'black',
                            'background': 'white',
                            // 'border-left': '10px',
                            'border-top': 'none',
                            'border-bottom': 'none',
                            'border-left': '1px solid black',
                            'border-right': '1px solid black'
                            // 'border-left': '1px 0px 0px 0px black'

                        }} onClick={this.playCode}>
                            {/* eslint-disable-next-line react/jsx-no-undef */}
                            {!this.state.pause ? <PauseIcon/> : this.play_icon}
                        </button>
                        {/*<button onClick={this.playCode}> {this.state.button_label} </button>*/}
                        <button
                            style={{
                                'color': 'black',
                                'background': 'white',
                                'border': 'none',
                                'border-radius': '0px 5px 5px 0px'
                            }}
                            onClick={() => this.setState({'delay': Math.max(10, this.state.delay - 50)})}>
                            <FastForward/>
                        </button>

                        <Slider
                            style={{
                                'width': '90%',
                                'color': 'white',
                                'margin-left': '3%',
                                'margin-right': '3%'
                            }}
                            min={this.props.startIndex}
                            max={this.props.endIndex}
                            step={1}
                            value={this.currentPosition()}
                            onChange={(e, v) => {
                                // console.log("Changed....")
                                // const progress = parseInt(v / 100 * (this.props.endIndex + 1 - this.props.startIndex), 10);
                                const progress = v - this.props.startIndex;
                                this.setState({
                                    'progress': progress,
                                    'pause': true,
                                    'code': this.props.code_blocks[v]
                                }, () => this.progressUpdate(progress));
                                this.clearDiffMarkers();
                                if (this.props.highLightOption !== null)
                                    this.highlightDiff();
                            }}
                            aria-labelledby="continuous-slider"/>
                    </div>


                </div>

                <div
                    style={{
                        'background-color': '#ddd',
                        // 'border': '1px solid black',
                        // 'box-shadow': ' 0 4px 8px 0 rgba(0,0,0,0.2)',
                        'min-height': '10px',
                        'text-align': 'left',
                        'padding-top': '1px',
                        // 'padding-bottom': '1px'

                        // 'margin': '0px'
                    }}
                >
                    <p style={{
                        'background-color': '#ddd',
                        'margin-left': '2%',
                        'margin-top': '1%',
                        'margin-bottom': '0'
                    }}>
                        {/*{()=> ((this.props.startIndex === this.state.prevStart) ? (this.props.startIndex + this.state.progress)  :  'Prakriti aloo')()}*/}
                        {/*{(this.props.startIndex === this.state.prevStart) ? (this.props.startIndex + this.state.progress)  :  'Prakriti aloo'}*/}
                        Events: {this.currentPosition()}
                        /{this.props.endIndex}. Speed: {this.state.delay} ms |
                        Line Number: {this.getLineNumber()} |
                        <input
                            type="checkbox" label={"Auto Scroll"}
                            checked={this.state.scroll}
                            onClick={() => {
                                this.setState({
                                    'scroll': !this.state.scroll
                                });
                            }}
                        /> Scroll
                    </p>
                </div>


                {/*<div*/}
                {/*    id='code-playback'*/}
                {/*    className={'code-block'}*/}
                {/*    style={{*/}
                {/*        // 'height': window.innerHeight  -15*/}
                {/*        // 'height': '100%'*/}
                {/*    }}*/}
                {/*>*/}


                <Row style={{
                    'width': '100%',
                    // 'height': '100%',
                    'text-align': 'left',
                    'margin': 0
                }}>
                    <Col style={{
                        'width': '50%',
                        // 'border': '1px solid black',
                        // 'margin-right': `-1.7px`
                        // 'border': '1px solid black'
                    }}>
                        <div className={'code-type-header'}>
                            <center>
                                <p>Snapshot</p>
                            </center>

                        </div>


                        <CodeMirror
                            // className={'code-mirror'}
                            // style = {{
                            //     'float': 'left',
                            //     'text-align': 'left',
                            //     'border': '5px solid black'
                            //
                            // }}
                            value={this.state.code}
                            options={{
                                'mode': 'python',
                                'theme': 'default',
                                'lineNumbers': true,
                                'direction': 'ltr',
                            }}
                            editorDidMount={(editor, value) => {
                                // this.editor = editor;
                                this.editor = editor;
                                editor.setSize('100%', code_mirror_dim.height);
                                // editor.getScrollerElement().style.minHeight = window.innerHeight * 0.39 + 'px'
                                // editor.getScrollerElement().style.boxShadow = '0px';
                                // editor.setSize('200px',window.innerHeight * 0.34);
                                // editor.setSize('100%', (window.innerHeight * 0.34) + 'px');
                            }}
                            onChange={(editor, data, value) => {
                                // editor.focus();
                                // editor.setCursor({line: 5, ch: 5});
                            }}
                        />

                    </Col>
                    <Col>
                        <div style={{
                            'border-left': '1px solid #000',
                            'height': '100%',
                            'width': '0.5%'
                        }}></div>

                    </Col>
                    {/*<hr>*/}
                    <Col style={{
                        'width': '49.5%',
                        // 'float':"right"
                        // 'margin-left': '-1px'
                        // 'border': '1% solid black'
                    }}>
                        <div className={'code-type-header'}>
                            <center>
                                <p>Final Code</p>
                            </center>
                        </div>


                        <CodeHighlighter dimension={this.props.dimension}
                                         {...this.props.finalCodeProps}/>


                    </Col>
                </Row>
            </div>
        )

    }

}

export default CodePlayback;
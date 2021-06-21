import React from "react";
import Slider from '@material-ui/core/Slider';
import PlayCircleOutlineIcon from '@material-ui/icons/PlayCircleOutline';
import PauseIcon from '@material-ui/icons/Pause';
import codes from '../diff_book.csv';
import {FastForward, FastRewind} from "@material-ui/icons";
import {Controlled as CodeMirror} from 'react-codemirror2';

// import CodeMirror from "react-code"

class CodePlayback extends React.Component {

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
            'currentIndex': props.startIndex
        }
        this.play_icon = <PlayCircleOutlineIcon/>
        this.getCode = this.getCode.bind(this);
        this.playCode = this.playCode.bind(this);
        this.brushPositionChanged = this.brushPositionChanged.bind(this);
        this.currentPosition = this.currentPosition.bind(this);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.startIndex !== this.props.startIndex) {
            this.setState({
                'progress': -1,
                'code': this.props.code_blocks[this.props.startIndex]
            })
        }
    }

    currentPosition(){
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

    async getCode() {
        const code_blocks = this.props.code_blocks.slice(this.currentPosition(), this.props.endIndex + 1);
        console.log("Code blocks length: ", code_blocks.length, this.state.progress)
        const block_length = code_blocks.length;
        for (const [i, _code] of code_blocks.entries()) {
            if (this.state.pause) {
                break;
            }
            // If user changes the brush area while playing re-start the code.
            else if (this.brushPositionChanged()) {
                this.setState({
                    'progress': -1
                }, this.playCode);
                break;
            } else {
                const progress = this.state.progress + 1;
                this.setState({
                    'code': _code,
                    'progress': progress,
                    'blockLength': block_length
                }, ()=>this.props.progressUpdate(progress));
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
            console.log('Stoppped ...... ', this.state.progress)
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
        // TODO: Fix playback progress bug when changed index.
        return (
            <div id='code-playback' className={'code-block card-body'}>
                <div className={'code-block-header'}>
                    <div style={{
                        'float': 'left',
                        'margin-left': '2%',
                        'width': '20%',
                        // 'border': '1px solid white',
                        'margin-bottom': '2%',
                    }}>
                        <h4>Code Playback</h4>
                    </div>


                    <div style={{
                        'float': 'right',
                        'margin-right': '2%',
                        'width': '70%',
                        // 'border': '1px solid white',
                        'margin-bottom': '0%',
                        // 'border-radius': '5px 5px 0px 0px',
                        'padding-top': '1.5%'


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
                                console.log("Changed....")
                                // const progress = parseInt(v / 100 * (this.props.endIndex + 1 - this.props.startIndex), 10);
                                const progress = v - this.props.startIndex ;
                                this.setState({
                                    'progress': progress,
                                    'pause': true,
                                    'code': this.props.code_blocks[this.props.startIndex + progress]
                                }, this.props.progressUpdate(progress));
                            }}
                            aria-labelledby="continuous-slider"/>
                    </div>


                </div>
                <div style={{
                    // 'background-color': '#f6f6f6',
                    // 'border': '1px solid black',
                    'box-shadow': ' 0 4px 8px 0 rgba(0,0,0,0.2)',
                    'min-height': '200px',
                    'text-align': 'left'
                }}>
                    <p style={{
                        'margin-left': '2%'
                    }}>
                        {/*{()=> ((this.props.startIndex === this.state.prevStart) ? (this.props.startIndex + this.state.progress)  :  'Prakriti aloo')()}*/}
                        {/*{(this.props.startIndex === this.state.prevStart) ? (this.props.startIndex + this.state.progress)  :  'Prakriti aloo'}*/}
                        Events: {this.currentPosition()}
                        /{this.props.endIndex !==0 ? this.props.endIndex : this.props.endIndex}. Playback
                        speed: {this.state.delay} ms</p>
                    <CodeMirror
                        value={this.state.code}
                        options = {{
                            'mode': 'python',
                            'theme': 'material',
                            'lineNumbers': true,
                            'direction': 'ltr',
                            // 'inputStyle': 'textarea'
                        }}
                        editorDidMount={(editor, value) => {
                            // this.editor = editor;
                            editor.setSize('100%', '350');
                        }}
                        onChange={(editor, data, value) => {
                            // editor.focus();
                            // editor.setCursor({line: 5, ch: 5});
                        }}
                    />
                    {/*<p className={'code-text'}>*/}
                    {/*    {this.state.code}*/}
                    {/*</p>*/}
                </div>

            </div>
        )

    }

}

export default CodePlayback;
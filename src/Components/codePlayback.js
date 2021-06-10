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
            'progress': 0,
            'num_events': props.code_blocks.length,
            'delay': 300,
            'prevStart': 0,
            'prevEnd': 0,
            'playBackProgress': 0,
            'currentIndex': props.startIndex
        }
        this.play_icon = <PlayCircleOutlineIcon/>
        this.getCode = this.getCode.bind(this);
        this.playCode = this.playCode.bind(this);
        this.brushPositionChanged = this.brushPositionChanged.bind(this);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.startIndex !== this.props.startIndex) {
            this.setState({
                'progress': 0
            })
        }
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
        console.log("Looping started....: ", this.state.pause, this.props.startIndex, this.props.endIndex)
        console.log("This is the length of a index: ", this.props.code_blocks.slice(this.props.startIndex, this.props.endIndex).length)
        console.log("This is the length of code_blocks: ", this.props.code_blocks.length)

        this.setState({}, async () => {
            const code_blocks = this.props.code_blocks.slice(this.props.startIndex + this.state.progress, this.props.endIndex);
            const block_length = code_blocks.length;
            for (const [i, _code] of code_blocks.entries()) {
                console.log(i / block_length);
                if (this.state.pause) {
                    console.log("Broken down....: ", this.state.pause)
                    break;
                }
                // If user changes the brush area while playing re-start the code.
                else if (this.brushPositionChanged()) {
                    console.log('Changed burush points....')
                    this.setState({
                        'progress': 0
                    }, this.playCode);
                    // this.playCode();
                    break;
                }
                this.setState({
                    'code': _code,
                    'progress': this.state.progress + 1,
                    'playBackProgress': 100 * (this.state.progress + 1) / (this.props.endIndex - this.props.startIndex),
                    'blockLength': block_length
                });
                await this.sleep(this.state.delay);
                console.log('Looping... ', this.props.startIndex, this.props.endIndex)
            }
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
                'code': this.props.code_blocks[this.props.startIndex + this.state.progress]
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
                            value={this.state.prevStart != this.props.startIndex ? 0 : this.state.playBackProgress}
                            onChange={(e, v) => this.setState({
                                'progress': parseInt(v / 100 * (this.props.endIndex - this.props.startIndex), 10),
                                'pause': true,
                                'playBackProgress': v
                            })}
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
                        Events: {this.props.startIndex + this.state.progress}
                        /{this.props.endIndex}. Playback
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
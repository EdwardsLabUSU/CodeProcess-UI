import React from "react";
import {Controlled as CodeMirror} from 'react-codemirror2';
import BaseIDE from "../lib/codeMirror";

class CodeHighlighter extends BaseIDE{

    constructor(props) {
        super(props);
        // this.state ={
        //     'code': '# CS 1XXX \n' +
        //         '# Assignment 1 First Program\n' +
        //         '# Mr. Copy Directory\n' +
        //         '\n' +
        //         'import random\n' +
        //         'randList = random.sample(range(1, 40), 10)\n' +
        //         'print(randList)\n' +
        //         'for i in range(0, len(randList)):\n' +
        //         '    for j in range(0, len(randList)):\n' +
        //         '        if randList[i] > randList[j]:\n' +
        //         '            temp = randList[i]\n' +
        //         '            randList[i] = randList[j]\n' +
        //         '            randList[j] = temp\n' +
        //         'print(randList)',
        //     'startIndex': 50,
        //     'chars': 60,
        //     'highlight': true
        // };
        this.editor = null;
        this.marker = null;
        this.preHighLight = this.preHighLight.bind(this);
        this.HighLighted = this.HighLighted.bind(this);
        this.postHighLight = this.postHighLight.bind(this);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        {/*editor.markText({line:1,ch:1},{line:13,ch:1},{readOnly:false})*/}
        // console.log("Marked text.... : ", this.editor)
        if(this.editor !== null && (prevProps.startIndex != this.props.startIndex || this.props.chars != prevProps.chars)) {
            // return this.props.highlight ? this.props.code.slice(this.props.startIndex, this.props.startIndex + this.props.chars) : '';
            const preHighlight = this.props.code.slice(0, this.props.startIndex);
            const preCodeLines = preHighlight.split('\n');
            const postHighlight = this.props.code.slice(0, this.props.startIndex + this.props.chars);
            const postCodeLines = postHighlight.split('\n');

            // Number of code characters before current line...
            const preCodeChars = preCodeLines.slice(0, preCodeLines.length -1 ).join('\n');
            const postCodeChars = postCodeLines.slice(0, postCodeLines.length -1 ).join('\n');
            // const startLine = this.props.code.slice(0, this.props.startIndex).splitLines('\n').length;
            if(this.marker != null)
                this.marker.clear();
            this.marker = this.editor.markText({
                line: preCodeLines.length - 1
                ,ch: this.props.startIndex - preCodeChars.length - 1
            },{
                line:postCodeLines.length - 1,
                ch: this.props.startIndex + this.props.chars - postCodeChars.length - 1
            }, {
                'readOnly': false,
                'className': 'highlighted-code'
            });
            let preCodeLine = preCodeLines.length;
            let postcodeLine = postCodeLines.length;
            let scrollTo = preCodeLine;
            let lastLine = this.props.code.split('\n').length;
            if(preCodeLine  > 20) {
                if ((preCodeLine + 20) < lastLine) {
                    scrollTo = preCodeLine + 20
                }
            } else {
                scrollTo = 0
            }
            this.editor.scrollIntoView({line: scrollTo, char:0})
            console.log('Highlight Toggle: ', this.props.highLightToggle)
            if(this.props.highLightToggle) {
                console.log("Clear highlight...")
                this.props.highLightDiff();
            }
        }

        if(this.props.highLightOption !== null) {
            this.clearDiffMarkers();
            const option = this.props.highLightOption;
            option.final.forEach((each)=>{
                // this.highlightRange(this.editor, this.props.code, each[0],
                //     each[1]);
                this.highlightRange(this.editor, this.props.code, each);
            });
        } else {
            this.clearDiffMarkers();
        }

    }

    preHighLight(){
        // console.log("Pre highlight: ", this.props.startIndex )
        return this.props.highlight ? this.props.code.slice(0, this.props.startIndex) : this.props.code;
    }

    HighLighted(){
        return this.props.highlight ? this.props.code.slice(this.props.startIndex, this.props.startIndex + this.props.chars) : '';
    }

    postHighLight(){
        // console.log("post highlight: ", this.props.chars )
        return this.props.highlight ? this.props.code.slice(this.props.startIndex+this.props.chars) : '';
    }

    render() {
        return (
            <div id="highlighter" className={'code-block card-body'}
                 style={{
                     'height': window.innerHeight * 0.48
                 }}
            >
                <div className={'code-block-header'}
                     style={{
                         'height': '10%',
                         'padding-bottom': '0%'
                     }}
                >
                    <h4 style={{
                        'margin-top': '1%'
                    }}>Final Code</h4>
                </div>
                {/*Pre highlight*/}
                <div style={{
                    'text-align': 'left'
                }}>
                    <CodeMirror
                        // value={"APPLE IS VERY GOOD DO YOU KNOW THAT"}
                        value = {this.props.code}
                        options = {{
                            'mode': 'python',
                            'theme': 'default',
                            'lineNumbers': true,
                            'direction': 'ltr'
                        }}
                        editorDidMount={(editor, value) => {
                            this.editor = editor;
                            // editor.setM
                            // editor.getScrollerElement().style.minHeight = '350px'
                            editor.getScrollerElement().style.minHeight = window.innerHeight * 0.42;
                            editor.setSize('100%', 'auto');
                        }}
                    />
                </div>


            </div>
        );
    }
}

export  default CodeHighlighter;
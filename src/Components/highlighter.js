import React from "react";
import {Controlled as CodeMirror} from 'react-codemirror2';

class CodeHighlighter extends React.Component{

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
        console.log("Marked text.... : ", this.editor)
        if(this.editor !== null) {
            // return this.props.highlight ? this.props.code.slice(this.props.startIndex, this.props.startIndex + this.props.chars) : '';
            const preHighlight = this.props.code.slice(0, this.props.startIndex);
            const preCodeLines = preHighlight.split('\n');
            const postHighlight = this.props.code.slice(0, this.props.startIndex + this.props.chars);
            const postCodeLines = postHighlight.split('\n');

            // Number of code characters before current line...
            const preCodeChars = preCodeLines.slice(0, preCodeLines.length -1 ).join('\n');
            const postCodeChars = postCodeLines.slice(0, postCodeLines.length -1 ).join('\n');

            console.log("In highlighter: ", {
                line: preCodeLines.length,
                ch: this.props.startIndex - preCodeChars.length - 2
            },{
                line:postCodeLines.length,
                ch: this.props.startIndex + this.props.chars - postCodeChars.length
            })
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
            // this.editor.execCommand('selectAll');
        }

    }

    preHighLight(){
        console.log("Pre highlight: ", this.props.startIndex )
        return this.props.highlight ? this.props.code.slice(0, this.props.startIndex) : this.props.code;
    }

    HighLighted(){
        return this.props.highlight ? this.props.code.slice(this.props.startIndex, this.props.startIndex + this.props.chars) : '';
    }

    postHighLight(){
        console.log("post highlight: ", this.props.chars )
        return this.props.highlight ? this.props.code.slice(this.props.startIndex+this.props.chars) : '';
    }

    render() {
        return (
            <div id="highlighter" className={'code-block card-body'}>
                <div className={'code-block-header'}>
                    <h4>Final Code</h4>
                </div>
                {/*Pre highlight*/}
                <div style={{
                    'text-align': 'left'
                }}>
                    {/*editor.markText({line:1,ch:1},{line:13,ch:1},{readOnly:false})*/}
                    <CodeMirror
                        // value={"APPLE IS VERY GOOD DO YOU KNOW THAT"}
                        value = {this.props.code}
                        options = {{
                            'mode': 'python',
                            'theme': 'material',
                            'lineNumbers': true,
                            'direction': 'ltr',
                            // 'inputStyle': 'textarea'
                        }}
                        editorDidMount={(editor, value) => {
                            this.editor = editor;
                            editor.setSize('100%', '350');
                        }}


                    />
                    {/*<p>*/}
                    {/*<span id="pre_highlight">*/}
                    {/*    {this.preHighLight()}*/}
                    {/*</span>*/}
                    {/*    /!*Code HighLight*!/*/}
                    {/*    <span id="highlighted"  style={{*/}
                    {/*        'background-color': 'orange'*/}
                    {/*    }}>*/}
                    {/*    {this.HighLighted()}*/}
                    {/*</span>*/}
                    {/*    /!*Post Highlight*!/*/}
                    {/*    <span id="post_highlighted">*/}
                    {/*    {this.postHighLight()}*/}
                    {/*</span>*/}
                    {/*</p>*/}
                </div>


            </div>
        );
    }
}

export  default CodeHighlighter;
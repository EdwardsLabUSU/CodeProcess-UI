import React from "react";

class BaseIDE extends React.Component{
    constructor(props) {
        super(props);
        this.marker = null;
        this.diff_markers = [];
        this.highlightRange = this.highlightRange.bind(this);
    }

    clearDiffMarkers(){
        if(this.diff_markers !== []){
            this.diff_markers.forEach((marker)=>{marker.clear()});
        }
        this.diff_markers = [];

    }
    // highlightRange(editor, value, index, size){
    highlightRange(editor, value, option){
        // console.log(value, index, size)
        if(value === undefined) {
            return
        }
        this.diff_markers.push(editor.markText({
            line: option['start_line'] - 1
            ,ch: option['start_char']
        },{
            line: option['end_line']  - 1,
            ch: option['end_char']
        }, {
            'readOnly': false,
            'className': 'highlighted-code'
        }));

        return;

        // const preHighlight = value.slice(0, index+1);
        // const preCodeLines = preHighlight.split('\n');
        // const postHighlight = value.slice(0, index + size + 1);
        // const postCodeLines = postHighlight.split('\n');
        // const preLength = preCodeLines.slice(0, preCodeLines.length - 1).join('\n').length;
        // // const startChar = preLength > 0 ?  index - preLength + preCodeLines[preCodeLines.length - 1].length : index
        // const startChar = preCodeLines[preCodeLines.length - 1].length - 1
        // // const endChar =  index + size - postCodeLines.slice(0, postCodeLines.length - 1).join('\n').length + postCodeLines[postCodeLines.length - 1].length
        // const endChar = postCodeLines[postCodeLines.length - 1].length - 1
        // //
        // this.diff_markers.push(editor.markText({
        //     line: preCodeLines.length - 1
        //     ,ch: startChar
        // },{
        //     line: postCodeLines.length - 1,
        //     ch: endChar
        // }, {
        //     'readOnly': false,
        //     'className': 'highlighted-code'
        // }));
    }
}


export default BaseIDE;
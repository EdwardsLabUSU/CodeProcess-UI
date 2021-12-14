import React from "react";
import {Button} from "@material-ui/core";
import API_URL from "../config";
import axios from 'axios';

class Upload extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            selectedFile: null,
            message: '',
            file_id: null,
            success: false,
            latest_uploads: []
        };
        this.onFileChange = this.onFileChange.bind(this);
        this.onFileUpload = this.onFileUpload.bind(this);
        this.refreshList = this.refreshList.bind(this);
    }

    refreshList(){
        axios.get(API_URL + '/uploads/latest').then(res => {
            this.setState({
                'latest_uploads': res.data.data.rows
            })
        })
    }
    componentDidMount() {
       this.refreshList();
    }


    onFileChange(event){
        this.setState({ selectedFile: event.target.files[0] });
    }


    onFileUpload(event){
        // Create an object of formData
        if(this.state.selectedFile == null){
            this.setState({
                "message": "No file uploaded.."
            });
            return;
        }

        const formData = new FormData();

        // Update the formData object
        formData.append(
            "file",
            this.state.selectedFile,
            this.state.selectedFile.name
        );

        // Details of the uploaded file
        console.log(this.state.selectedFile);

        // Request made to the backend api
        // Send formData object
        axios.post(API_URL + "/upload", formData).then(res => this.setState({
            "message": res.data.data.message,
            'file_id': res.data.data.id,
            'success': true
        })).catch(res => this.setState({
            "message": "Error on uploading..."
        }));
    setTimeout(this.refreshList, 2000);
    }

    render() {
        return(
            <div>

                <div >
                    <a href={'/'}>Visualization</a>
                    <h2>Upload File</h2>
                    <p>Please upload the csv file obtained form py-phanon plugin.</p>
                    <p>{this.state.message}</p>
                    {this.state.success && <p>
                        Check Recent Uploads
                    </p> }
                    <br/>
                    {/*<form>*/}
                    <label htmlFor={'upload-btn'}>
                        <img src={'/img/upload.png'} height={'180px'} style={{
                            'border': '1px solid black',
                            'background-color': "light grey"
                        }}/>
                        <p>{this.state.selectedFile != null ? this.state.selectedFile.name: ''}</p>
                    </label>
                    <br/>
                    <input id={'upload-btn'} type={'file'} style={{
                        'display': 'none'
                    }} onChange={this.onFileChange}/>
                    <button className={'submit-btn'}  onClick={this.onFileUpload}>Submit</button>
                    {/*</form>*/}
                </div>

                <div style={{
                    'margin': "50px"
                }}>
                    <h2>Recent uploads</h2>
                    <table className={'upload-list'}>
                        <tr>
                            <th>File id</th>
                            <th>Filename</th>
                            <th>Status</th>
                            <th>Message</th>
                            <th>Created_at</th>
                            <th>File Count</th>
                        </tr>
                        {this.state.latest_uploads.map((each) => {
                            return (<tr>
                                <td>{each['id']}</td>
                                <td>{each['uploaded_file_name']}</td>
                                <td  className={each['status'].toLowerCase()}>{each['status']}</td>
                                <td>{each['message']}</td>
                                <td>{each['created_at']}</td>
                                <td>{each['count']}</td>
                            </tr>)
                        })}

                    </table>
                </div>


            </div>

        );
    }
}

export default Upload;
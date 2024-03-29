<h1>CodeProcess</h1>
<p>
CodeProcessis a software visualization tool that is designed to givethe viewer an immediate assessment of the general characteristicsof the process used to develop a piece of software. It features inter-active controls for the user to analyze details of the process. It is aweb application developed using Python, D3 and React JS.
</p>

## How CodeProcess Works?

We encourage you to read our paper on CodeProcess to better understand what CodeProcess is and how it can fit in your scenarios. 

The CodeProcess software has two components: API server and front-end. The API is built on Python using Flask, Sqlite, Pandas, difflib and othe modules. 
(You can see the complete list of modules used in requirements.txt). The front-end application is built using React and D3. React manages the over-all 
application and handles network requests, and D3 is responsible for the interactive visualization on CodeProcess. You can go to front-end repository to 
better understand the application and the code. The basic working mechanism of our application is following:
 
1. The Keystroke logs or events are obtained from a PyCharm application using pyPhanon Plugin that we built. (You can download the plugin from marketplace).
2. The log file is uploaded to the application at ``/upload``.
    ![upload](img/upload.png?raw=true "Upload")
    ![recent-upload](img/recent-uploads.png?raw=true "Recent Upload")
3. After the file has been uploaded to the application it is sent to the API Server. The API Server saves the file to a specific folder and starts another
      process that parses the keystroke logs, identifies the files in a log, create necessary diff files, final code and other files needed by the front-end for
       the visualization, playback and highlighting purpose. For each file API Server creates following files: <br/><br/>
           ``code``:  Contains the final code. (Used in a final code window). <br/>
           ``diff_book``: Contains the snapshot of the current code for each event or snapshot. (Used in Playback window)<br/>
           ``grid_points``: Contains the points required to plot the visualization. (Used in visualization window.)<br/>
           ``diff_match_blocks``: Contains the matching parameters between the snapshot and final code.
                                 (Used for diff highlighting between snapshot and final) <br/>
              ``diff_line_number``: Contains the line number of a cursor for each code snapShot. (Used to move cursor as real user for each snapshot) <br/>
4. The front-end app fetches the recent uploads in the upload pages and shows their status and any messages.
5. After the upload has been processed, the front-end fetches the latest uploads and the files extracted in a drop-down menu.
6. You can select any file from the drop-down to see the visualization and playback.

![CodeProcess](img/visualization.png?raw=true "CodeProcess")

The uploaded and processed files are stored in a sqlite database: "database.db". You can clear the folders and delete the database files to reset the app.

Installation
============
This the front-end for the CodeProcess. If you need API Server or back-end code then please go to back-end repository.
First, download this repository and install required npm packages. <br/>

<code>npm i</code>

Open ``/src/config.js`` and change the API_URL to the url of your back-end server:
> You need a API Server for this app to work. So make sure your API server for code-process is up and running.

By default, the API Server is hosted in localhost at port 5000.
<pre><code>
    let API_URL = "http://localhost:5000";
</code></pre>

Run the application using: <br/>
<code>npm start</code>




import logo from './logo.svg';
import './App.css';
import CodeHighlighter from './Components/highlighter';
import CodePlayback from './Components/codePlayback';
import { Grid, Row, Col } from 'react-flexbox-grid';
import DualSlider from "./Components/dualSlider";
import CodeViz from "./Components/codeViz";




function App() {

      return (
        <div className="App">
            <div style={{
                'margin-top': '0%'
            }}>

            </div>

            <CodeViz />

        </div>
      );
}

export default App;

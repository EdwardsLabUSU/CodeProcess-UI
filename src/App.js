import './App.css';
import CodeViz from "./Components/codeViz";
import Upload from "./Components/upload";
import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";




function App() {

      return (
        <div className="App">
            <div style={{
                'margin-top': '0%'
            }}>
                <BrowserRouter>
                <Routes>
                    <Route path="/" element={<CodeViz />} />
                    <Route path="upload" element={<Upload />} />
                    <Route path="*" element={<CodeViz />} />
                </Routes>
                </BrowserRouter>
            </div>

        </div>
      );
}

export default App;

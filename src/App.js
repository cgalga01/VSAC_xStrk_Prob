import './App.css';
import Graph from './graph';
import Heatmap from './heatmap';
import {Route, Routes } from 'react-router-dom';
import Header from './header';
import Footer from './Footer';


function App() {
  return (
    <div className="App">
      <Header/>
      <Routes>
          <Route path='/' element = {<Graph/>}/>
          <Route path='/Heatmap' element = {<Heatmap/>}/>
          
        </Routes>
      <Footer/>

      
    </div>
  );
}

export default App;

import React from 'react';
import ReactDOM from 'react-dom';

import YmmdHelper from './modules/ymmdHelper';

import './styles.scss';

function App() {
  return (
    <div className="App">
      <YmmdHelper />
    </div>
  );
}

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);

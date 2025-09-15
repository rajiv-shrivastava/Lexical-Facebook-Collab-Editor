import * as React from 'react';
import ReactDOM from 'react-dom'; // Import from 'react-dom'
import App from './lexical/App'; // Ensure correct path
//@ts-ignore
ReactDOM.render(
  <App />,
  document.getElementById('root') as HTMLElement // Typecasting to HTMLElement
);

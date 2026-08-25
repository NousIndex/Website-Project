import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
// Page styles are global (see the note in CSS/pages.css) and must stay in the
// main bundle now that the routes are code split.
import './CSS/pages.css';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <App />
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

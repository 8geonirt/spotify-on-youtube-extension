/*global ga*/
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

// eslint-disable-next-line no-unused-expressions
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
// eslint-disable-next-line no-unused-expressions
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

ga('create', process.env.GA_ID, 'auto');
ga('set', 'checkProtocolTask', function(){});
ga('require', 'displayfeatures');
ga('send', 'pageview', '/extension.html');


ReactDOM.render(<App />, document.getElementById('root'));

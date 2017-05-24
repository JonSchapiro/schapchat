import React, { Component } from 'react';
import Success from './components/Success';
import Error from './components/Error';
import Login from './components/Login';

// Application Skeleton Component
class App extends Component {
   constructor(props) {
     super(props);

     this.state = { path: '/' };
   }

   componentWillMount() {
    const path = window.location.pathname;
    this.setState({path});
   }

   render() {
     if (this.state.path === '/success') {
      return (
        <Success/>
       )
     }

     if (this.state.path === '/error') {
      return (
        <Error/>
       )
     }

     return (
      <Login/>
     )
   }
}
export default App;
import React, { Component } from 'react';
import Success from './components/Success';

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
        <div>
          Success
        </div>
       )
     }

     if (this.state.path === '/error') {
      return (
        <div>
          Error
        </div>
       )
     }

     return (
      <div>
        <a href="http://localhost:3001/api/auth/google">Sign In with Google</a>
      </div>
     )
   }
}
export default App;
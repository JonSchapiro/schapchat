import React, { Component } from 'react';

// Application Skeleton Component
class App extends Component {
   constructor(props) {
     super(props);
     this.state = { data: [] };
   }
   render() {
     return (
       <div>
        <h2> Hello World </h2>
       </div>
     )
   }
}
export default App;
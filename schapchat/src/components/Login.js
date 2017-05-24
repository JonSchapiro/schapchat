import * as React from 'react';

export default class Login extends React.Component {
  constructor() {
    super();
  }

  render() {
    return (
      <div>
        <a href="http://localhost:3001/api/auth/google">Sign In with Google</a>
      </div>
    );
  }
}
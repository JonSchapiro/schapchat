import * as React from 'react';
import axios from 'axios';

export default class Success extends React.Component {
  constructor() {
    super();
    this.state = {comments: []};
  }

  componentWillMount() {
    this.retrieveComments();
  }

  async retrieveComments() {
    const res = axios.get('http://localhost:3001/api/comments');

    if (res && res.data) {
      this.state({comments: res.data.comments});
    }
  }

  render() {
    return (
      <div>
        <div> Success </div>
      </div>
    );
  }
}
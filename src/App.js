import React, { Component } from 'react';

import Form from './Form.js';

class App extends Component {

  constructor(props){
    super(props);

    this.state = {
      ssids: null,
      error: null
    }
  }

  componentWillMount(){
    const url = process.env.REACT_APP_SSIDs_URL;

    fetch(url)
    .then(response => response.json())
    .then(ssids => this.setState({ ssids }))
    .catch(error => this.setState({ error }))
  }

  render() {

    const { ssids, error } = this.state;

    return (
      <div style={{ width: '100%', height: '100%' }}>
        {ssids && <Form ssids={ssids}/>}
        <div className='console'>
          {error && 'Error : '+error}
        </div>
      </div>
    );
  }
}

export default App;

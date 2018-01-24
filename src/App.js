import React, { Component } from 'react';
import './App.css';

const defaultSensor = {
  type: 'actuator',
  driver: 'relay',
  name: ''
};

class App extends Component {

  constructor(props){
    super(props);

    this.state = {
      ssid: '',
      pwd: '',
      platform: 'dweet.io',
      things: [ defaultSensor ],
      loading: false,
      error: null,
      sent: false
    }
  }

  handleChange = e => {
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  handleThingChange = sensorIndex => e => {
    this.setState({
      things: this.state.things.map((sensor, index) =>
        index !== sensorIndex ? sensor : {
          ...sensor,
          [e.target.name]: e.target.value
        }
      )
    })
  }

  addSensor = () => {
    this.setState({
      things: [...this.state.things, defaultSensor]
    })
  }

  getRequestBody = () => {
    const { ssid, pwd, things } = this.state;
    return {
      ssid,
      pwd,
      actuators: things
        .filter(sensor => sensor.type === 'actuator')
        .map(actuator => ({
        driver: actuator.driver,
        name: actuator.name,
        pins: ['GPIO5', 'GPIO4', 'GPIO0']
      })),
      sensors: things
        .filter(sensor => sensor.type === 'sensor')
        .map(sensor => ({
        driver: sensor.driver,
        name: sensor.name,
        pins: ['GPIO13']
      }))
    }
  }

  onComplete = () => {
    this.setState({
      loading: false,
      sent: true
    })
  }

  onError = error => {
    this.setState({
      loading: false,
      error
    })
  }

  onSubmit = e => {
    e.preventDefault();
    const url = process.env.REACT_APP_POST_URL;

    this.setState({
      loading: true,
      sent: false,
      error: null
    });

    fetch(url, {
      method: 'POST',
      body: JSON.stringify(this.getRequestBody())
    })
    .then(this.onComplete)
    .catch(this.onError)

    return false;
  }

  render() {

    const {
      ssid: selectedSsid,
      pwd,
      platform,
      things,
      loading,
      error,
      sent
    } = this.state;
    const ssids = process.env.REACT_APP_SSID_LIST.split(',');

    return (
      <div className='login'>
        <h1>Configuration</h1>
        <form onSubmit={this.onSubmit}>
          <select name='ssid' value={selectedSsid} onChange={this.handleChange} required>
            <option value=''>Select SSID</option>
            {ssids.map((ssid, index) =>
              <option key={index} value={ssid}>{ssid}</option>
            )}
          </select>
          <input
          type='password'
          name='pwd'
          value={pwd}
          required
          onChange={this.handleChange}
          placeholder='password'
          autoComplete='current-password' />
          <input
          type='text'
          name='platform'
          value={platform}
          required
          onChange={this.handleChange}
          placeholder='platform' />
          <div id='sensor_list'>
            {things.map((thing, index) => (
              <div key={index} className='thing'>
                <div className='thing-title'>{thing.name || "Thing "+index}</div>
                <select
                name='type'
                value={thing.type}
                onChange={this.handleThingChange(index)}>
                  <option value='sensor'>Sensor</option>
                  <option value='actuator'>Actuator</option>
                </select>
                <select
                name='driver'
                value={thing.driver}
                onChange={this.handleThingChange(index)}>
                  <option value='relay'>Relay</option>
                  <option value='dimmer'>Dimmer</option>
                </select>
                <input
                type='text'
                name='name'
                required
                placeholder='Name'
                onChange={this.handleThingChange(index)}/>
              </div>
            ))}
          </div>
          <input
          type='button'
          className='btn btn-primary btn-block btn-large'
          onClick={this.addSensor}
          value='+' />
          <input type='submit' className='btn btn-primary btn-block btn-large' value='Connect' />
        </form>
        <div className='console'>
          <div>{loading && '...sending data'}</div>
          <div>{sent && 'OK'}</div>
          <div>{error && 'error : '+error}</div>
        </div>
      </div>
    );
  }
}

export default App;

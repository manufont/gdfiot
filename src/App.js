import React, { Component } from 'react';
import './App.css';

const defaultSensor = {
  type: 'sensor',
  driver: 'relay',
  name: ''
};

class App extends Component {

  constructor(props){
    super(props);

    this.state = {
      ssid: '',
      password: '',
      device_id: '%DEVICE_ID%',
      sensors: [
        defaultSensor
      ],
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
  
  handleSensorChange = sensorIndex => e => {
    this.setState({
      sensors: this.state.sensors.map((sensor, index) =>
        index !== sensorIndex ? sensor : {
          ...sensor,
          [e.target.name]: e.target.value
        }
      )
    })
  }

  addSensor = () => {
    this.setState({
      sensors: [...this.state.sensors, defaultSensor]
    })
  }

  onSubmit = e => {
    e.preventDefault();
    const url = process.env.REACT_APP_POST_URL;
    const { ssid, password, sensors } = this.state;

    this.setState({
      loading: true,
      sent: false,
      error: null
    });
    fetch(url, {
      method: "POST",
      body: JSON.stringify({
        ssid,
        pwd: password,
        actuators: sensors
          .filter(sensor => sensor.type === 'actuator')
          .map(actuator => ({
          driver: actuator.driver,
          name: actuator.name,
          pins: ['GPIO5', 'GPIO4', 'GPIO0']
        })),
        sensors: sensors
          .filter(sensor => sensor.type === 'sensor')
          .map(sensor => ({
          driver: sensor.driver,
          name: sensor.name,
          pins: ['GPIO13']
        }))
      })
    }).then(() => {
      this.setState({
        loading: false,
        sent: true
      })
    }).catch(error => {
      this.setState({
        loading: false,
        sent: false,
        error
      })
    })
    return false;
  }

  render() {

    const {
      ssid: selectedSsid,
      password,
      device_id,
      sensors,
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
          name='password'
          value={password}
          required
          onChange={this.handleChange}
          placeholder='password'
          autoComplete='current-password' />
          <input
          type='text'
          name='device_id'
          value={device_id}
          required
          onChange={this.handleChange}
          placeholder='%DEVICE_ID%' />
          <div id='sensor_list'>
            {sensors.map((sensor, index) => (
              <div key={index} className='thing'>
                <div className='thing-title'>Thing {sensor.name || index}</div>
                <select name='type' required value={sensor.type} onChange={this.handleSensorChange(index)}>
                  <option value='sensor'>Sensor</option>
                  <option value='actuator'>Actuator</option>
                </select>
                <select name='driver' required value={sensor.driver} onChange={this.handleSensorChange(index)}>
                  <option value='relay'>Relay</option>
                  <option value='dimmer'>Dimmer</option>
                </select>
                <input type='text' name='name' required placeholder='Name' onChange={this.handleSensorChange(index)}/>
              </div>
            ))}
          </div>
          <input type='button'
          className='btn btn-primary btn-block btn-large'
          onClick={this.addSensor}
          value='+' />
          <input type='submit' className='btn btn-primary btn-block btn-large' value='Connect' />
        </form>
        <div className='console'>
          <span>{loading && '...sending data'}</span>
          <span>{sent && 'OK'}</span>
          <span>{error && 'error : '+error}</span>
        </div>
      </div>
    );
  }
}

export default App;

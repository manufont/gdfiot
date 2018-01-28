import React, { Component } from 'react';

const flatten = array => Array.prototype.concat.apply([], array);

const driverMap = {
  'sensor': ['thermometer', 'switch'],
  'actuator': ['relay', 'dimmer']
};

const pinNumberMap = {
  'thermometer': 2,
  'switch': 1,
  'dimmer': 3,
  'relay': 1
};

const pinList = [
  'GPIO0',
  'GPIO1',
  'GPIO2',
  'GPIO3',
  'GPIO4',
  'GPIO5',
  'GPIO9',
  'GPIO10',
  'GPIO12',
  'GPIO13',
  'GPIO14',
  'GPIO15',
  'GPIO16'
];

const defaultSensor = {
  type: 'actuator',
  driver: 'relay',
  name: '',
  pins: Array(pinNumberMap['relay']).fill('')
};

const addDriverToThing = thing => ({
  ...thing,
  driver: driverMap[thing.type].indexOf(thing.driver) > -1 ? thing.driver : driverMap[thing.type][0]
})

const addPinsToThing = thing => ({
  ...thing,
  ...(thing.pins.length !== pinNumberMap[thing.driver]) && {
    pins: Array(pinNumberMap[thing.driver]).fill('')
  }
})

class Form extends Component {

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
        index !== sensorIndex ? sensor : addPinsToThing(addDriverToThing({
          ...sensor,
          [e.target.name]: e.target.value
        }))
      )
    })
  }

  handlePinChange = (sensorIndex, pinIndex) => e => {
    this.setState({
      things: this.state.things.map((sensor, i) =>
        i !== sensorIndex ? sensor : {
          ...sensor,
          pins: sensor.pins.map((pin, j) =>
            j !== pinIndex ? pin : e.target.value
          )
        }
      )
    })
  }

  addThing = () => {
    this.setState({
      things: [...this.state.things, defaultSensor]
    })
  }

  removeThing = index => {
    this.setState({
      things: this.state.things.filter((thing, i) => i !== index)
    })
  }

  getRequestBody = () => {
    const { ssid, pwd, platform, things } = this.state;
    return {
      ssid,
      pwd,
      platform,
      actuators: things
        .filter(sensor => sensor.type === 'actuator')
        .map(actuator => ({
        driver: actuator.driver,
        name: actuator.name,
        pins: actuator.pins
      })),
      sensors: things
        .filter(sensor => sensor.type === 'sensor')
        .map(sensor => ({
        driver: sensor.driver,
        name: sensor.name,
        pins: sensor.pins
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

  getAvailablePins = (thingIndex, pinIndex) => {
    const usedPins = flatten(this.state.things.map(thing => thing.pins))
      .filter(pin => pin !== '' && pin !== this.state.things[thingIndex].pins[pinIndex])

    return pinList.filter(pin => usedPins.indexOf(pin) === -1)
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
    const { ssids } = this.props;

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
            {things.map((thing, i) => (
              <div key={i} className='thing'>
                {i !== 0 && <hr/>}
                <div className='thing-header'>
                  <div>{thing.name || "Thing "+i}</div>
                  {things.length > 1 && <div onClick={() => this.removeThing(i)}>X</div>}
                </div>
                <select
                name='type'
                value={thing.type}
                onChange={this.handleThingChange(i)}>
                  <option value='sensor'>Sensor</option>
                  <option value='actuator'>Actuator</option>
                </select>
                <select
                name='driver'
                value={thing.driver}
                onChange={this.handleThingChange(i)}>
                  {driverMap[thing.type].map((driver, j) =>
                    <option key={j} value={driver}>{driver}</option>
                  )}
                </select>
                {thing.pins.map((selectedPin, j) => (
                  <select key={j} name='pin' value={selectedPin} onChange={this.handlePinChange(i, j)} required>
                    <option value=''>Select pin #{j}</option>
                    {this.getAvailablePins(i, j).map((pin, k) =>
                      <option key={k} value={pin}>{pin}</option>
                    )}
                  </select>
                ))}
                <input
                type='text'
                name='name'
                required
                placeholder='Name'
                onChange={this.handleThingChange(i)}/>
              </div>
            ))}
          </div>
          <input
          type='button'
          className='btn btn-primary btn-block btn-large'
          onClick={this.addThing}
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

export default Form;

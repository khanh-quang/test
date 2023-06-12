$(document).ready(() => {
  // if deployed to a site supporting SSL, use wss://
  const protocol = document.location.protocol.startsWith('https') ? 'wss://' : 'ws://';
  const webSocket = new WebSocket(protocol + location.host);

  // A class for holding the last N points of telemetry for a device
  class DeviceData {
    constructor(deviceId) {
      this.deviceId = deviceId;
      this.maxLen = 50;
      this.timeData = new Array(this.maxLen);
      this.temperatureData = new Array(this.maxLen);
      this.humidityData = new Array(this.maxLen);
    }

    addData(time, temperature, humidity) {
      this.timeData.push(time);
      this.temperatureData.push(temperature);
      this.humidityData.push(humidity || null);

      if (this.timeData.length > this.maxLen) {
        this.timeData.shift();
        this.temperatureData.shift();
        this.humidityData.shift();
      }
    }

    getLatestData() {
      const latestIndex = this.timeData.length - 1;
      return {
        time: this.timeData[latestIndex],
        temperature: this.temperatureData[latestIndex],
        humidity: this.humidityData[latestIndex]
      };
    }
  }

  // All the devices in the list (those that have been sending telemetry)
  class TrackedDevices {
    constructor() {
      this.devices = [];
    }

    // Find a device based on its Id
    findDevice(deviceId) {
      for (let i = 0; i < this.devices.length; ++i) {
        if (this.devices[i].deviceId === deviceId) {
          return this.devices[i];
        }
      }

      return undefined;
    }

    getDevicesCount() {
      return this.devices.length;
    }
  }

  const trackedDevices = new TrackedDevices();

  // Manage a list of devices in the UI
  let needsAutoSelect = true;
  const deviceCount = document.getElementById('deviceCount');
  const listOfDevices = document.getElementById('listOfDevices');
  const temperature = document.getElementById('temperature');
  const humidity = document.getElementById('humidity');
  function OnSelectionChange() {
    const device = trackedDevices.findDevice(listOfDevices[listOfDevices.selectedIndex].text);
    if (device) {
      const latestData = device.getLatestData();
      const date = new Date(latestData.time);
      const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
      temperature.innerText = latestData.temperature ? `${latestData.temperature} °C` : ':N/A';
      humidity.innerText = latestData.humidity ? ` ${latestData.humidity} %` : ':N/A';
    } else {
      temperature.innerText = 'N/A';
      humidity.innerText = 'N/A';
    }
  }
  listOfDevices.addEventListener('change', OnSelectionChange, false);

  // When a web socket message arrives:
  // 1. Unpack it
  // 2. Validate it has date/time and temperature
  // 3. Find or create a cached device to hold the telemetry data
  // 4. Append the telemetry data
  // 5. Update the UI list of devices
  webSocket.onmessage = function onMessage(message) {
    try {
      const messageData = JSON.parse(message.data);
      console.log(messageData);
  
      // time and either temperature or humidity are required
      if (!messageData.MessageDate || (!messageData.IotData.temperature && !messageData.IotData.humidity)) {
        return;
      }
  
      // find or add device to list of tracked devices
      const existingDeviceData = trackedDevices.findDevice(messageData.DeviceId);
  
      if (existingDeviceData) {
        existingDeviceData.addData(messageData.MessageDate, messageData.IotData.temperature, messageData.IotData.humidity);
        if (listOfDevices.selectedIndex >= 0 && listOfDevices.options[listOfDevices.selectedIndex].text === messageData.DeviceId) {
          // update temperature and humidity with latest data
          updateTemperatureAndHumidity(existingDeviceData.getLatestData());
        }
      } else {
        const newDeviceData = new DeviceData(messageData.DeviceId);
        trackedDevices.devices.push(newDeviceData);
        const numDevices = trackedDevices.getDevicesCount();
        deviceCount.innerText = numDevices === 1 ? `${numDevices} device` : `${numDevices} devices`;
        newDeviceData.addData(messageData.MessageDate, messageData.IotData.temperature, messageData.IotData.humidity);
  
        // add device to the UI list
        const node = document.createElement('option');
        const nodeText = document.createTextNode(messageData.DeviceId);
        node.appendChild(nodeText);
        listOfDevices.appendChild(node);
  
       // if this is the first device, auto-select it
        if (needsAutoSelect) {
          needsAutoSelect = false;
          listOfDevices.selectedIndex = 0;
          OnSelectionChange();
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Update temperature and humidity on UI
  function updateTemperatureAndHumidity(data) {
    const date = new Date(data.time);
    const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    temperature.innerText = `${data.temperature} °C`;
    humidity.innerText = `${data.humidity} %`;
    document.getElementById('time').innerText = formattedDate;
  }

  // setInterval to update temperature and humidity with latest data
  setInterval(() => {
    const selectedDevice = trackedDevices.findDevice(listOfDevices[listOfDevices.selectedIndex].text);
    if (selectedDevice) {
      const latestData = selectedDevice.getLatestData();
      updateTemperatureAndHumidity(latestData);
    }
  }, 1000);
});
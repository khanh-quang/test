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
  
    // Manage a list of devices in the UI, and update which device data the chart is showing
    // based on selection
    const deviceCount = document.getElementById('deviceCount');
    function OnSelectionChange() {
      const device = trackedDevices.findDevice(listOfDevices[listOfDevices.selectedIndex].text);
      if (device) {
        const i1aElement = document.getElementById('i1a-value');
        const i1bElement = document.getElementById('i1b-value');
        const i1cElement = document.getElementById('i1c-value');
        if (i1aElement && i1bElement && i1cElement) {
          i1aElement.innerText = device.temperatureData[device.temperatureData.length - 1] || '';
          i1bElement.innerText = device.humidityData[device.humidityData.length - 1] || '';
          i1cElement.innerText = device.humidityData[device.humidityData.length - 1] || '';
        }
      }
    }
    const listOfDevices = document.getElementById('listOfDevices');
    listOfDevices.addEventListener('change', OnSelectionChange, false);
  
    // When a web socket message arrives:
    // 1. Unpack it
    // 2. Validate it has date/time and temperature
    // 3. Find or create a cached device to hold the telemetry data
    // 4. Append the telemetry data
    // 5. Update the UI with the latest telemetry data for the selected device
    webSocket.onmessage = function onMessage(message) {
      try {
        const messageData = JSON.parse(message.data);
        console.log(messageData);
  
        // time and either temperature or humidity are required
        if (!messageData.MessageDate || (!messageData.IotData.I1a && !messageData.IotData.I1b && !messageData.IotData.I1c)) {
          return;
        }
  
        // find or add device to list of tracked devices
        const existingDeviceData = trackedDevices.findDevice(messageData.DeviceId);
  
        if (existingDeviceData) {
          existingDeviceData.addData(messageData.MessageDate, messageData.IotData.I1a, messageData.IotData.I1b, messageData.IotData.I1c);
        } else {
          const newDeviceData = new DeviceData(messageData.DeviceId);
          trackedDevices.devices.push(newDeviceData);
          const numDevices = trackedDevices.getDevicesCount();
          deviceCount.innerText = numDevices === 1 ? `${numDevices} device` : `${numDevices} devices`;
          newDeviceData.addData(messageData.MessageDate, messageData.IotData.I1a, messageData.IotData.I1b, messageData.IotData.I1c);
  
          // add device to the UI list
          const node = document.createElement('option');
          const nodeText = document.createTextNode(messageData.DeviceId);
          node.appendChild(nodeText);
          listOfDevices.appendChild(node);
        }
  
        OnSelectionChange();
      } catch (err) {
        console.error(err);
      }
    };
  });
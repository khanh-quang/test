const webSocket = new WebSocket('wss://your-websocket-server-url.com');
const listOfDevices = document.getElementById('list-of-devices');
const deviceCount = document.getElementById('device-count');
const trackedDevices = new TrackedDevices();
let needsAutoSelect = true;

class DeviceData {
  constructor(deviceId) {
    this.deviceId = deviceId;
    this.maxLen = 50;
    this.timeData = new Array(this.maxLen);
    this.temperatureData = new Array(this.maxLen);
    this.humidityData = new Array(this.maxLen);
    this.dateData = new Array(this.maxLen);
  }

  addData(time, temperature, humidity, date) {
    this.timeData.push(time);
    this.temperatureData.push(temperature);
    this.humidityData.push(humidity || null);
    this.dateData.push(date);

    if (this.timeData.length > this.maxLen) {
      this.timeData.shift();
      this.temperatureData.shift();
      this.humidityData.shift();
      this.dateData.shift();
    }
  }
}

class TrackedDevices {
  constructor() {
    this.devices = [];
  }

  findDevice(deviceId) {
    return this.devices.find(device => device.deviceId === deviceId);
  }

  getDevicesCount() {
    return this.devices.length;
  }
}

webSocket.onopen = function onOpen() {
  console.log('WebSocket connection established.');
};

webSocket.onerror = function onError(error) {
  console.error('WebSocket error:', error);
};

webSocket.onclose = function onClose() {
  console.log('WebSocket connection closed.');
};

webSocket.onmessage = function onMessage(message) {
  try {
    const messageData = JSON.parse(message.data);
    console.log(messageData);

    // time, temperature, humidity and date are required
    if (!messageData.MessageDate || !messageData.IotData.temperature || !messageData.IotData.humidity || !messageData.IotData.date) {
      return;
    }

    // find or add device to list of tracked devices
    const existingDeviceData = trackedDevices.findDevice(messageData.DeviceId);

    if (existingDeviceData) {
      existingDeviceData.addData(messageData.MessageDate, messageData.IotData.temperature, messageData.IotData.humidity, messageData.IotData.date);
    } else {
      const newDeviceData = new DeviceData(messageData.DeviceId);
      trackedDevices.devices.push(newDeviceData);
      const numDevices = trackedDevices.getDevicesCount();
      deviceCount.innerText = numDevices === 1 ? `${numDevices} device` : `${numDevices} devices`;
      newDeviceData.addData(messageData.MessageDate, messageData.IotData.temperature, messageData.IotData.humidity, messageData.IotData.date);

      // add device to the UI list
      const node = document.createElement('option');
      const nodeText = document.createTextNode(messageData.DeviceId);
      node.appendChild(nodeText);
      listOfDevices.appendChild(node);

      // if this is the first device being discovered, auto-select it
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

function OnSelectionChange() {
  const device = trackedDevices.findDevice(listOfDevices[listOfDevices.selectedIndex].text);

  const i1aValue = document.getElementById('i1a-value');
  const i1bValue = document.getElementById('i1b-value');
  const i1cValue = document.getElementById('i1c-value');

  if (device && device.temperatureData.length > 0) {
    const latestTemperature = device.temperatureData[device.temperatureData.length - 1];
    const latestHumidity = device.humidityData[device.humidityData.length - 1];
    const latestDate = device.dateData[device.dateData.length - 1];

    i1aValue.innerHTML = `${latestTemperature.toFixed(2)}ºC`;
    i1bValue.innerHTML = `${latestHumidity.toFixed(2)}%`;
    i1cValue.innerHTML = latestDate;
  } else {
    i1aValue.innerHTML = '--';
    i1bValue.innerHTML = '--';
    i1cValue.innerHTML = '--';
  }
}
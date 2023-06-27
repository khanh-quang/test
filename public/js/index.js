
const deviceId = "ew50";
const iotHubName = "datnmqtt";
const password = `SharedAccessSignature sr=$datnmqtt.azure-devices.net&sig=<COMBINATION_OF_PASSWORDS_URL_ENCODED>&se=<EPOCH_EXPIRY>&skn=<ACCESS_POLICY_NAME>`;

// Connect to Azure IoT Hub using MQTT
const url = `$datnmqtt.azure-devices.net/$ew50/api-version=2016-11-14`;
const iotHubTopic = `devices/$ew50/messages/events/`;

const protocol = document.location.protocol.startsWith('https') ? 'wss://' : 'ws://';
const webSocket = new WebSocket(protocol + location.host);
//Read data from Iot devices in AzureIothub
//Change $('#Ua-value') by value we need
//Change text(**) by data we need

$(document).ready(async () => {

  webSocket.onmessage = function onMessage(message) {
    const { topic, value } = JSON.parse(message.data);
    console.log('data', JSON.parse(message.data));
    $(`#${topic}-value`).text(value.toFixed(2));
  };
});
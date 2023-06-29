$(document).ready(async () => {
    const protocol = document.location.protocol.startsWith('https') ? 'wss://' : 'ws://';
    const webSocket = new WebSocket(protocol + location.host);
    webSocket.onmessage = function onMessage(message) {
    const data = JSON.parse(message.data);
    console.log('data', data);
    const Uavalue = data?.Uavalue;
  
    console.log('Uavalue', Uavalue);
    $(`#Ua-value`).text(Uavalue?.toFixed(2));
    const Hzvalue = data?.Hzvalue;
    console.log('Hzvalue', Hzvalue);
    $(`#Hz-value`).text(Hzvalue?.toFixed(2));
    const Ubvalue = data?.Ubvalue;
    console.log('Ubvalue', Ubvalue);
    $(`#Ub-value`).text(Ubvalue?.toFixed(2));
    const Ucvalue = data?.Ucvalue;
    console.log('Ucvalue', Ucvalue);
    $(`#Uc-value`).text(Ucvalue?.toFixed(2));
    const Iavalue = data?.Iavalue;
    console.log('Iavalue', Iavalue);
    $(`#Ia-value`).text(Iavalue?.toFixed(2));
    const Ibvalue = data?.Ibvalue;
    console.log('Ibvalue', Ibvalue);
    $(`#Ib-value`).text(Ibvalue?.toFixed(2));
    const Icvalue = data?.Icvalue;
    console.log('Icvalue', Icvalue);
    $(`#Ic-value`).text(Icvalue?.toFixed(2));
    const Pvalue = data?.Pvalue;
    console.log('Pvalue', Pvalue);
    $(`#P-value`).text(Pvalue?.toFixed(2));
    const Avalue = data?.Avalue;
    console.log('Avalue', Avalue);
    $(`#A-value`).text(Avalue);
    const Cosfivalue = data?.Cosfivalue;
    console.log('Cosfivalue', Cosfivalue);
    $(`#Cosfi-value`).text(Cosfivalue?.toFixed(2));
    };
  });

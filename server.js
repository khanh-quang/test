const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const mqtt = require('mqtt');
const fs = require('fs');
const { promisify } = require('util');
const writeFileAsync = promisify(fs.writeFile);

const host = 'broker.emqx.io';
const port = '1883';
const clientId = `17tdhclc2`;
const connectUrl = `mqtt://${host}:${port}`;

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res /* , next */) => {
  res.redirect('/');
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.broadcast = (data) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        console.log(`Broadcasting data ${data}`);
        client.send(data);
      } catch (e) {
        console.error(e);
      }
    }
  });
};

server.listen(process.env.PORT || '3000', () => {
  console.log('Listening on %d.', server.address().port);
});

const client = mqtt.connect(connectUrl, {
  clientId,
  clean: true,
  connectTimeout: 4000,
 // username: 'minhanh16',
 // password: 'minhanh16',
  reconnectPeriod: 1000,
});

const registerValues = {};

const topic = ['ew50'];

client.subscribe(topic, () => {
  console.log(`Subscribed to topic: ${topic.join(', ')}`);
  client.publish(topic[0], '', { qos: 0, retain: false }, (error) => {
    if (error) {
      console.error(error);
    }
  });
});

client.on('message', async (topic, payload) => {
  console.log('Received Message:', topic, payload.toString(), payload);
  const t = JSON.stringify(payload.toString()).replace(/\\n/g, '').replace(/\\t/g, '');
  let data = t.replace(/\\u0000/g, '');
  const temp = Object.values(JSON.parse(JSON.parse(data)))[0][0];
  let result = temp;
  const RegisterValue = temp['Register Values'] || null;
  // console.log('Register Values', RegisterValue);
  // Ua
  const Ua = RegisterValue.substr(0, 8);
  // console.log('Ua hex values:', Ua);
  let newStrUa = Ua.slice(-4) + Ua.slice(4, -4) + Ua.slice(0, 4);
      const actualUa = convertRegisterValue(`0x${newStrUa}`);
      // console.log('Ua', actualUa);
      result = {...result, 'Register Values': actualUa};
      wss.broadcast(JSON.stringify({Uavalue: actualUa}));
  // Ub
  const Ub = RegisterValue.slice(9, 17);
  // console.log('Ub hex values:', Ub);
  let newStrUb = Ub.slice(-4) + Ub.slice(4, -4) + Ub.slice(0, 4);
  const actualUb = convertRegisterValue(`0x${newStrUb}`);
  // console.log('Ub', actualUb);
  result = {...result, 'Register Values': actualUb};
  wss.broadcast(JSON.stringify({Ubvalue: actualUb}));
  // Uc
  const Uc = RegisterValue.slice(17, 25);
  // console.log('Uc hex values:', Uc);
  let newStrUc = Uc.slice(-4) + Uc.slice(4, -4) + Uc.slice(0, 4);
      const actualUc = convertRegisterValue(`0x${newStrUc}`);
      // console.log('Uc', actualUc);
      result = {...result, 'Register Values': actualUc};
wss.broadcast(JSON.stringify({Ucvalue: actualUc}));
  // Ia
  const Ia = RegisterValue.slice(65, 73);
  // console.log('Ia hex values:', Ia);
  let newStrIa = Ia.slice(-4) + Ia.slice(4, -4) + Ia.slice(0, 4);
  const actualIa = convertRegisterValue(`0x${newStrIa}`);
  // console.log('Ia', actualIa);
  result = {...result, 'Register Values': actualIa};
  wss.broadcast(JSON.stringify({Iavalue: actualIa}));
  // Ib
  const Ib = RegisterValue.slice(73, 81);
  // console.log('Ib hex values:', Ib);
  let newStrIb = Ib.slice(-4) + Ib.slice(4, -4) + Ib.slice(0, 4);
  const actualIb = convertRegisterValue(`0x${newStrIb}`);
  // console.log('Ib', actualIb);
  result = {...result, 'Register Values': actualIb};
  wss.broadcast(JSON.stringify({Ibvalue: actualIb}));
  // Ic
  const Ic = RegisterValue.slice(81, 89);
  // console.log('Ic hex values:', Ic);
  let newStrIc = Ic.slice(-4) + Ic.slice(4, -4) + Ic.slice(0, 4);
  const actualIc = convertRegisterValue(`0x${newStrIc}`);
  // console.log('Ic', actualIc);
  result = {...result, 'Register Values': actualIc};
  wss.broadcast(JSON.stringify({Icvalue: actualIc}));
  // P
  const P = RegisterValue.slice(169, 177);
  // console.log('P hex values:', P);
  let newStrP = P.slice(-4) + P.slice(4, -4) + P.slice(0, 4);
  const actualP = convertRegisterValue(`0x${newStrP}`);
  // console.log('P', actualP);
  result = {...result, 'Register Values': actualP};
  wss.broadcast(JSON.stringify({Pvalue: actualP}));
   // Hz
  const startIndex = RegisterValue.length - 8 - 8;
  const endIndex = RegisterValue.length - 8;
  const Hz = RegisterValue.substring(startIndex, endIndex);
  //  console.log('Hz hex values:', Hz);
   let newStrHz = Hz.slice(-4) + Hz.slice(4, -4) + Hz.slice(0, 4);
   const actualHz = convertRegisterValue(`0x${newStrHz}`);
  //  console.log('Hz', actualHz);
   result = {...result, 'Register Values': actualHz};
   wss.broadcast(JSON.stringify({Hzvalue: actualHz}));
  //  A
  const A = RegisterValue.substring(RegisterValue.length - 8);
  //  console.log('A hex values:', A);
   let newStrA = A.slice(-4) + A.slice(4, -4) + A.slice(0, 4);
   const actualA = convertRegisterValue(`0x${newStrA}`);
  //  console.log('A', actualA);
   result = {...result, 'Register Values': actualA};
   wss.broadcast(JSON.stringify({Avalue: actualA}));
   // Cosfi
   const startIndex2 = RegisterValue.length - 16 - 8;
   const endIndex2 = RegisterValue.length - 16;
   const Cosfi = RegisterValue.substring(startIndex2, endIndex2);
  //  console.log('Cosfi hex values:', Cosfi);
   let newStrCosfi = Cosfi.slice(-4) + Cosfi.slice(4, -4) + Cosfi.slice(0, 4);
   const actualCosfi = convertRegisterValue(`0x${newStrCosfi}`);
  //  console.log('Cosfi', actualCosfi);
   result = {...result, 'Register Values': actualCosfi};
   wss.broadcast(JSON.stringify({Cosfivalue: actualCosfi}));
});
const convertRegisterValue = (str) => {
  var float = 0, sign, order, mantiss,exp,
  int = 0, multi = 1;
if (/^0x/.exec(str)) {
int = parseInt(str,16);
}else{
for (var i = str.length -1; i >=0; i -= 1) {
  if (str.charCodeAt(i)>255) {
    console.log('Wrong string parametr'); 
    return false;
  }
  int += str.charCodeAt(i) * multi;
  multi *= 256;
}
}
sign = (int>>>31)?-1:1;
exp = (int >>> 23 & 0xff) - 127;
mantissa = ((int & 0x7fffff) + 0x800000).toString(2);
for (i=0; i<mantissa.length; i+=1){
float += parseInt(mantissa[i])? Math.pow(2,exp):0;
exp--;
}
float = float*sign;
// console.log(float);
return float;
}

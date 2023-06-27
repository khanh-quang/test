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
  username: 'minhanh16',
  password: 'minhanh16',
  reconnectPeriod: 1000,
});

const registerValues = {};

const topics = ['Ua', 'Hz', 'kWh', 'Ia', 'P', 'Cosfi'];

client.subscribe(topics, () => {
  console.log(`Subscribed to topics: ${topics.join(', ')}`);
  client.publish(topics[0], '', { qos: 2, retain: false }, (error) => {
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
  
  if(topic === 'Ua') {
    const UaregisterValue = temp['Register Values'] || null;
    if(UaregisterValue) {
      let newStr = UaregisterValue.slice(-4) + UaregisterValue.slice(4, -4) + UaregisterValue.slice(0, 4);
      const actualUaRegisterValue = convertRegisterValue(`0x${newStr}`);
      console.log('actual Ua value', actualUaRegisterValue);
      result = {...result, 'Register Values': actualUaRegisterValue};

      registerValues[topic] = actualUaRegisterValue;
      await writeFileAsync('registerValues.json', JSON.stringify(registerValues, null, 2));

      const newTopic = `${topic}${actualUaRegisterValue}`;
      console.log('New topic:', newTopic);
      // Send the actualUaRegisterValue to all connected clients via the WebSocket server with the new topic
      wss.broadcast(JSON.stringify({topic, value: actualUaRegisterValue}));
    }
  }

  if(topic === 'Hz') {
    const HzregisterValue = temp['Register Values'] || null;
    if(HzregisterValue) {
      let newStr = HzregisterValue.slice(-4) + HzregisterValue.slice(4, -4) + HzregisterValue.slice(0, 4);
      const actualHzRegisterValue = convertRegisterValue(`0x${newStr}`);
      console.log('actual Hz value', actualHzRegisterValue);
      result = {...result, 'Register Values': actualHzRegisterValue};

      registerValues[topic] = actualHzRegisterValue;
      await writeFileAsync('registerValues.json', JSON.stringify(registerValues, null, 2));
      const newTopic = `${topic}${actualHzRegisterValue}`;
      console.log('New topic:', newTopic);
      // Send the actualHzRegisterValue to all connected clients via the WebSocket server with the new topic
      wss.broadcast(JSON.stringify({topic, value: actualHzRegisterValue}));
    }
  }

  if(topic === 'Ia') {
    const IaregisterValue = temp['Register Values'] || null;
    if(IaregisterValue) {
      let newStr = IaregisterValue.slice(-4) + IaregisterValue.slice(4, -4) + IaregisterValue.slice(0, 4);
      const actualIaRegisterValue = convertRegisterValue(`0x${newStr}`);
      console.log('actual Ia value', actualIaRegisterValue);
      result = {...result, 'Register Values': actualIaRegisterValue};

      registerValues[topic] = actualIaRegisterValue;
      await writeFileAsync('registerValues.json', JSON.stringify(registerValues, null, 2));

      const newTopic = `${topic}${actualIaRegisterValue}`;
      console.log('New topic:', newTopic);
      // Send the actualIaRegisterValue to all connected clients via the WebSocket server with the new topic
      wss.broadcast(JSON.stringify({topic, value: actualIaRegisterValue}));
    }
  }

  if(topic === 'kWh') {
    const kWhregisterValue = temp['Register Values'] || null;
    if(kWhregisterValue) {
      let newStr = kWhregisterValue.slice(-4) + kWhregisterValue.slice(4, -4) + kWhregisterValue.slice(0, 4);
      const actualkWhRegisterValue = convertRegisterValue(`0x${newStr}`);
      console.log('actual kWh value', actualkWhRegisterValue);
      result = {...result, 'Register Values': actualkWhRegisterValue};

      registerValues[topic] = actualkWhRegisterValue;
      await writeFileAsync('registerValues.json', JSON.stringify(registerValues, null, 2));

      const newTopic = `${topic}${actualkWhRegisterValue}`;
      console.log('New topic:', newTopic);
      // Send the actualkWhRegisterValue to all connected clients via the WebSocket server with the new topic
      wss.broadcast(JSON.stringify({topic, value: actualkWhRegisterValue}));
    }
  }

  if(topic === 'P') {
    const PregisterValue = temp['Register Values'] || null;
    if(PregisterValue) {
      let newStr = PregisterValue.slice(-4) + PregisterValue.slice(4, -4) + PregisterValue.slice(0, 4);
      const actualPRegisterValue = convertRegisterValue(`0x${newStr}`);
      console.log('actual P value', actualPRegisterValue);
      result = {...result, 'Register Values': actualPRegisterValue};

      registerValues[topic] = actualPRegisterValue;
      await writeFileAsync('registerValues.json', JSON.stringify(registerValues, null, 2));

      const newTopic = `${topic}${actualPRegisterValue}`;
      console.log('New topic:', newTopic);
      // Send the actualPRegisterValue to all connected clients via the WebSocket server with the new topic
      wss.broadcast(JSON.stringify({topic, value: actualPRegisterValue}));
    }
  }

  if(topic === 'Cosfi') {
    const CosfiregisterValue = temp['Register Values'] || null;
    if(CosfiregisterValue) {
      let newStr = CosfiregisterValue.slice(-4) + CosfiregisterValue.slice(4, -4) + CosfiregisterValue.slice(0, 4);
      const actualCosfiRegisterValue = convertRegisterValue(`0x${newStr}`);
      console.log('actual Cosfi value', actualCosfiRegisterValue);
      result = {...result, 'Register Values': actualCosfiRegisterValue};

      registerValues[topic] = actualCosfiRegisterValue;
      await writeFileAsync('registerValues.json', JSON.stringify(registerValues, null, 2));

      const newTopic = `${topic}${actualCosfiRegisterValue}`;
      console.log('New topic:', newTopic);
      // Send the actualCosfiRegisterValue to all connected clients via the WebSocket server with the new topic
      wss.broadcast(JSON.stringify({topic, value: actualCosfiRegisterValue}));
    }
  }

  // Write the result to a file in JSON format
  await writeFileAsync('data.json', JSON.stringify(result, null, 2));
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
console.log(float);
return float;
}

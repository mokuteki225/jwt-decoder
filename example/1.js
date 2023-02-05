'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const { Jwt } = require('../src/jwt.js');
const { RS256Strategy } = require('../src/strategies/rs256.js');

const keys = crypto.generateKeyPairSync('rsa', {
  modulusLength: 1024,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  },
});

fs.writeFile('./pub.pem', keys.publicKey, (err, data) => {
  if (err) console.log(err);
  console.log(data);
});

fs.writeFile('./priv.pem', keys.privateKey, (err, data) => {
  if (err) console.log(err);
  console.log(data);
});

const jwt = new Jwt(new RS256Strategy({
  ...keys,
  ttl: 100000,
}));
const token = jwt.generate({ id: '123' });
const invalid_header = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVDEifQ.eyJpZCI6IjEyMyIsImV4cCI6IjExNjcyNjc2NzQxNjM0In0.67iDd-sQQ-vIV6xJNxd7jfw49COMVpTdlsDO1B7D4l0';
const invalid_signature = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMyIsImV4cCI6IjExNjcyNjc2NzQxNjM0In0.II6vtdyDd7qHnnWAmLCrYA99GgGLjru1tyXwbpKAkKI';

try {
  console.log(token);
  console.log(jwt.verify(token)); // true 
} catch (err) {
  console.log(err);
}

try {
  console.log(jwt.verify(invalid_header)); // false
} catch (err) {
  console.log(err);
}

try {
  console.log(jwt.verify(invalid_signature)); // false
} catch (err) {
  console.log(err);
}

const expired_token = jwt.generate({ id: '123' }, { ttl: 2000 })

try {
  console.log(jwt.verify(expired_token)); // true 
} catch (err) {
  console.log(err);
}

try {
  setTimeout(() => {
    console.log(jwt.verify(expired_token)); // false 
  }, 3000);
} catch (err) {
  console.log(err);
}

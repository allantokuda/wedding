import crypto from 'crypto';

let randomKey = function() {
  return crypto.randomBytes(12).toString('base64').replace('/','0').replace('+','0');
};

export default randomKey;

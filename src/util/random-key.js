import crypto from 'crypto';

let randomKey = function() {
  return crypto.randomBytes(12).toString('base64').replace(/\//g,'0').replace(/\+/g,'0');
};

export default randomKey;

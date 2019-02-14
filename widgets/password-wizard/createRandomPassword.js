const chars =
  'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ@+-=*&%?!_23456789';

function getRandomInt(max) {
  // TODO use truly random numbers
  // see https://gist.github.com/joepie91/7105003c3b26e65efcea63f3db82dfba
  return Math.floor(Math.random() * Math.floor(max));
}

function createRandomPassword(passwordLength = 12) {
  let password = '';
  const charsLength = chars.length;
  for (let i = 0; i < passwordLength; i++) {
    const charId = getRandomInt(charsLength);
    password += chars[charId];
  }
  return password;
}

module.exports = createRandomPassword;

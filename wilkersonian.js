const cons = 'BDFGHJKLMNPRSTVZ';
const vows = 'AIOU';
const f = 15;
const lookup = {
  B: '0000', D: '0001', F: '0010', G: '0011',
  H: '0100', J: '0101', K: '0110', L: '0111',
  M: '1000', N: '1001', P: '1010', R: '1011',
  S: '1100', T: '1101', V: '1110', Z: '1111',
  A: '00', I: '01', O: '10', U: '11'
};
export function consonant(nibble) {
  return cons[nibble];
}
export function ends(byte) {
  return `${cons[(byte>>4)&f]}-${cons[byte&f]}`;
}
export function dab(n) {
  return `${cons[(n>>6)&f]}${vows[(n>>4)&3]}${cons[n&f]}`;
}
export function toInt(str) {
  return parseInt(
    str.replace(
      /[abdf-pr-vz]/ig, x => lookup[x.toUpperCase()]),
    2);
}

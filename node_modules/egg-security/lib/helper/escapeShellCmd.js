'use strict';


const BASIC_ALPHABETS = new Set('#&;`|*?~<>^()[]{}$;\'",\x0A\xFF'.split(''));

function escapeShellCmd(string) {

  const str = '' + string;
  let res = '';
  let ascii;

  for (let index = 0; index < str.length; index++) {
    ascii = str[index];
    if (!BASIC_ALPHABETS.has(ascii)) {
      res += ascii;
    }
  }

  return res;
}
module.exports = escapeShellCmd;

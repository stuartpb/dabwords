/* global require monaco */
import {swizzle} from "https://cdn.skypack.dev/bitfiddle@0.1.1";
import cre from "https://cdn.skypack.dev/cre@0.3.0";
import panzoom from 'https://cdn.skypack.dev/panzoom';

const placemat = document.querySelector('#placemat');

panzoom(placemat, {
  minZoom: 0.1,
  initialZoom: 0.2,
  bounds: true
});

const wilCons = 'BDFGHJKLMNPRSTVZ';
const wilVows = 'AIOU';

const levels = [
  { habit: 2,
    cswiz: '24242424 54545454 34343434',
    oswiz: '5342',
    label: b => wilCons[b]
  },
  { habit: 4,
    cswiz: '68246824 98549854 78347834',
    oswiz: '97538642',
    label: b => `${wilCons[(b>>4)&15]}-${wilCons[b&15]}`,
  },
  { habit: 5,
    cswiz: '8a246424 ba545474 9a343434',
    oswiz: 'b9537a8426',
    label: b => `${wilCons[(b>>6)&15]}${wilVows[(b>>4)&3]}${wilCons[b&15]}`
  }
];

function square(level, i) {
  const color = "#" + (swizzle(i, levels[level].cswiz) ^ 0xffffff)
    .toString(16).padStart(6, '0').toUpperCase();
  return cre(".square", { style: {
    backgroundColor: color,
    order: swizzle(i, levels[level].oswiz)
  } }, [
    cre("span.label", levels[level].label(i)),
  ]);
}

for (let level = 0; level < levels.length; ++level) {
  const habit = levels[level].habit;
  const items = [];
  for (let i = 0; i < 1<<(2*habit); ++i) {
    items[i] = square(level, i);
  }
  placemat.appendChild(cre('.field', {
    style: {grid: `repeat(${1<<habit}, 1fr) / repeat(${1<<habit}, 1fr)`}
  }, items));
}

// shout out to https://gist.github.com/m3g4p0p/167d26fbff3e6858c334a09fbd554f5c
require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.36.1/min/vs' } })
window.MonacoEnvironment = {
  getWorkerUrl: function (workerId, label) {
    return `data:text/javascript;charset=utf-8,${encodeURIComponent(`
      self.MonacoEnvironment = {
        baseUrl: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.36.1/min/'
      };
      importScripts('https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.36.1/min/vs/base/worker/workerMain.js');`
    )}`
  }
}

require(['vs/editor/editor.main'], function () {
  const editor = monaco.editor.create(document.getElementById('sidebar'), {
    theme: 'vs-dark'
  });
})


/* global require monaco */
import {swizzle} from "https://cdn.skypack.dev/bitfiddle@0.1.1";
import cre from "https://cdn.skypack.dev/cre@0.3.0";
import panzoom from 'https://cdn.skypack.dev/panzoom';
import workingWords from './workingWords.js';
import {consonant, ends, dab as dabWord, toInt as wToInt} from './wilkersonian.js';

const placemat = document.querySelector('#placemat');

const dabRe = /[BDFGHJKLMNPRSTVZ][AIOU][BDFGHJKLMNPRSTVZ]/;

const levels = [
  { habit: 2,
    cswiz: '24242424 54545454 34343434',
    oswiz: '5342',
    label: consonant
  },
  { habit: 4,
    cswiz: '68246824 98549854 78347834',
    oswiz: '97538642',
    label: ends,
  },
  { habit: 5,
    cswiz: '8a246424 ba545474 9a343434',
    oswiz: 'b9537a8426',
    label: dabWord
  }
];

const definitions = [];
const undefinitions = [];
const extraLines = [];
const wordEls = [];

function square(level, i) {
  const color = "#" + (swizzle(i, levels[level].cswiz) ^ 0xffffff)
    .toString(16).padStart(6, '0').toUpperCase();

  const children = [
    cre(`span.label.level${level+1}`,
      levels[level].label(i)),
  ];

  if (level == 2) {
    wordEls[i] = children[1] = cre('span.def', definitions[i] || '');
  }

  return cre(".square", { style: {
    backgroundColor: color,
    order: swizzle(i, levels[level].oswiz)
  } }, children);
}

const layers = [];
for (let level = 0; level < levels.length; ++level) {
  const habit = levels[level].habit;
  const items = [];
  for (let i = 0; i < 1<<(2*habit); ++i) {
    items[i] = square(level, i);
  }
  const layer = cre('.field', {
    style: {grid: `repeat(${1<<habit}, 1fr) / repeat(${1<<habit}, 1fr)`}
  }, items)
  layers[level] = layer;
  placemat.appendChild(layer);
}

const vpz = panzoom(placemat, {
  minZoom: 0.02,
  maxZoom: 1,
  initialZoom: 0.2,
  bounds: true
});
vpz.on('zoom', ()=>{
  const {scale} = vpz.getTransform();
  layers[2].hidden = scale < 0.09;
  layers[1].hidden = scale < 0.04;// || scale >= 0.09;
  //layers[0].hidden = scale > 0.2;
})

function deserializeState(dict) {
  extraLines.length = 0;
  undefinitions.length = 0;
  for (const line of dict.split('\n')) {
    const pair = line.split(':');
    // we don't handle non-colon-split lines
    if (pair.length == 2) {
      // TODO: this should be whole-word anchored
      if (dabRe.test(pair[0])) {
        const dabInt = wToInt(pair[0].trim());
        const def = pair[1].trim();
        definitions[dabInt] = def;
        wordEls[dabInt].textContent = def;
      } else if (!pair[0].trim()){
        undefinitions.push(pair[1].trim());
        // TODO: add to shelf
      } else {
        extraLines.push(line);
      }
    } else extraLines.push(line);
  }
}

function serializeState() {
  const lines = [];
  for (let i = 0; i < 1024; ++i) {
    lines[i] = `${dabWord(i)}: ${definitions[i] || ''}`;
  }
  for (const undefinition of undefinitions) {
    lines.push(`: ${undefinition}`);
  }
  for (const extra of extraLines) {
    lines.push(extra);
  }
  return lines.join('\n');
}

deserializeState(workingWords);

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
  monaco.languages.register({id: 'dict'});
  monaco.languages.setMonarchTokensProvider('dict', {
    tokenizer: {
      root: [
        [dabRe, 'keyword']
      ],
    },
  });
  const editor = monaco.editor.create(document.getElementById('sidebar'), {
    value: workingWords,
    language: 'dict',
    theme: 'vs-dark'
  });
  const scrollToDab = e => {
    editor.revealLineNearTop(wToInt(e.target.textContent)+1);
  }
  for (const label of document.querySelectorAll('.label.level3')) {
    label.addEventListener('click',scrollToDab);
  }
})


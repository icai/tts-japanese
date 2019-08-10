const fs = require('fs');
const download = require('download');
const flattenDeep = require('lodash.flattendeep');
const arrayUniq = array => [...new Set(array)];
const dicts = require('./syllabaries');

// Promise.all
const queue = function (arr, iter, end) {
  !function fire() {
    if (arr.length > 0) {
      var item = arr.shift();
      iter.apply({}, [item, fire].concat(Array.prototype.slice.call(arguments, 0)))
    } else {
      end();
    }
  }()
}


const aliasWords = {
  shi: 'si',
  chi: 'ti',
  tsu: 'tu',
  fu: 'hu'
}

const createDownQueue = () => {
  const ignores = [];
  const queues = arrayUniq(flattenDeep(dicts).map(item => String(item).length == 1 ? (item + item): item));
  console.log('totoal: ' + queues.length);
  queue(queues, (item, next) => {
    let titem = '';
    if(aliasWords[item]) {
      titem = aliasWords[item];
    } else {
      titem = item;
    }
    try {
      download(`https://www.nhk.or.jp/lesson/mp3/syllabary/${titem}.mp3`)
        .then(data => {
          fs.writeFileSync(`dist/${item}.mp3`, data);
          next();
        }).catch((e) => {
          if (e.statusMessage == 'Not Found') {
            ignores.push(item);
          }
          console.log(item + ' : ' + e.statusMessage);
          next();
        });
    } catch (e) {
      console.log(e);
      next();
    }
  }, ()=> {
    console.log('done !')
  })
}



createDownQueue();












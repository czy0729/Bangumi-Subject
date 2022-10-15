/*
 * @Author: czy0729
 * @Date: 2022-10-14 11:50:23
 * @Last Modified by: czy0729
 * @Last Modified time: 2022-10-14 12:58:29
 */
const fs = require('fs')
const path = require('path')
const utils = require('./utils/utils')

const __min = './douban/douban.min.json'
const __notMatch = './douban/not-match.json'
const __raw = './douban/raw.json'
const raw = read(__raw)

function read(dir) {
  return JSON.parse(fs.readFileSync(dir))
}

const min = {}
const notMatch = {}
Object.keys(raw).forEach(id => {
  const item = raw[id]
  if (item?.douban?.id) {
    min[item.douban.id] = Number(id)
  } else {
    notMatch[id] = {
      ...item,
      dir: `./search/${Math.floor(
        id / 100
      )}/${id}.json`
    }
  }
})

fs.writeFileSync(__min, JSON.stringify(min))
fs.writeFileSync(__notMatch, JSON.stringify(notMatch, null, 2))
console.log(Object.keys(min).length)

process.exit()
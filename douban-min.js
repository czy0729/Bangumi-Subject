/*
 * @Author: czy0729
 * @Date: 2022-10-14 11:50:23
 * @Last Modified by: czy0729
 * @Last Modified time: 2022-10-16 13:48:49
 */
const fs = require('fs')
const path = require('path')
const utils = require('./utils/utils')

const __min = './douban/douban.min.json'
const __notMatch = './douban/not-match.json'
const __raw = './douban/raw.json'
const __manual = './douban/manual.json'
const raw = read(__raw)
const manual = read(__manual)

const _manual = {}
read(__notMatch).forEach((item) => {
  if (item.dId && item.id) {
    manual[item.dId] = item.id
    _manual[item.id] = item.dId
  }
})
fs.writeFileSync(__manual, JSON.stringify(manual, null, 2))

const min = {}
const notMatch = []
Object.keys(raw).forEach((id) => {
  const item = raw[id]
  if (item?.douban?.id) {
    min[item.douban.id] = Number(id)
  } else {
    const dId = _manual[id] || ''
    notMatch.push({
      dId,
      ...item,
      dir: `./search/${Math.floor(id / 100)}/${id}.json`,
    })
  }
})

fs.writeFileSync(__min, JSON.stringify(min))
fs.writeFileSync(
  __notMatch,
  JSON.stringify(
    notMatch.sort((a, b) => (b.rank || 9999) - (a.rank || 9999)),
    null,
    2
  )
)
console.log(Object.keys(min).length, notMatch.length)

function read(dir) {
  return JSON.parse(fs.readFileSync(dir))
}

process.exit()

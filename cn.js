/*
 * @Author: czy0729
 * @Date: 2020-05-19 16:07:31
 * @Last Modified by: czy0729
 * @Last Modified time: 2022-08-01 05:26:59
 */
const fs = require('fs')
const path = require('path')
const join = require('path').join
const utils = require('./utils/utils')

const filePaths = []
function findJsonFile(path) {
  fs.readdirSync(path).forEach((item, index) => {
    const fPath = join(path, item)
    const stat = fs.statSync(fPath)
    if (stat.isDirectory() === true) {
      findJsonFile(fPath)
    }
    if (stat.isFile() === true && fPath.indexOf('.DS_Store') === -1) {
      filePaths.push(fPath)
    }
  })
}
findJsonFile('./data')

const cn = {}
filePaths.forEach((item) => {
  try {
    const {
      id,
      info = '',
      rating = {},
      type,
    } = JSON.parse(fs.readFileSync(item))
    if (!info) return
    if (!rating.total || !rating.rank || rating.total <= 50) return

    // if (type === 1 || type === 2 || type === 4) {
    if (type === 2) {
      const match = info.match(/<li><span>中文名: <\/span>(.+?)<\/li>/)
      if (match) {
        cn[id] = match[1]
      }
    }
  } catch (error) {}
})

fs.writeFileSync('./cn/anime.json', utils.safeStringify(cn))

const _cn = {}
Object.keys(cn).forEach((id) => {
  const key = cn[id].trim()
  if (key.length >= 2) _cn[key] = parseInt(id)
})
fs.writeFileSync('./cn/_anime.json', utils.safeStringify(_cn))
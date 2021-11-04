/*
 * @Author: czy0729
 * @Date: 2020-11-07 22:19:40
 * @Last Modified by: czy0729
 * @Last Modified time: 2020-11-07 22:57:35
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

const rate = {}
filePaths.forEach((item) => {
  try {
    const { id, rating = {}, type } = JSON.parse(fs.readFileSync(item))

    if (type === 1 || type === 2 || type === 4) {
      if (rating.total > 20) {
        rate[id] = rating.score
      }
    }
  } catch (error) {}
})
fs.writeFileSync('./rate/rate.json', utils.safeStringify(rate))

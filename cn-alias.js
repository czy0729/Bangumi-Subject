/*
 * @Author: czy0729
 * @Date: 2020-05-19 16:07:31
 * @Last Modified by: czy0729
 * @Last Modified time: 2022-08-13 16:48:57
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

    if (type === 2) {
      const match = info.match(
        /<li><span>别名: <\/span>(.+?)<\/li>|<li><span style=\"visibility:hidden;\">别名: <\/span>(.+?)<\/li>/g
      )
      if (match.length) {
        match.forEach(item => {
          const title = item.replace(/<li><span>别名: <\/span>|<li><span style=\"visibility:hidden;\">别名: <\/span>|<\/li>/g, '')
          if (title.length >= 2 && title.length <= 4) {
            cn[title] = parseInt(id)
          }
        })
      }
    }
  } catch (error) {}
})

fs.writeFileSync('./cn/_alias.json', utils.safeStringify(cn))

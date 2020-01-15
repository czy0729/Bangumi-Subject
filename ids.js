/*
 * 获取比较有价值的条目id
 * @Author: czy0729
 * @Date: 2020-01-15 10:17:38
 * @Last Modified by: czy0729
 * @Last Modified time: 2020-01-15 14:42:00
 */
const axios = require('axios')
const fs = require('fs')
const path = require('path')
const cheerio = require('./utils/cheerio')
const utils = require('./utils/utils')

/**
 * 动画 (当前排行榜有234页有效数据)
 * https://bgm.tv/anime/browser/airtime/2020?page=10
 * https://bgm.tv/anime/browser?sort=rank&page=234
 *
 * 书籍 (当前排行榜有146页有效数据)
 * https://bgm.tv/book/browser?sort=rank&page=146
 *
 * 音乐 (当前排行榜有155页有效数据)
 * https://bgm.tv/music/browser?sort=rank&page=155
 *
 * 游戏 (当前排行榜有192页有效数据)
 * https://bgm.tv/game/browser?sort=rank&page=192
 *
 * 三次元 (当前排行榜有80页有效数据)
 * https://bgm.tv/real/browser?sort=rank&page=80
 */

;(async () => {
  const data = []

  // /**
  //  * anime 2020
  //  */
  // for (let page = 1; page < 12; page++) {
  //   console.log(
  //     `- fetching ${`https://bgm.tv/anime/browser/airtime/2020?page=${page}`}`
  //   )
  //   const { data: indexHTML } = await axios({
  //     url: `https://bgm.tv/anime/browser/airtime/2020?page=${page}`
  //   })
  //   data.push(...cheerio.cheerioIds(indexHTML))
  // }
  // const filePath = './ids/anime-2020.json'

  // /**
  //  * anime rank page 1-234
  //  */
  // for (let page = 1; page < 235; page++) {
  //   const url = `https://bgm.tv/anime/browser?sort=rank&page=${page}`
  //   const { data: indexHTML } = await axios({
  //     url
  //   })

  //   console.log(`- fetching ${url}`)
  //   data.push(...cheerio.cheerioIds(indexHTML))
  // }
  // const filePath = './ids/anime-rank.json'

  /**
   * book rank page 1-146
   */
  for (let page = 1; page < 147; page++) {
    const url = `https://bgm.tv/book/browser?sort=rank&page=${page}`
    const { data: indexHTML } = await axios({
      url
    })

    console.log(`- fetching ${url}`)
    data.push(...cheerio.cheerioIds(indexHTML))
  }
  const filePath = './ids/book-rank.json'

  /**
   * start
   */
  const dirPath = path.dirname(filePath)
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath)
  }

  console.log(`- writing ${filePath}`)
  fs.writeFileSync(
    filePath,
    JSON.stringify(Array.from(new Set(data)).sort((a, b) => a - b))
  )
})()

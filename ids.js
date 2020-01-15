/*
 * @Author: czy0729
 * @Date: 2020-01-15 10:17:38
 * @Last Modified by: czy0729
 * @Last Modified time: 2020-01-15 10:58:05
 */
const axios = require('axios')
const fs = require('fs')
const path = require('path')
const cheerio = require('./utils/cheerio')
const utils = require('./utils/utils')

// url: `https://bgm.tv/anime/browser/airtime/2020?page=10`
// url: `https://bgm.tv/anime/browser?sort=rank&page=234`

;(async () => {
  // /**
  //  * anime 2020
  //  */
  // const data = []
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

  /**
   * anime rank page 1-234
   */
  const data = []
  for (let page = 1; page < 235; page++) {
    const url = `https://bgm.tv/anime/browser?sort=rank&page=${page}`
    const { data: indexHTML } = await axios({
      url
    })

    console.log(`- fetching ${url}`)
    data.push(...cheerio.cheerioIds(indexHTML))
  }
  const filePath = './ids/anime-rank.json'

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

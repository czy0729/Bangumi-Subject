/*
 * 获取比较有价值的条目id
 * @Author: czy0729
 * @Date: 2020-01-15 10:17:38
 * @Last Modified by: czy0729
 * @Last Modified time: 2021-10-30 16:23:20
 */
const axios = require('axios')
const fs = require('fs')
const path = require('path')
const bangumiData = require('bangumi-data')
const cheerio = require('./utils/cheerio')
const utils = require('./utils/utils')

axios.defaults.timeout = 3000

/*
JSON.stringify({
  'User-Agent': navigator.userAgent,
  Cookie: document.cookie
});
*/
const headers = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.54 Safari/537.36',
  Cookie:
    'chii_sec_id=pG5Jgrb5v3PhSnN%2B9S%2Bj0sTJQGDkbMC5jU2SCGE; chii_cookietime=2592000; chii_theme_choose=1; __utmz=1.1626708381.273.9.utmcsr=tongji.baidu.com|utmccn=(referral)|utmcmd=referral|utmcct=/; prg_display_mode=normal; chii_theme=dark; __utmc=1; chii_auth=fFnMALIVreoffJS87DYH%2BDYkLftawqxiRNrTl%2BRsZpwJJusfEvj08DxNdCYzlG6HVn6MTKZA5nSa%2BJtiZdJ3CwR9oT6COg0Df0M4; chii_sid=ZiLCCZ; __utma=1.1636245540.1617210056.1635366210.1635580907.334; __utmb=1.29.10.1635580907',
}

async function fetch(url) {
  try {
    console.log(url)
    const data = await axios({
      url,
      headers,
    })
    return data
  } catch (error) {
    console.log(`[retry] ${url}`)
    return fetch(url)
  }
}

/**
 * 动画
 *  - bangumi-data的条目id
 *  - https://bgm.tv/anime/browser/airtime/2021?page=1
 *  - https://bgm.tv/anime/browser/airtime/2020?page=1
 *  - https://bgm.tv/anime/browser?sort=rank&page=1
 *
 * 书籍
 *  - https://bgm.tv/book/browser?sort=rank&page=1
 *
 * 音乐
 *  - https://bgm.tv/music/browser?sort=rank&page=1
 *
 * 游戏
 *  - https://bgm.tv/game/browser?sort=rank&page=1
 *
 * 三次元
 *  - https://bgm.tv/real/browser?sort=rank&page=1
 */
const pages = {
  anime: 276,
  book: 192,
  music: 192,
  game: 237,
  real: 94,

  2022: 7,
  2021: 32,
  // 2020: 35,
  // book2021: 43,
  // book2020: 259,
  // music2021: 30,
  // music2020: 106,
  // game2021: 21,
  // game2020: 67,
  // real2021: 9,
  // real2020: 30,
}

;(async () => {
  let filePath
  let data = []

  // bangumi-data
  bangumiData.items.forEach((item) => {
    const find = item.sites.find((i) => i.site === 'bangumi')
    if (find) {
      data.push(parseInt(find.id))
    }
  })
  write('./ids/anime-bangumi-data.json', data)
  data = []

  // anime 2022
  for (let page = 1; page <= pages[2022]; page++) {
    const { data: indexHTML } = await fetch(
      `https://bgm.tv/anime/browser/airtime/2022?page=${page}`
    )
    data.push(...cheerio.cheerioIds(indexHTML))
  }
  write('./ids/anime-2022.json', data)
  data = []

  // anime 2021
  for (let page = 1; page <= pages[2021]; page++) {
    const { data: indexHTML } = await fetch(
      `https://bgm.tv/anime/browser/airtime/2021?page=${page}`
    )
    data.push(...cheerio.cheerioIds(indexHTML))
  }
  write('./ids/anime-2021.json', data)
  data = []

  // anime rank
  for (let page = 1; page <= pages.anime; page++) {
    const { data: indexHTML } = await fetch(
      `https://bgm.tv/anime/browser?sort=rank&page=${page}`
    )
    data.push(...cheerio.cheerioIds(indexHTML))
  }
  write('./ids/anime-rank.json', data)
  data = []

  // book rank
  for (let page = 1; page <= pages.book; page++) {
    const { data: indexHTML } = await fetch(
      `https://bgm.tv/book/browser?sort=rank&page=${page}`
    )
    data.push(...cheerio.cheerioIds(indexHTML))
  }
  write('./ids/book-rank.json', data)
  data = []

  // music rank
  for (let page = 1; page <= pages.music; page++) {
    const { data: indexHTML } = await fetch(
      `https://bgm.tv/music/browser?sort=rank&page=${page}`
    )
    data.push(...cheerio.cheerioIds(indexHTML))
  }
  write('./ids/music-rank.json', data)
  data = []

  // game rank
  for (let page = 1; page <= pages.game; page++) {
    const { data: indexHTML } = await fetch(
      `https://bgm.tv/game/browser?sort=rank&page=${page}`
    )
    data.push(...cheerio.cheerioIds(indexHTML))
  }
  write('./ids/game-rank.json', data)
  data = []

  // real rank
  for (let page = 1; page <= pages.real; page++) {
    const { data: indexHTML } = await fetch(
      `https://bgm.tv/real/browser?sort=rank&page=${page}`
    )
    data.push(...cheerio.cheerioIds(indexHTML))
  }
  write('./ids/real-rank.json', data)
  data = []

  // // agefans
  // data = Object.keys(
  //   JSON.parse(fs.readFileSync('../Bangumi-Static/data/agefans/anime.min.json'))
  // ).map((id) => parseInt(id))
  // write('./ids/agefans.json', data)
  // data = []

  // // wk8
  // data = Object.keys(
  //   JSON.parse(fs.readFileSync('../Bangumi-Static/data/wenku8/wenku.min.json'))
  // ).map((id) => parseInt(id))
  // write('./ids/wk8.json', data)
  // data = []

  // // wk8 系列的第一个单行本的id 用于获取开始日期 基于上一步数据
  // Object.keys(
  //   JSON.parse(fs.readFileSync('../Bangumi-Static/data/wenku8/wenku.min.json'))
  // ).map((id) => {
  //   try {
  //     const filePath = `.//data/${Math.floor(id / 100)}/${id}.json`
  //     if (fs.existsSync(filePath)) {
  //       const subject = JSON.parse(fs.readFileSync(filePath))
  //       if (
  //         Array.isArray(subject.comic) &&
  //         subject.comic[0] &&
  //         subject.comic[0].id
  //       ) {
  //         data.push(parseInt(subject.comic[0].id))
  //       }
  //     }
  //   } catch (error) {}
  // })
  // write('./ids/wk8-series.json', data)
  data = []

  console.log('done')
})()

function write(filePath, data) {
  const dirPath = path.dirname(filePath)
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath)
  }

  console.log(`- writing ${filePath}`)
  fs.writeFileSync(
    filePath,
    JSON.stringify(Array.from(new Set(data)).sort((a, b) => a - b))
  )
}

/*
 * 获取比较有价值的条目id
 * @Author: czy0729
 * @Date: 2020-01-15 10:17:38
 * @Last Modified by: czy0729
 * @Last Modified time: 2022-04-13 04:36:35
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
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.88 Safari/537.36',
  Cookie:
    'chii_cookietime=2592000; chii_theme_choose=1; chii_theme=dark; prg_display_mode=normal; __utmz=1.1644620219.525.11.utmcsr=github.com|utmccn=(referral)|utmcmd=referral|utmcct=/czy0729/Bangumi/issues/44; chii_sec_id=UVGn9FS2nsZvmh%2BcOIKnzyRBqIjLVCA2pU2Rmw; chii_sid=YPppqx; __utma=1.1636245540.1617210056.1649706597.1649795563.590; __utmc=1; __utmt=1; chii_auth=HFY6j7UYdzcgGBjmaXNObFYXA5L0%2BYckjtOTDoVnP3uj9RYl6itIBDe%2FrulZGOcpzYo0iUiiNnjvsCCRRi3iUgV0rqi3ZEta%2Fr39; __utmb=1.2.10.1649795563',
}

const pages = {
  anime: 288, // https://bgm.tv/anime/browser?sort=rank&page=1
  book: 205, // https://bgm.tv/book/browser?sort=rank&page=1
  music: 200, // https://bgm.tv/music/browser?sort=rank&page=1
  game: 250, // https://bgm.tv/game/browser?sort=rank&page=1
  real: 97, // https://bgm.tv/real/browser?sort=rank&page=1

  2022: 19, // https://bgm.tv/anime/browser/airtime/2022?page=1
  2021: 37, // https://bgm.tv/anime/browser/airtime/2021?page=1
}

;(async () => {
  let filePath
  let data = []

  // bangumi-data
  bangumiData.items.forEach((item) => {
    const find = item.sites.find((i) => i.site === 'bangumi')
    if (find) data.push(parseInt(find.id))
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

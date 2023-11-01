/*
 * 获取比较有价值的条目id
 * @Author: czy0729
 * @Date: 2020-01-15 10:17:38
 * @Last Modified by: czy0729
 * @Last Modified time: 2023-10-31 18:09:59
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
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
  Cookie:
    '_ga=GA1.1.2037657089.1675671081; prg_list_mode=full; 2592000; chii_sec_id=zrBpW0j9%2FooIhKrPSOelBNSRRgVU9C0VfT0ssw4; chii_cookietime=2592000; chii_theme_choose=1; chii_theme=dark; _ga_1109JLGMHN=deleted; prg_display_mode=normal; chii_auth=FtYek6s8j%2FgmQZyD7QjbwBhe6nSwO1a%2BGnf8XivuU95ueOgAAKcyPKIVUMSkBze0vrqFp22HMoqCnAVyxD8zTleOXsbYbzrnybql; __utmc=1; chii_searchDateLine=0; __utmz=1.1698727868.5237.60.utmcsr=192.168.31.87:6006|utmccn=(referral)|utmcmd=referral|utmcct=/; chii_sid=060omO; __utma=1.825736922.1638495774.1698736511.1698746823.5239; __utmt=1; __utmb=1.38.10.1698746823; _ga_1109JLGMHN=GS1.1.1698746822.2134.1.1698746953.0.0.0',
}

const pages = {
  anime: 335, // https://bgm.tv/anime/browser?sort=rank&page=1
  book: 273, // https://bgm.tv/book/browser?sort=rank&page=1
  music: 239, // https://bgm.tv/music/browser?sort=rank&page=1
  game: 308, // https://bgm.tv/game/browser?sort=rank&page=1
  real: 115, // https://bgm.tv/real/browser?sort=rank&page=1
  // 2023: 13, // https://bgm.tv/anime/browser/airtime/2023?page=1
  // 2022: 39, // https://bgm.tv/anime/browser/airtime/2022?page=1
  // 2021: 39, // https://bgm.tv/anime/browser/airtime/2021?page=1
}

;(async () => {
  let filePath
  let data = []

  // // bangumi-data
  // bangumiData.items.forEach((item) => {
  //   const find = item.sites.find((i) => i.site === 'bangumi')
  //   if (find) data.push(parseInt(find.id))
  // })
  // write('./ids/anime-bangumi-data.json', data)
  // data = []

  // // anime 2023
  // for (let page = 1; page <= pages[2023]; page++) {
  //   const { data: indexHTML } = await fetch(
  //     `https://bgm.tv/anime/browser/airtime/2023?page=${page}`
  //   )
  //   data.push(...cheerio.cheerioIds(indexHTML))
  // }
  // write('./ids/anime-2023.json', data)
  // data = []

  // anime rank
  // for (let page = 1; page <= pages.anime; page++) {
  //   const { data: indexHTML } = await fetch(`https://bgm.tv/anime/browser?sort=rank&page=${page}`)
  //   data.push(...cheerio.cheerioIds(indexHTML))
  // }
  // write('./ids/anime-rank.json', data)
  // data = []

  // book rank
  for (let page = 1; page <= pages.book; page++) {
    const { data: indexHTML } = await fetch(`https://bgm.tv/book/browser?sort=rank&page=${page}`)
    data.push(...cheerio.cheerioIds(indexHTML))
  }
  write('./ids/book-rank.json', data)
  data = []

  // music rank
  for (let page = 1; page <= pages.music; page++) {
    const { data: indexHTML } = await fetch(`https://bgm.tv/music/browser?sort=rank&page=${page}`)
    data.push(...cheerio.cheerioIds(indexHTML))
  }
  write('./ids/music-rank.json', data)
  data = []

  // game rank
  for (let page = 1; page <= pages.game; page++) {
    const { data: indexHTML } = await fetch(`https://bgm.tv/game/browser?sort=rank&page=${page}`)
    data.push(...cheerio.cheerioIds(indexHTML))
  }
  write('./ids/game-rank.json', data)
  data = []

  // real rank
  for (let page = 1; page <= pages.real; page++) {
    const { data: indexHTML } = await fetch(`https://bgm.tv/real/browser?sort=rank&page=${page}`)
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
  fs.writeFileSync(filePath, JSON.stringify(Array.from(new Set(data)).sort((a, b) => a - b)))
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

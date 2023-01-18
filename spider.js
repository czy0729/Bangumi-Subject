/*
 * @Author: czy0729
 * @Date: 2020-01-14 18:51:27
 * @Last Modified by: czy0729
 * @Last Modified time: 2023-01-19 00:49:25
 */
const axios = require('axios')
const fs = require('fs')
const path = require('path')
const cheerio = require('./utils/cheerio')
const utils = require('./utils/utils')

axios.defaults.timeout = 8000

/* ==================== 修改配置 ==================== */
/* JSON.stringify({
  'User-Agent': navigator.userAgent,
  Cookie: document.cookie
}); */
const headers = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
  Cookie:
    'chii_cookietime=2592000; chii_theme_choose=1; prg_list_mode=full; prg_display_mode=normal; chii_theme=dark; chii_sec_id=8UldYJdl7G0GMY1%2FZKcdnBtEIqLM0JqD7R7GLw; __utmz=1.1672334900.2734.34.utmcsr=tongji.baidu.com|utmccn=(referral)|utmcmd=referral|utmcct=/; chii_auth=vUkTUXUI0EfE00tnBMTD2VVmmAxqK0st92qpELe5vkkCHJtsHy0tQ2rxfK2WtnBTuXbSinvreNJ1eyVuX8WKXUSc%2B5SWyQtnYbRn; __utmc=1; __utma=1.825736922.1638495774.1674053325.1674058456.2924; __utmb=1.3.10.1674058456; chii_sid=QtSPJB',
}
const accessToken = {
  token_type: 'Bearer',
  access_token: '4c6d68e83f8e42b80f30fbcf137c0baa8d3f2818',
}

const folder = 'data'
const queue = 4
const rewrite = true

/* ==================== 基本配置 ==================== */
const host = 'bgm.tv'
const startIndex = 0
const ids = [
  // ...JSON.parse(fs.readFileSync('./ids/anime-bangumi-data.json')),
  ...JSON.parse(fs.readFileSync('./ids/anime-2023.json')),
  // ...JSON.parse(fs.readFileSync('./ids/anime-2022.json')),
  // ...JSON.parse(fs.readFileSync('./ids/anime-rank.json')),
  // ...JSON.parse(fs.readFileSync('./ids/book-rank.json')),
  // ...JSON.parse(fs.readFileSync('./ids/game-rank.json')),
  // ...JSON.parse(fs.readFileSync('./ids/music-rank.json')),
  // ...JSON.parse(fs.readFileSync('./ids/real-rank.json')),
  // ...JSON.parse(fs.readFileSync('./ids/agefans.json')),
  // ...JSON.parse(fs.readFileSync('./ids/wk8.json')),
  // ...JSON.parse(fs.readFileSync('./ids/wk8-series.json')),
  // ...JSON.parse(fs.readFileSync('./ids/manga.json')),
  // ...JSON.parse(fs.readFileSync('./ids/manga-series.json')),
].sort((a, b) => b - a)

/* ==================== 主要逻辑 ==================== */
async function fetchSubject(id, index) {
  try {
    const filePath = `./${folder}/${Math.floor(id / 100)}/${id}.json`
    const exists = fs.existsSync(filePath)
    if (!rewrite && exists) return true

    const apiDS = await request(`https://api.bgm.tv/v0/subjects/${id}`)
    const epsDS = await request(`https://api.bgm.tv/v0/episodes?subject_id=${id}`)
    const crtDS = await request(`https://api.bgm.tv/v0/subjects/${id}/characters`)
    const staffDS = await request(`https://api.bgm.tv/v0/subjects/${id}/persons`)
    const { data: html } = await axios({
      url: `https://${host}/subject/${id}`,
      headers,
    })
    const htmlDS = cheerio.cheerioSubjectFormHTML(html)

    const data = {
      id: apiDS.id,
      type: apiDS.type,
      name: apiDS.name,
      name_cn: apiDS.name_cn,
      date: apiDS.date,
    }

    if (apiDS.images?.medium) data.image = sImage(apiDS.images.medium)
    if (apiDS.rating) data.rating = apiDS.rating
    if (apiDS.summary) data.summary = apiDS.summary
    if (htmlDS.info) data.info = htmlDS.info
    if (apiDS.collection) data.collection = apiDS.collection
    if (htmlDS.tags && htmlDS.tags.length) data.tags = htmlDS.tags

    if (epsDS?.data?.length) {
      data.eps = epsDS.data.map((item) => ({
        id: item.id,
        url: `http://bgm.tv/ep/${item.id}`,
        type: item.type,
        sort: item.sort,
        name: item.name,
        name_cn: item.item_cn,
        duration: item.duration,
        airdate: item.airdate,
        comment: item.comment,
        desc: item.desc,
      }))
    }

    if (htmlDS.disc && htmlDS.disc.length) data.disc = htmlDS.disc

    if (crtDS?.length) {
      data.crt = crtDS.map((item) => ({
        id: item.id || '',
        image: sImage(item?.images?.grid),
        name: item.name || '',
        desc: item?.actors?.[0]?.name || item?.relation || '',
      }))
    }

    if (staffDS?.length) {
      data.staff = staffDS
        .sort((a, b) => b.type - a.type)
        .map((item) => ({
          id: item.id || '',
          image: sImage(item?.images?.grid),
          name: item.name || '',
          desc: item?.relation || '',
        }))
    }

    if (htmlDS.relations && htmlDS.relations.length) {
      data.relations = htmlDS.relations
    }

    if (htmlDS.comic && htmlDS.comic.length) data.comic = htmlDS.comic
    if (htmlDS.like && htmlDS.like.length) data.like = htmlDS.like
    if (htmlDS.lock) data.lock = htmlDS.lock

    const dirPath = path.dirname(filePath)
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath)
    }

    console.log(
      `- ${exists ? 're' : ''}writing ${filePath} [${index} / ${ids.length}]`,
      data.name,
      data.rating.rank,
      data.rating.score
    )
    fs.writeFileSync(filePath, utils.decode(utils.safeStringify(data)))

    return true
  } catch (error) {
    console.log('\x1b[40m \x1b[31m[RETRY] ' + id + '.json [' + index + ' / ' + ids.length + '] \x1b[0m')
  }
}

const fetchs = ids.map((id, index) => () => {
  if (index < startIndex) return true
  return fetchSubject(id, index)
})
utils.queue(fetchs, queue)

/* ==================== 工具函数 ==================== */
function safe(data) {
  if (data instanceof Object) {
    Object.keys(data).forEach((k) => (data[k] = safe(data[k])))
  }
  return data === null ? '' : data
}

async function request(url) {
  axios.defaults.withCredentials = false

  try {
    const { data } = await axios({
      method: 'get',
      url: `${url}${url.includes('?') ? '&' : '?'}app_id=bgm8885c4d524cd61fc`,
      headers: {
        Authorization: `${accessToken.token_type} ${accessToken.access_token}`,
        'User-Agent': 'czy0729/Bangumi/1.1.0 NodeJs',
      },
    })
    return safe(data)
  } catch (ex) {
    console.log(ex)
  }
}

function sImage(str = '') {
  return str.replace('https:', '').split('?')[0]
}

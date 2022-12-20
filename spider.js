/*
 * @Author: czy0729
 * @Date: 2020-01-14 18:51:27
 * @Last Modified by: czy0729
 * @Last Modified time: 2022-12-13 12:06:45
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
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
  Cookie:
    'chii_cookietime=2592000; chii_theme_choose=1; prg_list_mode=full; prg_display_mode=normal; __utmz=1.1668847891.2436.33.utmcsr=tongji.baidu.com|utmccn=(referral)|utmcmd=referral|utmcct=/; chii_theme=dark; chii_sec_id=8UldYJdl7G0GMY1%2FZKcdnBtEIqLM0JqD7R7GLw; chii_auth=f2Mhbx5YywElNuPWx7IH6JOQPLKARggABB9a963p6jPQ%2F35F1ZWLM%2BNT0%2Bv6EBARGCFEFEV4Q0%2FwnoxgBFKaLqqmm12sYPaMxB%2FA; __utma=1.825736922.1638495774.1670896605.1670898719.2624; __utmc=1; chii_sid=yyD1ZM; __utmt=1; __utmb=1.4.10.1670898719',
}
const accessToken = {
  token_type: 'Bearer',
  access_token: 'e3fbab004fc277abf9ed515db2669af93b30ef4a',
}

const folder = 'data'
const queue = 4
const rewrite = false

/* ==================== 基本配置 ==================== */
const host = 'bgm.tv'
const startIndex = 0
const ids = [
  ...JSON.parse(fs.readFileSync('./ids/anime-bangumi-data.json')),
  ...JSON.parse(fs.readFileSync('./ids/anime-2023.json')),
  ...JSON.parse(fs.readFileSync('./ids/anime-2022.json')),
  ...JSON.parse(fs.readFileSync('./ids/anime-rank.json')),
  ...JSON.parse(fs.readFileSync('./ids/book-rank.json')),
  ...JSON.parse(fs.readFileSync('./ids/game-rank.json')),
  ...JSON.parse(fs.readFileSync('./ids/music-rank.json')),
  ...JSON.parse(fs.readFileSync('./ids/real-rank.json')),
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
    const epsDS = await request(
      `https://api.bgm.tv/v0/episodes?subject_id=${id}`
    )
    const crtDS = await request(
      `https://api.bgm.tv/v0/subjects/${id}/characters`
    )
    const staffDS = await request(
      `https://api.bgm.tv/v0/subjects/${id}/persons`
    )
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
    console.log(
      '\x1b[40m \x1b[31m[RETRY] ' +
        id +
        '.json [' +
        index +
        ' / ' +
        ids.length +
        '] \x1b[0m'
    )
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
        'User-Agent': 'czy0729/Bangumi/1.1.0 NodeJs'
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

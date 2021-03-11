/*
 * @Author: czy0729
 * @Date: 2020-01-14 18:51:27
 * @Last Modified by: czy0729
 * @Last Modified time: 2021-03-09 15:35:52
 */
const axios = require('axios')
const fs = require('fs')
const path = require('path')
const cheerio = require('./utils/cheerio')
const utils = require('./utils/utils')

axios.defaults.timeout = 3000

const host = 'bgm.tv'
const rewrite = true
const startIndex = 0
const queue = 8
const ids = [
  ...JSON.parse(fs.readFileSync('./ids/anime-2021.json')),
  ...JSON.parse(fs.readFileSync('./ids/anime-2020.json')),
  ...JSON.parse(fs.readFileSync('./ids/anime-rank.json')),
  ...JSON.parse(fs.readFileSync('./ids/anime-bangumi-data.json')),
  ...JSON.parse(fs.readFileSync('./ids/book-rank.json')),
  ...JSON.parse(fs.readFileSync('./ids/book-2021.json')),
  ...JSON.parse(fs.readFileSync('./ids/book-2020.json')),
  ...JSON.parse(fs.readFileSync('./ids/game-rank.json')),
  ...JSON.parse(fs.readFileSync('./ids/game-2021.json')),
  ...JSON.parse(fs.readFileSync('./ids/game-2020.json')),
  ...JSON.parse(fs.readFileSync('./ids/music-rank.json')),
  ...JSON.parse(fs.readFileSync('./ids/music-2021.json')),
  ...JSON.parse(fs.readFileSync('./ids/music-2020.json')),
  ...JSON.parse(fs.readFileSync('./ids/real-rank.json')),
  ...JSON.parse(fs.readFileSync('./ids/real-2021.json')),
  ...JSON.parse(fs.readFileSync('./ids/real-2020.json')),
  ...JSON.parse(fs.readFileSync('./ids/agefans.json')),
  ...JSON.parse(fs.readFileSync('./ids/wk8.json')),
  ...JSON.parse(fs.readFileSync('./ids/wk8-series.json')),
  ...JSON.parse(fs.readFileSync('./ids/manga.json')),
  ...JSON.parse(fs.readFileSync('./ids/manga-series.json')),
]

/*
JSON.stringify({
  'User-Agent': navigator.userAgent,
  Cookie: document.cookie
});
*/
const headers = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_2_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36',
  Cookie:
    'chii_cookietime=2592000; chii_theme_choose=1; prg_list_mode=full; __utmz=1.1612160564.2339.91.utmcsr=tongji.baidu.com|utmccn=(referral)|utmcmd=referral|utmcct=/; chii_auth=c4FiqgObR%2FXJ26tl%2F9opjFXDLxrn8gLB5gBETG41W2zT0s0ud9xwFwlGGS5gUcmtupMxhdjAXMxmMtsQGmOk4V55FX2GcdxVe4lA; chii_theme=dark; __utmc=1; chii_searchDateLine=0; prg_display_mode=normal; chii_sid=tv98Dd; __utma=1.7292625.1567003648.1615271791.1615275318.2481; __utmt=1; __utmb=1.1.10.1615275318',
}

async function fetchSubject(id, index) {
  try {
    const filePath = `./data/${Math.floor(id / 100)}/${id}.json`
    const exists = fs.existsSync(filePath)
    if (!rewrite && exists) return true

    const { data: html } = await axios({
      url: `https://${host}/subject/${id}`,
      headers,
    })
    const htmlDS = cheerio.cheerioSubjectFormHTML(html)
    const { data: apiDS } = await axios({
      url: `https://api.bgm.tv/subject/${id}?responseGroup=large`,
    })

    // 基本
    const data = {
      id: apiDS.id,
      type: apiDS.type,
      name: apiDS.name,
    }
    if (apiDS.images && apiDS.images.medium)
      data.image = utils.smallImage(apiDS)
    if (apiDS.rating) data.rating = apiDS.rating

    // 详情
    if (apiDS.summary) data.summary = apiDS.summary
    if (htmlDS.info) data.info = htmlDS.info

    // 条目收藏数章节等
    if (apiDS.collection) data.collection = apiDS.collection
    if (htmlDS.tags && htmlDS.tags.length) data.tags = htmlDS.tags
    if (apiDS.eps && apiDS.eps.length) data.eps = apiDS.eps
    if (htmlDS.disc && htmlDS.disc.length) data.disc = htmlDS.disc

    // 人物
    if (apiDS.crt && apiDS.crt.length) {
      data.crt = apiDS.crt.map((item) => ({
        id: item.id || '',
        image: utils.smallImage(item, 'grid'),
        name: item.name_cn || item.name || '',
        desc:
          (item.actors && item.actors[0] && item.actors[0].name) ||
          item.role_name ||
          '',
      }))
    }
    if (apiDS.staff && apiDS.staff.length) {
      data.staff = apiDS.staff.map((item) => ({
        id: item.id || '',
        image: utils.smallImage(item, 'grid'),
        name: item.name_cn || item.name || '',
        desc: (item.jobs && item.jobs[0]) || '',
      }))
    }

    // 关联
    if (htmlDS.relations && htmlDS.relations.length)
      data.relations = htmlDS.relations
    if (htmlDS.comic && htmlDS.comic.length) data.comic = htmlDS.comic
    if (htmlDS.like && htmlDS.like.length) data.like = htmlDS.like

    // 锁定
    if (htmlDS.lock) data.lock = htmlDS.lock
    // data._loaded = utils.getTimestamp()

    const dirPath = path.dirname(filePath)
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath)
    }

    console.log(
      `- ${exists ? 're' : ''}writing ${id}.json [${index} / ${ids.length}]`,
      data.name
    )
    fs.writeFileSync(filePath, utils.decode(utils.safeStringify(data)))

    return true
  } catch (error) {
    const msg =
      '\x1b[40m \x1b[31m[RETRY] ' +
      id +
      '.json [' +
      index +
      ' / ' +
      ids.length +
      '] \x1b[0m'
    console.log(msg)
    return fetchSubject(id, index)
  }
}

const fetchs = ids.map((id, index) => () => {
  if (index < startIndex) return true
  return fetchSubject(id, index)
})
utils.queue(fetchs, queue)

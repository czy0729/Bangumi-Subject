/*
 * @Author: czy0729
 * @Date: 2020-01-14 18:51:27
 * @Last Modified by: czy0729
 * @Last Modified time: 2021-12-31 07:38:36
 */
const axios = require('axios')
const fs = require('fs')
const path = require('path')
const cheerio = require('./utils/cheerio')
const utils = require('./utils/utils')

axios.defaults.timeout = 3000

// settings
const host = 'bgm.tv'
const rewrite = true
const index = 337455
const startIndex = 282580
const queue = 6

// navigator.userAgent
// document.cookie
const headers = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
  Cookie:
    'chii_sec_id=pG5Jgrb5v3PhSnN%2B9S%2Bj0sTJQGDkbMC5jU2SCGE; chii_cookietime=2592000; chii_theme_choose=1; __utmz=1.1626708381.273.9.utmcsr=tongji.baidu.com|utmccn=(referral)|utmcmd=referral|utmcct=/; prg_display_mode=normal; chii_theme=dark; chii_auth=kTryE60lfNJ8LkW7SDTpUhf%2FcHK1kCSU99u5EmBuGDSVmtOfpUmVi1YLxpAT%2FPFvR%2B3p8VwETj2vFbIfw%2FujdCuTivdxlB%2FwFtTr; __utmc=1; chii_searchDateLine=0; chii_sid=88NJF5; __utma=1.1636245540.1617210056.1640904907.1640907491.377; __utmt=1; __utmb=1.1.10.1640907491',
}

// console speed
const speed = {
  0: 0,
  1: 0,
}
let currentIndex = 0
setInterval(() => {
  if (currentIndex === 1) {
    currentIndex = 0
  } else {
    currentIndex += 1
  }

  console.log(`- speed ${(speed[currentIndex] / 3).toFixed(1)}/s`)
  speed[currentIndex] = 0
}, 3000)

// queue fetch
const ids = []
for (let i = startIndex; i <= index; i += 1) {
  ids.push(i)
}

async function fetchSubject(id, index) {
  try {
    const filePath = `./data/${Math.floor(id / 100)}/${id}.json`
    const exists = fs.existsSync(filePath)
    if (!rewrite && exists) {
      return true
    }

    try {
      if (exists) {
        const data = JSON.parse(fs.readFileSync(filePath))
        if (!data.name || data.name === '坟场') {
          return true
        }
      }
    } catch (error) {
      return true
    }

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
      `- ${exists ? 're' : ''}writing ${id}.json [${index} / ${ids.length}] ${(
        (index / ids.length) *
        100
      ).toFixed(1)}%`,
      data.name
    )
    fs.writeFileSync(filePath, utils.decode(utils.safeStringify(data)))
    speed[currentIndex] += 1

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

const fetchs = ids.map((id, index) => () => fetchSubject(id, index))
utils.queue(fetchs, queue)

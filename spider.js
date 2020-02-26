/*
 * @Author: czy0729
 * @Date: 2020-01-14 18:51:27
 * @Last Modified by: czy0729
 * @Last Modified time: 2020-02-26 10:14:00
 */
const axios = require('axios')
const fs = require('fs')
const path = require('path')
const cheerio = require('./utils/cheerio')
const utils = require('./utils/utils')

const rewrite = false
const headers = {
  Cookie:
    'chii_cookietime=2592000; chii_theme_choose=1; chii_theme=dark; prg_list_mode=full; chii_auth=ZY2amn%2BLt1ROA%2FCEeyOgKmOXaDB6bK1eDVFhsnnTyW%2BBVTY7P8BONkqtutFKRpZq1PeIzu%2BvRC9cmeW98OQ4xa%2FT1Q%2F3CIuBbKYR; prg_display_mode=normal; __utmc=1; __utmz=1.1582048403.776.48.utmcsr=tongji.baidu.com|utmccn=(referral)|utmcmd=referral|utmcct=/web/28208841/overview/index; chii_sid=7ENMG0; __utma=1.7292625.1567003648.1582165918.1582168700.785; __utmt=1; __utmb=1.1.10.1582168700',
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36'
}
const ids = JSON.parse(fs.readFileSync('./ids/anime-rank.json'))

function fetchSubject(id, index) {
  return new Promise(async (resolve, reject) => {
    const filePath = `./data/${Math.floor(id / 100)}/${id}.json`
    if (!rewrite && fs.existsSync(filePath)) {
      // console.log(`- skip ${id}.json [${index} / ${ids.length}]`)
      return resolve(true)
    }

    const { data: apiDS } = await axios({
      url: `https://api.bgm.tv/subject/${id}?responseGroup=large`
    })

    const { data: html } = await axios({
      url: `https://bangumi.tv/subject/${id}`,
      headers
    })
    const htmlDS = cheerio.cheerioSubjectFormHTML(html)

    // 基本
    const data = {
      id: apiDS.id,
      type: apiDS.type,
      name: apiDS.name
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
      data.crt = apiDS.crt.map(item => ({
        id: item.id || '',
        image: utils.smallImage(item, 'grid'),
        name: item.name_cn || item.name || '',
        desc:
          (item.actors && item.actors[0] && item.actors[0].name) ||
          item.role_name ||
          ''
      }))
    }
    if (apiDS.staff && apiDS.staff.length) {
      data.staff = apiDS.staff.map(item => ({
        id: item.id || '',
        image: utils.smallImage(item, 'grid'),
        name: item.name_cn || item.name || '',
        desc: (item.jobs && item.jobs[0]) || ''
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

    console.log(`- writing ${id}.json [${index} / ${ids.length}]`)
    fs.writeFileSync(filePath, utils.safeStringify(data))

    return resolve(true)
  })
}

const fetchs = ids.map((id, index) => () => fetchSubject(id, index))
utils.queue(fetchs, 4)

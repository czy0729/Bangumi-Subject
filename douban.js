/*
 * @Author: czy0729
 * @Date: 2022-10-13 08:07:46
 * @Last Modified by: czy0729
 * @Last Modified time: 2022-10-16 07:12:21
 */
const axios = require('axios')
const fs = require('fs')
const path = require('path')
const utils = require('./utils/utils')

axios.defaults.timeout = 3000

const headers = {
  Cookie:
    'll="118281"; bid=lQqP34SvXhs; douban-fav-remind=1; __utmv=30149280.16312; gr_user_id=0f6e6ad8-3475-4274-93d8-f5b21a1a4f0b; viewed="35079800_25753662_35218831_34893998_35768338"; push_doumail_num=0; push_noty_num=0; __utmz=30149280.1665723912.84.42.utmcsr=douban.com|utmccn=(referral)|utmcmd=referral|utmcct=/search; _pk_ref.100001.8cb4=%5B%22%22%2C%22%22%2C1665797562%2C%22https%3A%2F%2Fwww.baidu.com%2Flink%3Furl%3DQ18a4JrRtRl5UUWy7oAJJ-BmdK93daJmKInUtp6o0ykUKO13Hxpjnm2u-OOsjIg2S5qtpgoHA_yRLXyoQTfRnq%26wd%3D%26eqid%3D895ed37000039a9200000006631ac0d7%22%5D; _pk_ses.100001.8cb4=*; __utma=30149280.1296492991.1638587691.1665733438.1665797563.88; __utmc=30149280; dbcl2="163125154:MLdP7+udRWQ"; ck=FsSt; ap_v=0,6.0; _pk_id.100001.8cb4=3911203d6c987231.1638646313.67.1665801300.1665733603.; __utmt=1; __utmb=30149280.11.10.1665797563',
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36',
}

const __raw = './douban/raw.json'
const __subject = (id) => `./data/${Math.floor(id / 100)}/${id}.json`
const __search = (id) => `./douban/search/${Math.floor(id / 100)}/${id}.json`
const raw = read(__raw)
const ids = read('./ids/real-rank.json') // './ids/anime-rank.json'

;(async () => {
  for (let i = 0; i <= ids.length; i += 1) {
    const id = ids[i]
    try {
      if (raw[id]?.douban?.id) {
        continue
      }

      const filePath = __subject(id)
      if (!fs.existsSync(filePath)) {
        continue
      }

      const searchFilePath = __search(id)
      const dirPath = path.dirname(searchFilePath)
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath)
      }

      const { name_cn, name, date, info = '', staff = [] } = read(filePath)

      let list = []
      if (fs.existsSync(searchFilePath)) {
        list = read(searchFilePath)
      } else if (!list.length) {
        if (searchFilePath.includes('suggest')) {
          list = await search2((name_cn || name).split('/')[0])
        } else {
          list = await search((name_cn || name).split('/')[0])
        }
        console.log('list.length', list.length)

        fs.writeFileSync(searchFilePath, JSON.stringify(list, null, 2))
        await utils.sleep(1500)
      }

      const director = utils.t2s(staff.find((item) => item.desc === '导演')?.name || '')
      let result = matchMovie(name_cn, list, name, date, director)
      if (!result?.douban?.id) {
        const match = info.match(
          /<li><span>别名: <\/span>(.+?)<\/li>|<li><span style=\"visibility:hidden;\">别名: <\/span>(.+?)<\/li>/g
        )
        if (match?.length) {
          match.forEach((item) => {
            if (result?.douban?.id) return
            const alias = item.replace(
              /<li><span>别名: <\/span>|<li><span style=\"visibility:hidden;\">别名: <\/span>|<\/li>/g,
              ''
            )
            result = matchMovie(alias, list, alias, date)
          })
        }
      }

      raw[id] = {
        id,
        name: name_cn || name,
        date,
        ...result,
      }
      console.log(
        `${i + 1} / ${ids.length}`,
        name_cn || name,
        result,
        list.length,
        searchFilePath,
        `https://bgm.tv/subject/${id}`,
        director
      )

      if (i && i % 20 === 0) {
        fs.writeFileSync(__raw, JSON.stringify(raw, null, 2))
      }
    } catch (error) {
      if (String(error).includes('Unexpected token')) {
        continue
      }

      await utils.sleep(1000)
      continue
    }
  }

  fs.writeFileSync(__raw, JSON.stringify(raw, null, 2))
})()

async function search(q, cat) {
  console.log(`https://www.douban.com/search?cat=1002&q=${q}`)

  const { data: html } = await axios({
    url: `https://www.douban.com/search?cat=1002&q=${encodeURIComponent(q)}`,
    headers: {
      ...headers,
      Host: 'www.douban.com',
    },
  })
  const $ = utils.cheerio(html)
  const _q = removeSpecial(q)
  return (
    $('.result .content')
      .map((index, element) => {
        const $row = utils.cheerio(element)
        const $a = $row.find('h3 a')
        return {
          id: $a.attr('onclick').match(/sid: (\d+)/)?.[1],
          title: $a.text().trim(),
          desc: $row.find('p').text().trim(),
          year: $row.find('.subject-cast').text().trim().match(/\d{4}/g)?.[0] || '',
        }
      })
      .get() || []
  )
    .filter((item) => item.id)
    .sort((a, b) => {
      const at = removeSpecial(a.title)
      const bt = removeSpecial(b.title)
      return similar(bt, _q) - similar(at, _q)
    })
}

async function search2(q, cat) {
  console.log(`https://www.douban.com/j/search_suggest?debug=true&q=${q}`)

  const { data } = await axios({
    url: `https://www.douban.com/j/search_suggest?debug=true&q=${encodeURIComponent(q)}`,
    headers: {
      ...headers,
      Host: 'www.douban.com',
    },
  })

  const list = []
  if (data?.cards?.length) {
    data.cards.forEach((item) => {
      list.push({
        id: item.url.match(/\d+/g)?.[0],
        title: item.title,
        desc: item.card_subtitle,
        year: item.year,
      })
    })
  }

  return list
}

function matchMovie(q, result, jp, date, director) {
  const SIMILAR_RATE = 0.55
  const _q = removeSpecial(q || jp).toUpperCase()
  let douban = {}
  let reason = ''

  // 先匹配标题
  result.forEach((item) => {
    if (douban.id) return

    if (!matchYear(date, item.year)) {
      reason = '年份不匹配'
      return
    }

    const title = removeSpecial(item.title)
    const desc = removeSpecial(item.desc)
    // if (director && !desc.includes(director)) {
    //   reason = '导演不匹配'
    //   return
    // }

    const s = similar(title, _q)
    if (result.length <= 2 && director && desc.includes(director) && matchYear(date, item.year)) {
      //
    } else {
      if (result.length === 1) {
        if (matchYear(date, item.year)) {
          //
        } else if (!title.includes(_q) && s <= SIMILAR_RATE) {
          reason = `结果为单，没有全包含，${s} | ${title} | ${_q}`
          return
        }
      } else {
        if (title.length >= 5 && _q.length >= 5 && s <= 0.7) {
          reason = `结果为多，没有大部分包含，${s} | ${title} | ${_q}`
          return
        }

        if (s < SIMILAR_RATE) {
          if (!desc.includes(_q)) {
            reason = '描述不包含'
            return
          } else {
            const _jp = removeSpecial(item.desc).split(' / ')[0].replace('原名', '')
            if (similar(_jp, jp || q) < 0.7) {
              reason = '日文相似度不足'
              return
            }
          }
        }
      }
    }

    reason = ''
    douban = item
  })

  return {
    douban,
    reason: result.length ? reason : '没有结果',
  }
}

function removeSpecial(str) {
  return String(str)
    .replace(/ |(&amp;)|-|：|:|\/|《|》|（|）|“|”|，|。|！|？|之|第|卷|期|章|季|版|剧场|电影|\d{4}/g, '')
    .replace('一', '1')
    .replace('二', '2')
    .replace('三', '3')
}

function read(dir) {
  const str = fs.readFileSync(dir, 'utf-8')
  try {
    return JSON.parse(str)
  } catch (error) {
    const name = str.match(/,"name":"(.+?)",/)?.[1] || ''
    const name_cn = str.match(/,"name_cn":"(.+?)",/)?.[1] || ''
    const date = str.match(/,"date":"(.+?)",/)?.[1] || ''
    const info = str.match(/,"info":"(.+?)",/)?.[1] || ''
    let staff = []
    try {
      staff = JSON.parse(`[${str.match(/"staff":\[(.+?)\]/)[1]}]`)
    } catch (error) {}

    console.log({
      name,
      name_cn,
      date,
      staff: staff.length,
    })
    return {
      name,
      name_cn,
      date,
      info,
      staff,
    }
  }
}

function matchYear(date, year) {
  if (!date || !year) return false

  const prev = String(Number(year) - 1)
  const next = String(Number(year) + 1)
  return date.includes(year) || date.includes(prev) || date.includes(next)
}

function similar(s, t, f) {
  if (!s || !t) return 0

  s = s.toUpperCase()
  t = t.toUpperCase()

  const l = s.length > t.length ? s.length : t.length
  const n = s.length
  const m = t.length
  const d = []

  f = f || 3
  const min = (a, b, c) => (a < b ? (a < c ? a : c) : b < c ? b : c)

  let i
  let j
  let si
  let tj
  let cost
  if (n === 0) return m
  if (m === 0) return n
  for (i = 0; i <= n; i += 1) {
    d[i] = []
    d[i][0] = i
  }
  for (j = 0; j <= m; j += 1) {
    d[0][j] = j
  }
  for (i = 1; i <= n; i += 1) {
    si = s.charAt(i - 1)
    for (j = 1; j <= m; j += 1) {
      tj = t.charAt(j - 1)
      if (si === tj) {
        cost = 0
      } else {
        cost = 1
      }
      d[i][j] = min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost)
    }
  }
  const res = 1 - d[n][m] / l
  return res.toFixed(f)
}

/*
 * @Author: czy0729
 * @Date: 2020-01-14 19:30:54
 * @Last Modified by: czy0729
 * @Last Modified time: 2020-01-15 10:21:30
 */
const utils = require('./utils')
const match = require('./match')
const decoder = require('./decoder')

const HOST = 'https://bgm.tv'

function cheerioSubjectFormHTML(HTML) {
  const $ = utils.cheerio(HTML)
  let relationsType

  // 曲目列表
  const disc = []
  $('div.line_detail > ul.line_list_music > li').each((index, element) => {
    const $row = utils.cheerio(element)
    if ($row.attr('class') === 'cat') {
      disc.push(
        utils.safeObject({
          title: $row.text(),
          disc: []
        })
      )
    } else {
      const $a = $row.find('h6 > a')
      disc[disc.length - 1].disc.push(
        utils.safeObject({
          title: $a.text(),
          href: $a.attr('href')
        })
      )
    }
  })

  // 标签
  const tags =
    $('div.subject_tag_section > div.inner > a.l')
      .map((index, element) => {
        const $row = utils.cheerio(element)
        return utils.safeObject({
          name: $row.find('span').text(),
          count: parseInt($row.find('small').text())
        })
      })
      .get() || []

  // 关联条目
  const relations =
    $('div.content_inner > ul.browserCoverMedium > li')
      .map((index, element) => {
        const $row = utils.cheerio(element)
        const $title = $row.find('a.title')
        const id = parseInt(match.matchSubjectId($title.attr('href')))
        const type = $row.find('span.sub').text()
        if (type) {
          relationsType = type
        }
        return utils.safeObject({
          id,
          image: match.matchCover($row.find('span.avatarNeue').attr('style')),
          title: $title.text(),
          type: relationsType,
          url: `${HOST}/subject/${id}`
        })
      })
      .get() || []

  // 单行本
  const comic =
    $('div.subject_section > ul.browserCoverSmall > li')
      .map((index, element) => {
        const $row = utils.cheerio(element)
        const $a = $row.find('a')
        return utils.safeObject({
          id: parseInt(match.matchSubjectId($a.attr('href'))),
          name: $a.attr('title') || $row.find('a.title').text(),
          image: utils.getCoverMedium(
            match.matchCover($row.find('span').attr('style'))
          )
        })
      })
      .get() || []

  // 猜你喜欢
  const like =
    $('div.content_inner > ul.coversSmall > li.clearit')
      .map((index, element) => {
        const $row = utils.cheerio(element)
        const $a = $row.find('a')
        return utils.safeObject({
          id: parseInt(match.matchSubjectId($a.attr('href'))),
          name: $a.attr('title') || $row.find('a.l').text(),
          image: match.matchCover($row.find('span').attr('style'))
        })
      })
      .get() || []

  // 用户动态
  // const who =
  //   $("#subjectPanelCollect li.clearit")
  //     .map((index, element) => {
  //       const $row = utils.cheerio(element);
  //       const $a = $row.find("a.avatar");
  //       return utils.safeObject({
  //         avatar: match.matchAvatar($row.find("span.avatarNeue").attr("style")),
  //         name: $a.text(),
  //         userId: match.matchUserId($a.attr("href")),
  //         star: match.matchStar($row.find("span.starlight").attr("class")),
  //         status: $row.find("small.grey").text()
  //       });
  //     })
  //     .get() || [];

  // 详情
  const info = $('#infobox')
    .html()
    .replace(/\n/g, '')
    .replace(/ class="(.+?)"/g, '')
    .replace(/ title="(.+?)"/g, '')
    .replace(/>( +)</g, '><')
    .trim()

  // 锁定
  const lock = $('div.tipIntro > div.inner > h3').text()

  return {
    info: decoder.decoder(info),
    tags,
    disc,
    relations,
    comic,
    like,
    // who,
    lock
  }
}

function cheerioIds(HTML) {
  const $ = utils.cheerio(HTML)
  const ids =
    $('ul.browserFull > li')
      .map((index, element) => {
        const $li = utils.cheerio(element)
        return parseInt($li.attr('id').replace('item_', ''))
      })
      .get() || []
  return ids
}

module.exports = {
  cheerioSubjectFormHTML,
  cheerioIds
}

/*
 * @Author: czy0729
 * @Date: 2020-01-14 19:28:31
 * @Last Modified by: czy0729
 * @Last Modified time: 2020-01-15 09:52:49
 */
function matchAvatar(str = '', start = 22) {
  const index = str.indexOf('?')
  return str.substring(start, index === -1 ? str.length - 2 : index)
}

function matchUserId(str = '') {
  return str.substring(str.lastIndexOf('/') + 1)
}

function matchSubjectId(str = '') {
  return str.substring(str.lastIndexOf('/') + 1)
}

function matchCover(str = '') {
  // eslint-disable-next-line quotes
  if (str === "background-image:url('/img/no_icon_subject.png')") {
    return ''
  }
  return str.substring(22, str.length - 2)
}

function matchStar(str = '') {
  return str.substring(15)
}

module.exports = {
  matchAvatar,
  matchUserId,
  matchSubjectId,
  matchCover,
  matchStar
}

/*
 * @Author: czy0729
 * @Date: 2023-10-31 13:53:18
 * @Last Modified by: czy0729
 * @Last Modified time: 2023-11-01 11:34:00
 */
const fs = require('fs')

/** 当前条目类型 */
const TYPE = 'real'

/** 参与统计的条目 */
const IDS = JSON.parse(fs.readFileSync(`./ids/${TYPE}-rank.json`))

/** 条目中该标签需要大于这个数目才参与统计 */
const TAG_COUNT_LIMIT = TYPE === 'anime' ? 20 : 8

/** 统计后至少有这个数目的条目的标签才保留数据 */
const LEN_LIMIT = TYPE === 'anime' ? 12 : 6

/** 分类排行榜统计数据 */
const typerank = {}

/** 分类排行榜统计条目列表 */
const typerankSubjectIds = {}

/** 主逻辑 */
;(() => {
  for (let i = 0; i < IDS.length; i += 1) {
    const id = IDS[i]
    if (!id) continue

    try {
      const filePath = `./data/${Math.floor(id / 100)}/${id}.json`
      const { rating, tags } = JSON.parse(fs.readFileSync(filePath))
      if (!rating?.rank || !tags.length) continue

      tags.forEach((item) => {
        const { name, count } = item
        if (!name || count < TAG_COUNT_LIMIT) return

        if (!typerank[name]) typerank[name] = []
        typerank[name].push({
          id,
          rank: rating.rank,
        })
      })
    } catch (error) {
      console.log('[error]', id)
      continue
    }
  }

  Object.keys(typerank).forEach((key) => {
    if (typerank[key].length < LEN_LIMIT) {
      delete typerank[key]
      return
    }

    typerankSubjectIds[key] = []
    typerank[key]
      .sort((a, b) => a.rank - b.rank)
      .forEach((item) => {
        if (typerankSubjectIds[key].length < 100) {
          typerankSubjectIds[key].push(item.id)
        }
      })

    // 减少数据大小, 但是不会过分影响实际时候时的百分比计算
    typerank[key] = deleteElements(typerank[key]).map((item) => item.rank)
  })

  fs.writeFileSync(`./typerank/${TYPE}.json`, JSON.stringify(typerank))
  fs.writeFileSync(`./typerank/${TYPE}-ids.json`, JSON.stringify(typerankSubjectIds))
  // fs.writeFileSync(
  //   './typerank/typerank.json',
  //   `\{${Object.keys(typerank)
  //     .map((key) => `"${key}":${JSON.stringify(typerank[key])}`)
  //     .join(',\n')}\}`
  // )
})()

/** 平均分布减少数据 */
function deleteElements(array, limit = 20) {
  if (array.length <= limit) {
    return array // 如果数组长度小于等于limit，则直接返回原数组
  }

  const step = Math.floor(array.length / (limit - 1)) // 计算步长，保证中间元素不被删除
  const result = [] // 存储最终结果的数组
  for (let i = 0; i < array.length; i += step) {
    result.push(array[i]) // 将符合条件的元素添加到结果数组中
  }

  return result
}

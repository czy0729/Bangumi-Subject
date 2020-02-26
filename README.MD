## Bangumi 条目静态数据快照

[![](https://data.jsdelivr.com/v1/package/gh/czy0729/Bangumi-Subject/badge)](https://www.jsdelivr.com/package/gh/czy0729/Bangumi-Subject)

服务于 [Bangumi-App](https://github.com/czy0729/Bangumi).

因服务器在国外, App 里请求官方 API 和分析网页整合数据渲染特别慢, 所以对精选条目进行了爬虫快照 (30w 条目里面划了 3w, 覆盖正常用户点击的 90%条目), 以达到网页服务器慢也不影响 App 内卡住的目的.

条目页面数据 fallback: 网页解释 > 官方 API > bangumi-data > CDN.

通过 jsdelivr 达到白嫖效果.

### 条目范围

不是所有条目都收纳, 30W 的条目里面有 80%是三无书籍条目, 没意义.
项目只爬取 2020 年的动画, 所有类型的排行榜上的条目, bangumi-data 里面的所有条目 id.

### 使用方法

```
https://cdn.jsdelivr.net/gh/czy0729/Bangumi-Subject@master/data/${parseInt(parseInt(subjectId) / 100)}/${subjectId}.json
```

例如 subjectId 为 289173 访问地址为

```
https://cdn.jsdelivr.net/gh/czy0729/Bangumi-Subject@master/data/2891/289173.json
```

### 自动更新 js 脚本

[待补充]

### 结构描述

```
{
  id: 140001,
  type: 2,
  name: 'Re:ゼロから始める異世界生活',
  image: '//lain.bgm.tv/pic/cover/m/cb/78/140001_Ew1mo.jpg',

  // 评分
  rating: {
    total: 6513,
    count: {
      '1': 59,
      '2': 17,
      '3': 32,
      '4': 89,
      '5': 267,
      '6': 841,
      '7': 2192,
      '8': 2183,
      '9': 603,
      '10': 230
    },
    score: 7.3
  },

  // API的介绍
  summary:
    '　　从便利店回来的路上突然被召唤到异世界的少年，菜月昴。在无可依赖的异世界，无力的少年所唯一拥有的力量……那就是死后便会使时间倒转的“死亡回归”的力量。为了守护重要的人，并取回那些无可替代的时间，少年向绝望抗争，挺身面对残酷的命运。',

  // 网页版的详细介绍
  info:
    '<li><span>中文名: </span>Re：从零开始的异世界生活</li><li><span>话数: </span>25</li><li><span>放送开始: </span>2016年4月3日</li><li><span>放送星期: </span>星期日</li><li><span>原作: </span><a href="/person/18838">長月達平</a></li><li><span>导演: </span><a href="/person/13191" rel="v:directedBy">渡邊政治</a></li><li><span>脚本: </span><a href="/person/6797">梅原英司</a>、<a href="/person/3296">横谷昌宏</a>、<a href="/person/14370">中村能子</a></li><li><span>分镜: </span><a href="/person/13191">渡邊政治</a>、<a href="/person/26764">許平康</a>、<a href="/person/26956">高橋謙仁</a>、<a href="/person/3266">上坪亮樹</a>、<a href="/person/6154">尾崎隆晴</a>、<a href="/person/3107">迫井政行</a>、<a href="/person/608">おざわかずひろ</a>、<a href="/person/2696">細田直人</a>、<a href="/person/23680">長山延好</a>、<a href="/person/731">相澤昌弘</a>、<a href="/person/23317">山岸大悟</a>、<a href="/person/12609">川村賢一</a>、<a href="/person/16005">岡本学</a>、<a href="/person/26981">中重俊祐</a></li><li><span>演出: </span><a href="/person/11566">徳本善信</a>、<a href="/person/26918">美甘義人</a>、<a href="/person/26574">篠原正寛</a>、<a href="/person/12096">古賀一臣</a>、<a href="/person/13191">渡邊政治</a>、<a href="/person/12359">土屋浩幸</a>、<a href="/person/23317">山岸大悟</a>、<a href="/person/11876">山本秀世</a>、<a href="/person/26956">高橋謙仁</a>、<a href="/person/16005">岡本学</a>、<a href="/person/26538">守泰祐</a>、<a href="/person/17470">高島大輔</a></li><li><span>音乐: </span><a href="/person/10850">末廣健一郎</a></li><li><span>人物原案: </span><a href="/person/7533">大塚真一郎</a></li><li><span>人物设定: </span><a href="/person/781">坂井久太</a></li><li><span>系列构成: </span><a href="/person/3296">横谷昌宏</a></li><li><span>美术监督: </span><a href="/person/13332">高峯義人</a></li><li><span>色彩设计: </span><a href="/person/3522">坂本いづみ</a></li><li><span>总作画监督: </span><a href="/person/781">坂井久太</a></li><li><span>作画监督: </span><a href="/person/32584">山岡峻</a>、<a href="/person/3240">梶浦紳一郎</a>、<a href="/person/32388">北原大地</a>、<a href="/person/35128">阿部島瑠珠</a>、<a href="/person/781">坂井久太</a>、<a href="/person/34917">世良コータ</a>、<a href="/person/14212">中村和久</a>、<a href="/person/32387">中西和也</a>、<a href="/person/12724">池上太郎</a>、<a href="/person/27045">岩田景子</a>、<a href="/person/15344">木宮亮介</a>、<a href="/person/27425">森川侑紀</a>、<a href="/person/1323">野田康行</a>、<a href="/person/21197">齊藤佳子</a>、<a href="/person/21659">池田有</a>、<a href="/person/32583">浅利歩惟</a>、<a href="/person/27982">林隆祥</a>、<a href="/person/22691">小柳達也</a>、<a href="/person/13345">明珍宇作</a>、<a href="/person/1569">中田正彦</a>、<a href="/person/28400">田中一真</a>、<a href="/person/12346">又賀大介</a>、<a href="/person/33591">今田茜</a>、<a href="/person/25539">永吉隆志</a></li><li><span>摄影监督: </span><a href="/person/13333">峰岸健太郎</a></li><li><span>道具设计: </span><a href="/person/1557">鈴木典孝</a>、<a href="/person/12723">岩畑剛一</a></li><li><span>原画: </span><a href="/person/34491">古俣拓磨</a>、<a href="/person/34614">関本美穂</a>、<a href="/person/12343">碇谷敦</a>、<a href="/person/27982">林隆祥</a>、<a href="/person/29420">坪田慎太郎</a>、<a href="/person/35128">阿部島瑠珠</a>、<a href="/person/12226">高瀬健一</a>、<a href="/person/14212">中村和久</a>、<a href="/person/10006">吉成鋼</a>、<a href="/person/12589">田中宏紀</a>、<a href="/person/26361">蛯名秀和</a>、<a href="/person/28539">加藤滉介</a>、<a href="/person/418">吉田徹</a>、<a href="/person/12232">柳隆太</a>、<a href="/person/11706">飯飼一幸</a>、<a href="/person/26833">青木康哲</a>、<a href="/person/22691">小柳達也</a></li><li><span>第二原画: </span><a href="/person/28590">CONNECT</a></li><li><span>背景美术: </span><a href="/person/27305">美峰</a></li><li><span>剪辑: </span><a href="/person/22709">須藤瞳</a></li><li><span>主题歌编曲: </span><a href="/person/9557">宮崎誠</a> / <a href="/person/20157">MYTH & ROID</a></li><li><span>主题歌作曲: </span><a href="/person/9557">宮崎誠</a> / <a href="/person/20157">MYTH & ROID</a></li><li><span>主题歌作词: </span>ミズノゲンキ / <a href="/person/20157">MYTH & ROID</a></li><li><span>主题歌演出: </span><a href="/person/8401">鈴木このみ</a> / <a href="/person/20157">MYTH & ROID</a></li><li><span>插入歌演出: </span><a href="/person/10868">水瀬いのり</a></li><li><span>音响监督: </span><a href="/person/477">明田川仁</a></li><li><span>音响: </span><a href="/person/2370">マジックカプセル</a></li><li><span>音效: </span><a href="/person/19170">古谷友二</a></li><li><span>特效: </span><a href="/person/31249">川西美保</a></li><li><span>补间动画: </span><a href="/person/17995">Nexus</a></li><li><span>制片人: </span><a href="/person/33715">田中翔</a></li><li><span>制作助手: </span><a href="/person/17995">Nexus</a></li><li><span>音乐制作: </span><a href="/person/19306">KADOKAWA</a></li><li><span>动画制作: </span><a href="/person/7512">WHITE FOX</a></li><li><span>CG 导演: </span><a href="/person/22922">軽部優</a></li><li><span>美术设计: </span><a href="/person/22921">金城沙綾</a></li><li><span>OP・ED 分镜: </span><a href="/person/13191">渡邊政治</a>、<a href="/person/16005">岡本学</a></li><li><span>别名: </span>rezero</li><li><span style="visibility:hidden;">别名: </span>從零開始的異世界生活</li><li><span style="visibility:hidden;">别名: </span>Re0</li><li><span style="visibility:hidden;">别名: </span>Re: Life a Different World from Zero</li><li><span>官方网站: </span>http://re-zero-anime.jp/</li><li><span>播放电视台: </span>テレビ東京</li><li><span>其他电视台: </span>テレビ愛知 / テレビ大阪 / AT-X</li><li><span>播放结束: </span>2016年9月18日</li><li><span>Copyright: </span>©長月達平・株式会社KADOKAWA刊／Re:ゼロから始める異世界生活1製作委員会</li>',

  // 用户收藏类型
  collection: {
    wish: 397,
    collect: 7807,
    doing: 985,
    on_hold: 423,
    dropped: 518
  },

  // 用户标签
  tags: [
    { name: '轻小说改', count: 1354 },
    { name: '2016年4月', count: 1143 }
  ],

  // 章节信息
  eps: [
    {
      id: 626365,
      url: 'http://bgm.tv/ep/626365',
      type: 1,
      sort: 0,
      name: '特番「Re:ゼロから始める異世界体験」',
      name_cn: '特别节目「Re：从零开始异世界体验」',
      duration: '00:21:59',
      airdate: '2016-04-02',
      comment: 10,
      desc:
        '4/2(土) 26:10〜 事前特番「Re:ゼロから始める異世界体験」(出演：小林裕介さん、内山夕実さん、水瀬いのりさん、村川梨衣さん)',
      status: 'Air'
    },
    {
      id: 621357,
      url: 'http://bgm.tv/ep/621357',
      type: 0,
      sort: 1,
      name: '始まりの終わりと終わりの始まり',
      name_cn: '起始的终结和终结的起始',
      duration: '00:49:30',
      airdate: '2016-04-03',
      comment: 128,
      desc:
        '脚本：横谷昌宏　絵コンテ・演出：渡邊政治　作画監督：坂井久太 / 小柳達也\r\n\r\nコンビニからの帰り道、突如として異世界へと召喚されてしまった少年、菜月昴。目の前に広がるファンタジーな異世界に目を輝かせるスバルだったが、自分を召喚したであろう美少女の姿はどこにも見当たらない。やがて右も左もわからない状況にスバルは頭をかかえてしまう。さらに強制イベントと言わんばかりにチンピラに絡まれ、異世界に招かれた人間が超常の力を発揮するといったお約束の展開もなく、容赦なく叩きのめされるスバル。そんなスバルの前に一人の少女が現れる。',
      status: 'Air'
    }
  ],

  // 角色
  crt: [
    {
      id: 35607,
      image: '//lain.bgm.tv/pic/crt/g/f3/e4/35607_crt_Zh1jK.jpg',
      name: '菜月昴',
      desc: '小林裕介'
    },
    {
      id: 35608,
      image: '//lain.bgm.tv/pic/crt/g/86/d4/35608_crt_7mCqC.jpg',
      name: '艾米莉娅',
      desc: '高橋李依'
    }
  ],

  // 制作人员
  staff: [
    {
      id: 18838,
      image: '//lain.bgm.tv/pic/crt/g/ce/63/18838_prsn_tH7Z1.jpg',
      name: '长月达平',
      desc: '原作'
    },
    { id: 13191, image: '', name: '渡边政治', desc: '导演' }
  ],

  // 关联条目
  relations: [
    {
      id: 121927,
      image: '//lain.bgm.tv/pic/cover/m/1e/0e/121927_2bGf8.jpg',
      title: 'Re:ゼロから始める異世界生活',
      type: '书籍',
      url: 'https://bgm.tv/subject/121927'
    },
    {
      id: 190981,
      image: '//lain.bgm.tv/pic/cover/m/9a/c0/190981_a57aU.jpg',
      title: 'Re:ゼロから始める異世界生活 -DEATH OR KISS-',
      type: '游戏',
      url: 'https://bgm.tv/subject/190981'
    }
  ],

  disc: [], // 碟片信息, 音乐类型专有
  comic: [], // 单行本, 书籍类型专有
  like: [], // 猜你喜欢, 游戏类型专有
  lock: '', // 是否锁定条目, 有值就是锁定

  _loaded: 1579062475
}

```

### 中文名可以通过 bangumi-data 查找, 或者在 info 里面截取

```
import bangumiData from 'bangumi-data'

/**
 * 查找番剧中文名
 */
const _bangumiFindHistory = {}
export function findBangumiCn(jp = '') {
  if (_bangumiFindHistory[jp]) {
    return _bangumiFindHistory[jp]
  }

  const item = bangumiData.items.find(item => item.title === jp)
  if (item) {
    const cn =
      (item.titleTranslate &&
        item.titleTranslate['zh-Hans'] &&
        item.titleTranslate['zh-Hans'][0]) ||
      jp
    _bangumiFindHistory[jp] = cn
    return cn
  }

  _bangumiFindHistory[jp] = jp
  return jp
}
```

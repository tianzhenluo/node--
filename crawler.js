const cheerio = require('cheerio')
const request = require('request')
const http = require('http')
const fs = require('fs')
const Bagpipe = require('bagpipe')

const domain = 'https://m.bnmanhua.com'
// 鬼灭之刃
// const home = '/comic/847.html'

// 拳愿阿修罗
const home = '/comic/1657.html'

const imgDomain = 'http://m-bnmanhua-com.mipcdn.com/i/bnpic.comic123.net/'
const headers = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36'
}

const pictureDownloader = require('./downloader')

const bagpipe = new Bagpipe(10)

function fetch(url) {
  return new Promise((resolve, reject) => {
    request(
      {
        url,
        headers
      },
      (err, res, body) => {
        if (!err && res.statusCode === 200) {
          resolve(body)
        } else {
          reject(err)
        }
      }
    )
  })
}

fetch(domain + home).then(res => {
  let $ = cheerio.load(res)
  let articles = $('.list_block').find('li')
  
  for (let i = 0; i < articles.length; i++) {
    setTimeout(() => {
      download(
        articles
          .eq(i)
          .find('a')
          .attr('href'),
        articles
          .eq(i)
          .find('a')
          .text()
      )
    }, 1000)
  }
})

function download(url, fileName) {
  fs.mkdir(fileName, (err) => {
    if(err) {
      console.log('创建文件夹失败')
    } else {
      fetch(domain + url).then(res => {
        if (res) {
          let tempstr = res.match(/z_img='(\S*)';var/)[1]
          tempstr = JSON.parse(tempstr)
        
          tempstr.map((imgUrl) => {
            let imgName = imgUrl.split('/').slice(-1)[0]
            pictureDownloader(imgDomain + imgUrl, `./${fileName}/${imgName}`)
          })
          // tempstr.forEach(item => {
          //   let imgName = item.split('/').slice(-1)[0]
          //   request(imgDomain + item).pipe(fs.createWriteStream(`./${fileName}/${imgName}`)).on('close', function() {
              
          //   })
          // })      
        }
      })
    }
  })
}

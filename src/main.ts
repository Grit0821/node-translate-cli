import * as https from 'https'
import md5 from 'md5';
import * as querystring from 'querystring'
import { appId, appSecret } from './private';


export const translate = (word: string) => {
  // 1.接受参数
  // 2.调用接口
  // 3.返回响应

  const salt = Math.random()
  // md5 生成sign
  const sign = md5(appId + word + salt + appSecret)
  let from, to
  if (/[a-zA-Z]/.test(word)) {
    from = 'en'
    to = 'zh'
  } else {
    from = 'zh'
    to = 'en'
  }

  const query: string = querystring.stringify({
    q: word,
    from,
    to,
    appid: appId,
    salt,
    sign,
  })

  const options = {
    hostname: 'api.fanyi.baidu.com',
    port: 443,
    path: '/api/trans/vip/translate?' + query,
    method: 'GET'
  };



  const req = https.request(options, (res) => {
    let chunks: Buffer[] = []
    res.on('data', (chunk) => {
      chunks.push(chunk)
    });
    res.on('end', () => {
      const string = Buffer.concat(chunks).toString()
      type BaiduResult = {
        error_msg?: string;
        error_code?: string;
        from?: string;
        to?: string;
        trans_result: {
          src: string;
          dst: string;
        }[]
      }
      const object: BaiduResult = JSON.parse(string)
      if (object.error_code) {
        console.error(object.error_msg)
        process.exit(2)
      } else {
        object.trans_result.forEach(obj => console.log(obj.dst))
        process.exit(0)
      }

    })
  });

  req.on('error', (e) => {
    console.error(e);
  });
  req.end();
}


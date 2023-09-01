/* eslint-disable no-unused-expressions */
const crypto = require('crypto');
const request = require('request');
const aesKey = '3xlZgtZR3sgNvkMd';
const fs = require('fs');
const md5 = require('md5');
const {socket} = require('../config/config.socket')

/**
 * Node与Java通信，AES-128-ECB加密
 * @param {string} data 要加密的字符串
 * @param {string} key 加密Key
 * @return {string}
 */
function AesEnToJava(data, key) {
  const clearEncoding = 'utf8';
  const cipherEncoding = 'hex';
  const cipherChunks = [];
  const cipher = crypto.createCipheriv('aes-128-ecb', aesKey, '');
  cipher.setAutoPadding(true);
  cipherChunks.push(cipher.update(data, clearEncoding, cipherEncoding));
  cipherChunks.push(cipher.final(cipherEncoding));
  return cipherChunks.join('');
}

/**
 * Node与Java通信，AES-128-ECB解密
 * @param data 要解密的字符串
 * @param key 解密Key
 * @return {string}
 */
function AesDeToJava(data, key) {
  if (data === undefined || data === null) {
    throw new Error("AES->JAVA解密: 传入参数为空")
  }
  if (data == 0 || data === '0') {
    return '0';
  }
  const clearEncoding = 'utf8';
  const cipherEncoding = 'hex';
  const cipherChunks = [];
  const decipher = crypto.createDecipheriv('aes-128-ecb', aesKey, '');
  decipher.setAutoPadding(true);
  cipherChunks.push(decipher.update(`${data}`, cipherEncoding, clearEncoding));
  cipherChunks.push(decipher.final(clearEncoding));
  return cipherChunks.join('');
}

// 获取用户客户端IP
const GetUserIP = ctx => {
  const {req} = ctx;
  let ipAddress;
  let headers = req.headers;
  let forwardedIpsStr = headers['x-real-ip'] || headers['x-forwarded-for'];
  forwardedIpsStr ? (ipAddress = forwardedIpsStr) : (ipAddress = null);
  if (!ipAddress) {
    ipAddress = req.connection.remoteAddress;
  }
  return ipAddress;
};

/**
 * 请求接口-POST
 * @param {String} URL 协议地址
 * @param {Object} PARAMS 接口参数
 * @param {Object} HEADERS 请求头
 * @param {String} TYPE 请求类型,不传默认为POST
 * @returns {Promise}
 */
const Request = async (URL, PARAMS = {}, HEADERS = {}, TYPE = 'POST') => {
  return new Promise((resolve, reject) => {
    let str = JSON.stringify(PARAMS);
    let options = {
      url: URL,
      method: TYPE,
      body: str,
      headers: {
        ...HEADERS,
        'Content-Type': 'application/json',
      },
    };

    request(options, (err, res, data) => {
      if (err == null && res.statusCode === 200) {
        let result = JSON.parse(data);
        if (result.code === 0 || result.code === 200) {
          resolve({
            status: 200,
            statusText: 'ok',
            data: result,
          });
        } else {
          reject({
            status: result.code,
            statusText: result.msg,
          });
        }
      } else {
        reject({
          status: -200,
          statusText: '服务器错误',
        });
      }
    });
  });
};
/**
 * 同步转异步
 * @param func
 * @return {function(...[*]): Promise<unknown>}
 */
const promisify = func => {
  return function (...args) {
    return new Promise((resolve, reject) => {
      let callback = function (...args) {
        resolve(args);
      };
      func.apply(null, [...args, callback]);
    });
  };
};

const encodeUTF8 = s => {
  var i, r = [], c, x;
  for (i = 0; i < s.length; i++)
    if ((c = s.charCodeAt(i)) < 0x80) r.push(c);
    else if (c < 0x800) r.push(0xc0 + ((c >> 6) & 0x1f), 0x80 + (c & 0x3f));
    else {
      if ((x = c ^ 0xd800) >> 10 == 0)
        //对四字节UTF-16转换为Unicode
        (c = (x << 10) + (s.charCodeAt(++i) ^ 0xdc00) + 0x10000), r.push(0xf0 + ((c >> 18) & 0x7), 0x80 + ((c >> 12) & 0x3f));
      else r.push(0xe0 + ((c >> 12) & 0xf));
      r.push(0x80 + ((c >> 6) & 0x3f), 0x80 + (c & 0x3f));
    }
  return r;
};

// 字符串加密成 hex 字符串
const SHA1 = s => {
  var data = new Uint8Array(encodeUTF8(s));
  var i, j, t;
  var l = (((data.length + 8) >>> 6) << 4) + 16,
    s = new Uint8Array(l << 2);
  s.set(new Uint8Array(data.buffer)), (s = new Uint32Array(s.buffer));
  for (t = new DataView(s.buffer), i = 0; i < l; i++) s[i] = t.getUint32(i << 2);
  s[data.length >> 2] |= 0x80 << (24 - (data.length & 3) * 8);
  s[l - 1] = data.length << 3;
  var w = [],
    f = [
      function () {
        return (m[1] & m[2]) | (~m[1] & m[3]);
      },
      function () {
        return m[1] ^ m[2] ^ m[3];
      },
      function () {
        return (m[1] & m[2]) | (m[1] & m[3]) | (m[2] & m[3]);
      },
      function () {
        return m[1] ^ m[2] ^ m[3];
      },
    ],
    rol = function (n, c) {
      return (n << c) | (n >>> (32 - c));
    },
    k = [1518500249, 1859775393, -1894007588, -899497514],
    m = [1732584193, -271733879, null, null, -1009589776];
  (m[2] = ~m[0]), (m[3] = ~m[1]);
  for (i = 0; i < s.length; i += 16) {
    var o = m.slice(0);
    for (j = 0; j < 80; j++)
      (w[j] = j < 16 ? s[i + j] : rol(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1)),
        (t = (rol(m[0], 5) + f[(j / 20) | 0]() + m[4] + w[j] + k[(j / 20) | 0]) | 0),
        (m[1] = rol(m[1], 30)),
        m.pop(),
        m.unshift(t);
    for (j = 0; j < 5; j++) m[j] = (m[j] + o[j]) | 0;
  }
  t = new DataView(new Uint32Array(m).buffer);
  for (var i = 0; i < 5; i++) m[i] = t.getUint32(i << 2);

  var hex = Array.prototype.map
    .call(new Uint8Array(new Uint32Array(m).buffer), function (e) {
      return (e < 16 ? '0' : '') + e.toString(16);
    })
    .join('');
  return hex;
};

/**
 * 生成随机字符串
 * @param {number} len 生成的字符串长度，默认32
 * @return {string} 最后生成返回的字符串
 */
const RandomStr = (len = 32) => {
  const chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
  const maxPos = chars.length;
  let pwd = '';
  for (let i = 0; i < len; i += 1) {
    pwd += chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return pwd;
};

/**
 * 生成文件夹方法
 * @param {string} path 需要生成的文件夹路径
 * @param {function} callback 生成文件夹或失败的回掉方法
 */
function mkdir(path, callback) {
  let exists = fs.existsSync(`${path}`);
  if (exists) {
    callback && callback();
  } else {
    fs.mkdir(`${path}`, 0o777, function (err) {
      callback && callback(err);
    })
  }
}

/**
 * 移动文件
 * @param {string} oldPath 文件所在路径
 * @param {string} newPath 要移动到的路径
 * @param {function} callback 移动完成或失败的回掉
 */
function moveFile(oldPath, newPath, callback) {
  try {
    let readStream = fs.createReadStream(oldPath);
    let writeStream = fs.createWriteStream(newPath);
    readStream.pipe(writeStream);
    fs.unlinkSync(oldPath);
    callback && callback();
  } catch (e) {
    callback && callback(e);
  }
}

function getFileType(suffix) {
  let type = "OTHER";
  const fileType = [
    {type: "IMAGE", suffix: ['.jpg', '.JPG', '.png', '.PNG', '.bmp', '.BMP', '.jpeg', '.JPEG', '.gif', '.GIF'],},
    {
      type: "VIDEO",
      suffix: ['.swf', '.mp4', '.flv', '.avi', '.mpg', '.wmv', '.3gp', '.mov', '.asf', '.asx', '.vob', '.wmv9', '.rm', '.rmvb'],
    },
    {type: "TEXT", suffix: ['.xls', '.xlsx', '.csv', '.doc', '.docx', '.ppt', '.pptx', '.pdf', '.txt', '.md'],},
    {type: "ZIP", suffix: ['.zip', '.7z', '.bzip2', '.gzip', '.tar', '.wim', '.xz'],},
  ]
  for (let i = 0; i < fileType.length; i++) {
    const item = fileType[i];
    if (item.suffix.indexOf(suffix) > -1) {
      type = item.type;
      break;
    }
  }
  return type
};



/**
 * 验证后的请求
 */
const SocketRequest = async (protocol, params) => {
  return new Promise(async (resolve, reject) => {
    const {appid, key} = socket;
    const ts = new Date().getTime();
    const sign = md5(`appid=${appid}&ts=${ts}&key=${key}`);
    // const sign = md5(`appid={}&ts={}&key={}`);
    console.log("socket params:", {
      appid,
      ts,
      ...params
    });
    console.log("socket sign:", sign);
    await Request(`${socket.domain}${protocol}`, {
      appid,
      ts,
      ...params
    }, {"funim-sign": sign}).then(result => {
      const {status, data: resultData} = result;
      if (status === 200) {
        const {code, data} = resultData;
        if (code === 200) {
          console.log(`socket result:`, result)
          resolve(data);
        } else {
          console.log(`${protocol}  error:`, result)
          reject();
        }
      } else {
        console.log(`${protocol}  error:`, result)
        reject();
      }
    }).catch((err) => {
      console.log(`${protocol}  error:`, err)
      reject()
    });
  })
};


module.exports = {
  GetUserIP,
  Request,
  AesDeToJava,
  AesEnToJava,
  promisify,
  SHA1,
  RandomStr,
  mkdir,
  moveFile,
  getFileType,
  SocketRequest
};

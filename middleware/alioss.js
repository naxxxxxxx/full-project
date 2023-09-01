const OSS = require('ali-oss');
const path = require("path");
const fs = require('fs');
const {cdnDomain} = require("../config/constants");

const client = new OSS({

  region: '', // region填写Bucket所在地域。以华东1（杭州）为例，Region填写为oss-cn-hangzhou。
  accessKeyId: '', // 阿里云账号AccessKey拥有所有API的访问权限，风险很高。强烈建议您创建并使用RAM用户进行API访问或日常运维，请登录RAM控制台创建RAM用户。
  accessKeySecret: '',
  bucket: '', // Bucket名称。
});


const put = async ({formPath, toPath, headers, callback}) => {
  try {
    // 填写OSS文件完整路径和本地文件的完整路径。OSS文件完整路径中不能包含Bucket名称。
    // 如果本地文件的完整路径中未指定本地路径，则默认从示例程序所属项目对应本地路径中上传文件。
    const result = await client.put(toPath, path.normalize(formPath), {headers: headers});
    console.log("上传阿里云OSS结果", result);

    fs.unlinkSync(formPath);
    callback && callback({url: `${cdnDomain}/${toPath}`})
  } catch (e) {
    console.warn('上传阿里云OSS失败:', e);
    callback && callback({err: e})
  }
}

module.exports = {
  put
};

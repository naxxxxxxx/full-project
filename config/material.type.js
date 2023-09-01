// 文件类型 1-图片,2-视频

const MATERIAL_TYPES = ext => {
  const pics = ['jpg', 'png', 'jpeg', 'gif'];
  const videos = [
    'avi',
    'wmv',
    'mpeg',
    'mp4',
    'm4v',
    'mov',
    'asf',
    'flv',
    'f4v',
    'rmvb',
    'rm',
    '3gp',
    'vob',
  ];
  if (pics.indexOf(ext.toLowerCase()) > -1) {
    return 1;
  }
  if (videos.indexOf(ext.toLowerCase()) > -1) {
    return 2;
  }
  return 0;
};
module.exports = MATERIAL_TYPES;

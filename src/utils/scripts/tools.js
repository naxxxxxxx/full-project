import React from 'react';

export const getStorage = key => window.localStorage.getItem(key) || null;
export const setStorage = (key, val) => window.localStorage.setItem(key, val);
export const clearStorage = key => window.localStorage.removeItem(key);
export const getToken = () => getStorage('adutoken') || null;
export const setToken = token => setStorage('adutoken', token);
export const clearToken = () => clearStorage('adutoken');
export const getLocalComID = () => getStorage("current_com_id");

export function urlToList(url) {
  const urllist = url.split('/').filter(i => i);
  return urllist.map((urlItem, index) => {
    return `/${urllist.slice(0, index + 1).join('/')}`;
  });
}

export const TGetValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');

/**
 * 生成面包屑
 * @param {object} options 参数
 * @param {object} options.separator 分割器
 * @param {object} options.location location属性，this.props.location
 * @param {object} options.menus 当前的菜单列表
 * @param {object} options.route 当前路由
 */

export function renderBreadCrumbTitle(options) {
  const separator = options.separator || ' - ';
  const titleArr = [];
  return titleArr.join(separator);
}

/** 判断用户权限
 * @path 权限路径
 */
export function CheckUserAuth(auths, path) {
  if (
    auths !== null &&
    auths !== undefined &&
    auths !== 'undefined' &&
    auths.length > 0 &&
    path !== undefined
  ) {
    if (auths.indexOf(path) > -1) {
      return true;
    }
  }
  return false;
}

export function getDay(start, end) {
  const result = [];
  const starts = start.split('-');
  const ends = end.split('-');
  let staYear = parseInt(starts[0], 10);
  let staMon = parseInt(starts[1], 10);
  let staDay = parseInt(starts[2], 10);
  const endYear = parseInt(ends[0], 10);
  const endMon = parseInt(ends[1], 10);
  const endDay = parseInt(ends[2], 10);
  while (staYear <= endYear) {
    if (staYear === endYear) {
      while (staMon <= endMon) {
        if (staMon === endMon) {
          while (staDay <= endDay) {
            result.push(
              `${staYear}-${staMon < 10 ? `0${staMon}` : staMon}-${
                staDay < 10 ? `0${staDay}` : staDay
              }`,
            );
            staDay += 1;
          }
          staMon += 1;
        } else {
          if (
            staMon === 1 ||
            staMon === 3 ||
            staMon === 5 ||
            staMon === 7 ||
            staMon === 8 ||
            staMon === 10 ||
            staMon === 12
          ) {
            if (staDay > 31) {
              staDay = 1;
              staMon += 1;
              if (staMon > 12) {
                staMon = 1;
                staYear += 1;
              }
            }
          } else {
            if (staDay > 30) {
              staDay = 1;
              staMon += 1;
              if (staMon > 12) {
                staMon = 1;
                staYear += 1;
              }
            }
          }
          result.push(
            `${staYear}-${staMon < 10 ? `0${staMon}` : staMon}-${
              staDay < 10 ? `0${staDay}` : staDay
            }`,
          );
          staDay += 1;
        }
      }
      staYear += 1;
    } else {
      if (
        staMon === 1 ||
        staMon === 3 ||
        staMon === 5 ||
        staMon === 7 ||
        staMon === 8 ||
        staMon === 10 ||
        staMon === 12
      ) {
        if (staDay > 31) {
          staDay = 1;
          staMon += 1;
          if (staMon > 12) {
            staMon = 1;
            staYear += 1;
          }
        }
      } else {
        if (staDay > 30) {
          staDay = 1;
          staMon += 1;
          if (staMon > 12) {
            staMon = 1;
            staYear += 1;
          }
        }
      }
      result.push(`${staMon}-${staDay < 10 ? `0${staDay}` : staDay}`);
      staDay += 1;
    }
  }
  return result;
}

export function getMonth(start, end) {
  const result = [];
  const starts = start.split('-');
  const ends = end.split('-');
  let staYear = parseInt(starts[0], 10);
  let staMon = parseInt(starts[1], 10);
  const endYear = parseInt(ends[0], 10);
  const endMon = parseInt(ends[1], 10);
  while (staYear <= endYear) {
    if (staYear === endYear) {
      while (staMon <= endMon) {
        result.push(`${staYear}-${staMon < 10 ? `0${staMon}` : staMon}`);
        staMon += 1;
      }
      staYear += 1;
    } else {
      if (staMon > 12) {
        staMon = 1;
        staYear += 1;
      }
      result.push(`${staYear}-${staMon < 10 ? `0${staMon}` : staMon}`);
      staMon += 1;
    }
  }
  return result;
}

/**
 * 格式化字符串
 * @param {string} str 需要被格式化的字符串
 * @param {number} type 1-手机,2-邮箱
 */
export const formatStr = (str, type) => {
  switch (type) {
    case 1:
      if (str.length === 11) {
        return `${str.substring(0, 3)}****${str.substring(7, 4)}`;
      } else {
        return 'NULL';
      }
    case 2:
      if (str.indexOf('@') > -1) {
        const arr = str.split('@');
        return `${arr[0].substring(0, 3)}****@${arr[1]}`;
      } else {
        return 'NULL';
      }
    default:
      break;
  }
};


/**
 * 下载文件以及自定义文件名称
 */
export function download(url, fileName) {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.responseType = "blob"; // 通过文件下载url拿到对应的blob对象
  xhr.onload = () => {
    if (xhr.status === 200) {
      let link = document.createElement("a");
      let body = document.querySelector("body");
      link.href = window.URL.createObjectURL(xhr.response);
      link.download = fileName;
      link.click();
      window.URL.revokeObjectURL(link.href);
    }
  };

  xhr.send();
}

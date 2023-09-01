/**
 * 数据库表操作基本方法
 * 使用参考 /api/user.js 的登录接口，使用步骤：
 * 1. 引入当前文件 const Dbbase = require("./Dbbase")
 * 2. 生成实例 const UserDao = new Dbbase({tableName: 'user'})
 * 3. 使用实例操作方法
 */

const query = require('./query');


/**
 * 用户表操作类
 */
class Dbbase {

  constructor() {

  }

  /**
   * 插入数据并返回主键ID
   * @param {Object} values 要插入的对象
   * @param {string} tableName 操作的表名
   * @return {number} id 主键ID
   */
  async insertReturnKey(values, tableName) {
    if (!values) throw new Error('insert values required');
    return new Promise((resolve, reject) => {
      let field = [];
      let placeholder = [];
      const value = [];
      for (const valuesKey in values) {
        if (values[valuesKey] !== undefined) {
          field.push(`${valuesKey}`);
          placeholder.push('?');
          value.push(`${values[valuesKey]}`);
        }
      }
      query(`INSERT INTO  ${tableName ? tableName : this.tableName} (${field.join(',')}) VALUES (${placeholder.join(',')})`, value).then(result => {
        if (result && result.insertId) resolve(result.insertId);
      }).catch(err => reject(err));
    });
  }

  /**
   * 插入数据,忽略重复的数据
   * @param {Object} values 要插入的对象
   * @param {string} tableName 操作的表名
   * @return {number} 影响行数
   */
  async insertIgnore(values, tableName) {
    if (!values) throw new Error('insert values required');
    return new Promise((resolve, reject) => {
      let field = [];
      let placeholder = [];
      const value = [];
      for (const valuesKey in values) {
        if (values[valuesKey] !== undefined) {
          field.push(`${valuesKey}`);
          placeholder.push('?');
          value.push(`${values[valuesKey]}`);
        }
      }
      query(`INSERT IGNORE INTO  ${tableName ? tableName : this.tableName} (${field.join(',')}) VALUES (${placeholder.join(',')})`, value).then(result => {
        resolve(result.affectedRows);
      }).catch(err => reject(err));
    });
  }

  /**
   * 插入或更新
   * @param values 插入的数据,Object
   * @param ufields 已存在数据时更新的字段, Array
   * @param tableName
   * @return {Promise<unknown>}
   */
  async insertOrUpdate({values, ufields, tableName}) {
    if (!values) throw new Error('insert values required');
    return new Promise((resolve, reject) => {
      let field = [];
      let placeholder = [];
      const value = [];
      for (const valuesKey in values) {
        if (values[valuesKey] !== undefined) {
          field.push(`${valuesKey}`);
          placeholder.push('?');
          value.push(`${values[valuesKey]}`);
        }
      }
      let updateFields = [];
      ufields.map(ufield => {
        updateFields.push(`${ufield}=values(${ufield})`);
      })
      query(`INSERT INTO  ${tableName ? tableName : this.tableName} (${field.join(',')}) VALUES (${placeholder.join(',')}) ON DUPLICATE KEY UPDATE ${updateFields.join(',')} ;`,value).then(result => {
        resolve(result.affectedRows);
      }).catch(err => reject(err));
    });
  }

  /**
   * 批量插入
   * @param values
   * @param tableName
   * @return {Promise<unknown>}
   */
  async insertBatch({fields, values, tableName}) {
    if (!fields || !values) throw new Error('insert values required');
    return new Promise((resolve, reject) => {

      let placeholder = [];
      values.map(value => {
        let finalValue = [];
        fields.map(field => {
          if (value[field]) {
            finalValue.push(`\'${value[field]}\'`);
          } else {
            finalValue.push('null');
          }
        })
        placeholder.push(`(${finalValue.join(",")})`);
      })
      query(`INSERT INTO  ${tableName ? tableName : this.tableName} (${fields.join(',')}) VALUES ${placeholder.join(',')};`).then(result => {
        resolve(result.affectedRows);
      }).catch(err => reject(err));
    });
  }

  /**
   * 批量插入
   * @param values
   * @param tableName
   * @return {Promise<unknown>}
   */
  async insertIgnoreBatch({fields, values, tableName}) {
    if (!fields || !values) throw new Error('insert values required');
    return new Promise((resolve, reject) => {

      let placeholder = [];
      values.map(value => {
        let finalValue = [];
        fields.map(field => {
          if (value[field]) {
            finalValue.push(`\'${value[field]}\'`);
          } else {
            finalValue.push('null');
          }
        })
        placeholder.push(`(${finalValue.join(",")})`);
      })
      query(`INSERT IGNORE INTO  ${tableName ? tableName : this.tableName} (${fields.join(',')}) VALUES ${placeholder.join(',')};`).then(result => {
        resolve(result.affectedRows);
      }).catch(err => reject(err));
    });
  }


  /**
   * 批量插入或更新
   * @param values
   * @param tableName
   * @return {Promise<unknown>}
   */
  async insertOrUpdateBatch({fields, values, ufields, tableName}) {
    if (!fields || !values) throw new Error('insert values required');
    return new Promise((resolve, reject) => {

      let placeholder = [];
      values.map(value => {
        let finalValue = [];
        fields.map(field => {
          if (value[field]) {
            finalValue.push(`\'${value[field]}\'`);
          } else {
            finalValue.push('null');
          }
        })
        placeholder.push(`(${finalValue.join(",")})`);
      })
      let updateFields = [];
      ufields.map(ufield => {
        updateFields.push(`${ufield}=values(${ufield})`);
      })
      query(`INSERT INTO  ${tableName ? tableName : this.tableName} (${fields.join(',')}) VALUES ${placeholder.join(',')} ON DUPLICATE KEY UPDATE ${updateFields.join(',')};`).then(result => {
        resolve(result.affectedRows);
      }).catch(err => reject(err));
    });
  }

  /**
   * 自定义查询
   * @param {Wrapper} wrapper
   * @returns {Promise<void>}
   */
  async select(wrapper) {
    if (!wrapper) {
      return new Promise((resolve, reject) => {
        query(`SELECT * FROM ${this.tableName}`).then(result => {
          if (result) resolve(result)
        }).catch(err => reject(err));
      });
    } else {
      if (typeof wrapper !== "object" || wrapper.constructor.name !== "Wrapper") throw new Error('param type error');

      return new Promise((resolve, reject) => {
        query(wrapper.getSelectSql(true), wrapper.getSelectParam()).then(result => {
          resolve(result);
        }).catch(err => reject(err));
      });
    }
  }

  /**
   * 自定义查询
   * @returns {Promise<void>}
   */
  async selectByKey(key, value) {
    if (!key || !value) throw new Error("key and value required");

    return new Promise((resolve, reject) => {
      query(`SELECT * FROM ${this.tableName} WHERE ${key}=${value}`).then(result => {
        resolve(result);
      }).catch(err => reject(err));
    });
  }

  /**
   * 自定义查询单条数据
   * @param {Wrapper} wrapper
   * @returns {Promise<void>}
   */
  async selectOne(wrapper) {
    if (!wrapper) {
      return new Promise((resolve, reject) => {
        query(`SELECT * FROM ${this.tableName} LIMIT 1`).then(result => {
          if (result && result.length > 0) {
            resolve(result[0]);
          } else {
            resolve(undefined);
          }
        }).catch(err => reject(err));
      });
    } else {
      if (typeof wrapper !== "object" || wrapper.constructor.name !== "Wrapper") throw new Error('param type error');

      return new Promise((resolve, reject) => {
        wrapper.last("LIMIT 1");
        query(wrapper.getSelectSql(true), wrapper.getSelectParam()).then(result => {
          if (result && result.length > 0) {
            resolve(result[0]);
          } else {
            resolve(undefined);
          }
        }).catch(err => reject(err));
      });
    }
  }

  /**
   * 查询单条数据
   * @returns {Promise<void>}
   */
  async selectOneByKey(key, value) {
    if (!key || !value) throw new Error("key and value required");

    return new Promise((resolve, reject) => {
      query(`SELECT * FROM ${this.tableName} WHERE ${key}=${value} LIMIT 1`).then(result => {
        if (result && result.length > 0) {
          resolve(result[0]);
        } else {
          resolve(undefined);
        }
      }).catch(err => reject(err));
    });
  }

  /**
   * 自定义分页查询
   * @param {Number} pageNum 当前页码
   * @param {Number} pageSize 每页数量
   * @param {Wrapper} wrapper
   * @returns {Promise<void>}
   */
  async selectPage(pageNum, pageSize, wrapper) {
    if (!pageNum || !pageSize || !wrapper) throw new Error("pagination param and wrapper required");

    if (typeof wrapper !== "object" || wrapper.constructor.name !== "Wrapper") throw new Error('param type error');

    return new Promise(async (resolve, reject) => {
      let total = 0;
      const startIndex = (pageNum - 1) * pageSize;

      await query(`SELECT COUNT(0) cnt FROM (${wrapper.getSelectSql(true)}) as t`, wrapper.getSelectParam()).then(async count => {
        total = count[0].cnt;
        if (total > startIndex) {
          wrapper.last(`LIMIT ${startIndex},${pageSize}`);
          await query(wrapper.getSelectSql(), wrapper.getSelectParam()).then(result => {
            resolve({
              list: result,
              total, pageNum, pageSize
            });
          }).catch(err => reject(err));
        } else {
          resolve({
            list: [],
            total, pageNum, pageSize
          });
        }
      }).catch(err => reject(err));
    });
  }


  /**
   * 自定义查询条数
   * @param {Wrapper} wrapper
   * @returns {Promise<void>}
   */
  async count(wrapper) {
    if (!wrapper) {
      return new Promise((resolve, reject) => {
        query(`SELECT COUNT(0) cnt FROM ${this.tableName}`).then(result => {
          if (result) resolve(result[0].cnt)
        }).catch(err => reject(err));
      });
    } else {
      if (typeof wrapper !== "object" || wrapper.constructor.name !== "Wrapper") throw new Error('param type error')
      return new Promise((resolve, reject) => {
        query(wrapper.getSelectCntSql(true), wrapper.getSelectParam()).then(result => {
          resolve(result[0].cnt);
        }).catch(err => reject(err));
      });
    }
  }

  /**
   * 自定义删除
   * @param {Wrapper} wrapper
   * @return 影响行数
   */
  async delete(wrapper) {
    if (!wrapper) throw new Error('wrapper required');
    if (typeof wrapper !== "object" || wrapper.constructor.name !== "Wrapper") throw new Error('param type error');

    return new Promise((resolve, reject) => {
      query(`DELETE FROM ${wrapper.getTable()}${wrapper.getSqlSegment(true)}`, wrapper.getSelectParam()).then(result => resolve(result.affectedRows)).catch(err => reject(err));
    })
  }

  /**
   * 自定义更新
   * @param {Wrapper} wrapper
   * @return 影响行数
   */
  async update(wrapper) {
    if (!wrapper) throw new Error('wrapper required');
    if (typeof wrapper !== "object" || wrapper.constructor.name !== "Wrapper") throw new Error('param type error');

    return new Promise((resolve, reject) => {
      query(wrapper.getUpdateSql(true), wrapper.getUpdateParam()).then(result => resolve(result.affectedRows)).catch(err => reject(err));
    })
  }

}

module.exports = Dbbase;

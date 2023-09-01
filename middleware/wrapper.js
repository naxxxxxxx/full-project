/**
 * 条件包装
 */
class Wrapper {

  /**
   * @param {string} tableName
   */
  constructor(tableName) {
    if (!tableName || tableName === "") {
      //在调用构造方法时为传入表名,则必须调用from()方法设置操作的表
    }
    this.tableName = tableName;
    this.sqlSegment = [];
  }

  /**
   * 刷新生成sql，查询条件，条件参数
   */
  #refresh = () => {
    if (this.sqlSegment && this.sqlSegment.length > 0) {
      let condPosition = 'where';
      const conditions = [...this.sqlSegment];
      let where = "";
      let whereParam = [];
      let group = "";
      let order = "";
      let having = "";
      let havingParam = [];
      let joiner = " AND "
      let set = "";
      let setParam = [];
      for (let i = 0; i < conditions.length; i++) {
        const {condition, parameter, type} = conditions[i];
        switch (type) {
          case 'where':
            condPosition = 'where';
            if (where === "") {
              where += condition;
            } else {
              where += joiner + condition;
            }
            if (parameter && parameter.length > 0) {
              whereParam.push(...parameter);
            }
            joiner = ' AND ';
            break;
          case 'having':
            condPosition = 'having';
            if (having === "") {
              having += condition;
            } else {
              having += joiner + condition;
            }
            if (parameter && parameter.length > 0) {
              havingParam.push(...parameter);
            }
            joiner = ' AND ';
            break;
          case 'bracket':
            const bracket = condition.toLowerCase();
            if (bracket==="left"){
              if (condPosition==='where'){
                if (where === "") {
                  where += '(';
                } else {
                  where += joiner + '(';
                }
              }else{
                if (having === "") {
                  having += '(';
                } else {
                  having += joiner + '(';
                }
              }
              joiner = '';
            }else if (bracket==="right"){
              if (condPosition==='where'){
                where += ')';
              }else{
                having += ')';
              }
              joiner = ' AND ';
            }
            break;
          case 'joiner':
            joiner = condition;
            break;
          case 'group':
            if (group === "") {
              group += "GROUP BY " + condition;
            } else {
              group += "," + condition;
            }
            break;
          case 'order':
            if (order === "") {
              order += "ORDER BY " + condition;
            } else {
              order += "," + condition;
            }
            break;
          case 'set':
            if (set === "") {
              set += condition;
            } else {
              set += "," + condition;
            }
            if (parameter && parameter.length > 0) {
              setParam.push(...parameter);
            }
            break;
        }
      }
      let sqlSegment = "";
      if (where !== "") {
        sqlSegment += ` WHERE (${where})`
      }
      if (group !== "") {
        sqlSegment += ` ${group}`
      }
      if (having !== "") {
        sqlSegment += ` HAVING (${having})`
      }
      if (order !== "") {
        sqlSegment += ` ${order}`
      }
      this.selectSqlSegment = sqlSegment;
      this.selectParam = whereParam.length + havingParam.length === 0 ? undefined : [...whereParam, ...havingParam];
      this.setSqlSegment = set;
      this.updateParam = [...setParam, ...whereParam, ...havingParam];
    }
  }

  getTable=()=>{
    if (!this.fromStr && (!this.tableName || this.tableName === "")) throw new Error("未指定表名");
    return `${this.fromStr ? this.fromStr : this.tableName}`;
  }

  getSelectSql = (refresh) => {
    if (refresh) this.#refresh();
    return `SELECT ${this.selectStr ? this.selectStr : "*"} FROM ${this.getTable()}${this.getSqlSegment()}`;
  }
  getSelectParam = (refresh) => {
    if (refresh) this.#refresh();
    return this.selectParam;
  }

  getUpdateSql = (refresh) => {
    if (refresh) this.#refresh();
    if (!this.setSqlSegment || this.setSqlSegment === "") throw new Error("未指定更新的字段");

    return `UPDATE ${this.getTable()} SET ${this.setSqlSegment}${this.getSqlSegment()}`;
  }
  getUpdateParam = (refresh) => {
    if (refresh) this.#refresh();
    return this.updateParam;
  }

  getSelectCntSql = (refresh) => {
    if (refresh) this.#refresh();

    return `SELECT COUNT(0) cnt FROM ${this.getTable()}${this.getSqlSegment()}`;
  }

  getSqlSegment = (refresh) => {
    if (refresh) this.#refresh();
    let sqlSegment = "";
    if (this.selectSqlSegment) {
      sqlSegment += this.selectSqlSegment;
    }
    if (this.lastStr) {
      sqlSegment += ` ${this.lastStr}`
    }
    return sqlSegment;
  }

  /**
   * 等于
   * @param {string} field
   * @param {string|number} value
   */
  eq = (field, value) => {
    const conditions = [...this.sqlSegment];
    conditions.push({
      condition: `${field} = ?`,
      parameter: [`${value}`],
      type: 'where',
    })
    this.sqlSegment = conditions;
    return this;
  }
  /**
   * 等于
   * @param {Object} param
   */
  allEq = (param) => {
    const conditions = [...this.sqlSegment];
    for (const field in param) {
      const value = param[field];
      if (value!==undefined && value!==null){
        conditions.push({
          condition: `${field} = ?`,
          parameter: [`${value}`],
          type: 'where',
        })
      }
    }

    this.sqlSegment = conditions;
    return this;
  }

  /**
   * 不等于
   * @param {string} field
   * @param {string|number} value
   */
  ne = (field, value) => {
    const conditions = [...this.sqlSegment];
    conditions.push({
      condition: `${field} <> ?`,
      parameter: [`${value}`],
      type: 'where',
    })
    this.sqlSegment = conditions;
    return this;
  }

  /**
   * 大于
   * @param {string} field
   * @param {string|number} value
   */
  gt = (field, value) => {
    const conditions = [...this.sqlSegment];
    conditions.push({
      condition: `${field} > ?`,
      parameter: [`${value}`],
      type: 'where',
    })
    this.sqlSegment = conditions;
    return this;
  }

  /**
   * 大于等于
   * @param {string} field
   * @param {string|number} value
   */
  ge = (field, value) => {
    const conditions = [...this.sqlSegment];
    conditions.push({
      condition: `${field} >= ?`,
      parameter: [`${value}`],
      type: 'where',
    })
    this.sqlSegment = conditions;
    return this;
  }
  /**
   * 小于
   * @param {string} field
   * @param {string|number} value
   */
  lt = (field, value) => {
    const conditions = [...this.sqlSegment];
    conditions.push({
      condition: `${field} < ?`,
      parameter: [`${value}`],
      type: 'where',
    })
    this.sqlSegment = conditions;
    return this;
  }

  /**
   * 小于等于
   * @param {string} field
   * @param {string|number} value
   */
  le = (field, value) => {
    const conditions = [...this.sqlSegment];
    conditions.push({
      condition: `${field} <= ?`,
      parameter: [`${value}`],
      type: 'where',
    })
    this.sqlSegment = conditions;
    return this;
  }
  /**
   * 介于
   * @param {string} field
   * @param {string|number} value1
   * @param {string|number} value2
   */
  between = (field, value1, value2) => {
    const conditions = [...this.sqlSegment];
    conditions.push({
      condition: `(${field} BETWEEN ? AND ?)`,
      parameter: [`${value1}`, `${value2}`],
      type: 'where',
    })
    this.sqlSegment = conditions;
    return this;
  }
  /**
   * 不介于
   * @param {string} field
   * @param {string|number} value1
   * @param {string|number} value2
   */
  notBetween = (field, value1, value2) => {
    const conditions = [...this.sqlSegment];
    conditions.push({
      condition: `(${field} NOT BETWEEN ? AND ?)`,
      parameter: [`${value1}`, `${value2}`],
      type: 'where',
    })
    this.sqlSegment = conditions;
    return this;
  }

  /**
   * 模糊查询
   * @param {string} field
   * @param {string|number} value
   */
  like = (field, value) => {
    const conditions = [...this.sqlSegment];
    conditions.push({
      condition: `${field} LIKE '%${value}%'`,
      type: 'where',
    })
    this.sqlSegment = conditions;
    return this;
  }

  /**
   * 模糊查询
   * @param {string} field
   * @param {string|number} value
   */
  notLike = (field, value) => {
    const conditions = [...this.sqlSegment];
    conditions.push({
      condition: `${field} NOT LIKE '%${value}%'`,
      type: 'where',
    })
    this.sqlSegment = conditions;
    return this;
  }

  /**
   * 模糊查询
   * @param {string} field
   * @param {string|number} value
   */
  likeLeft = (field, value) => {
    const conditions = [...this.sqlSegment];
    conditions.push({
      condition: `${field} LIKE '%${value}'`,
      type: 'where',
    })
    this.sqlSegment = conditions;
    return this;
  }
  /**
   * 模糊查询
   * @param {string} field
   * @param {string|number} value
   */
  likeRight = (field, value) => {
    const conditions = [...this.sqlSegment];
    conditions.push({
      condition: `${field} LIKE '${value}%'`,
      type: 'where',
    })
    this.sqlSegment = conditions;
    return this;
  }
  /**
   * 空
   * @param {string} field
   */
  isNull = (field) => {
    const conditions = [...this.sqlSegment];
    conditions.push({
      condition: `${field} IS NULL`,
      type: 'where',
    })
    this.sqlSegment = conditions;
    return this;
  }
  /**
   * 非空
   * @param {string} field
   */
  isNotNull = (field) => {
    const conditions = [...this.sqlSegment];
    conditions.push({
      condition: `${field} IS NOT NULL`,
      type: 'where',
    })
    this.sqlSegment = conditions;
    return this;
  }
  /**
   * in
   * @param {string} field
   * @param {string|number} values
   */
  in = (field, ...values) => {
    if (values && values.length > 0) {
      const conditions = [...this.sqlSegment];
      let placeholder = [];
      for (let i = 0; i < values.length; i++) {
        placeholder.push("?");
      }
      conditions.push({
        condition: `${field} IN (${placeholder.join(",")})`,
        parameter: values,
        type: 'where',
      })
      this.sqlSegment = conditions;
    }
    return this;
  }
  /**
   * not in
   * @param {string} field
   * @param {string|number} values
   */
  notIn = (field, ...values) => {
    if (values && values.length > 0) {
      const conditions = [...this.sqlSegment];
      let placeholder = [];
      for (let i = 0; i < values.length; i++) {
        placeholder.push("?");
      }
      conditions.push({
        condition: `${field} NOT IN (${placeholder.join(",")})`,
        parameter: values,
        type: 'where',
      })
      this.sqlSegment = conditions;
    }
    return this;
  }
  /**
   * in sql
   * @param {string} field
   * @param {string} sql
   */
  inSql = (field, sql) => {
    const conditions = [...this.sqlSegment];
    conditions.push({
      condition: `${field} IN (${sql})`,
      type: 'where',
    })
    this.sqlSegment = conditions;
    return this;
  }
  /**
   * not in sql
   * @param {string} field
   * @param {string} sql
   */
  notInSql = (field, sql) => {
    const conditions = [...this.sqlSegment];
    conditions.push({
      condition: `${field} NOT IN (${sql})`,
      type: 'where',
    })
    this.sqlSegment = conditions;
    return this;
  }
  /**
   * 分组
   * @param {string} fields
   */
  groupBy = (...fields) => {
    const conditions = [...this.sqlSegment];
    conditions.push({
      condition: `${fields.join(",")}`,
      type: 'group',
    })
    this.sqlSegment = conditions;
    return this;
  }
  /**
   * having
   * @param {string} sql
   */
  having = (sql) => {
    const conditions = [...this.sqlSegment];
    conditions.push({
      condition: sql ? `${sql}` : "",
      type: 'having',
    })
    this.sqlSegment = conditions;
    return this;
  }
  /**
   * 排序
   * @param {string} fields
   */
  orderBy = (...fields) => {
    const conditions = [...this.sqlSegment];
    conditions.push({
      condition: `${fields.join(",")}`,
      type: 'order',
    })
    this.sqlSegment = conditions;
    return this;
  }
  /**
   * 排序
   * @param {string} fields
   */
  orderByAsc = (...fields) => {
    const conditions = [...this.sqlSegment];
    let orderStr = "";
    fields.map(field => {
      orderStr += `${field} ASC,`;
    })
    orderStr = orderStr.substr(0, orderStr.length - 1);
    conditions.push({
      condition: `${orderStr}`,
      type: 'order',
    })
    this.sqlSegment = conditions;
    return this;
  }
  /**
   * 排序
   * @param {string} fields
   */
  orderByDesc = (...fields) => {
    const conditions = [...this.sqlSegment];
    let orderStr = "";
    fields.map(field => {
      orderStr += `${field} DESC,`;
    })
    orderStr = orderStr.substr(0, orderStr.length - 1);
    conditions.push({
      condition: `${orderStr}`,
      type: 'order',
    })
    this.sqlSegment = conditions;
    return this;
  }
  /**
   * or 连接符
   */
  or = () => {
    const conditions = [...this.sqlSegment];
    conditions.push({
      condition: ` OR `,
      type: 'joiner',
    })
    this.sqlSegment = conditions;
    return this;
  }
  /**
   * exists
   * @param {string} sql
   */
  exists = (sql) => {
    const conditions = [...this.sqlSegment];
    conditions.push({
      condition: `EXISTS (${sql})`,
      type: 'where',
    })
    this.sqlSegment = conditions;
    return this;
  }
  /**
   * not exists
   * @param {string} sql
   */
  notExists = (sql) => {
    const conditions = [...this.sqlSegment];
    conditions.push({
      condition: `NOT EXISTS (${sql})`,
      type: 'where',
    })
    this.sqlSegment = conditions;
    return this;
  }
  /**
   * 左括号
   * 会自动拼接在 and 获取 or 之后
   */
  bracket_L = () => {
    const conditions = [...this.sqlSegment];
    conditions.push({
      condition: 'left',
      type: 'bracket',
    })
    this.sqlSegment = conditions;
    return this;
  }
  /**
   * 右括号
   */
  bracket_R = () => {
    const conditions = [...this.sqlSegment];
    conditions.push({
      condition: 'right',
      type: 'bracket',
    })
    this.sqlSegment = conditions;
    return this;
  }
  /**
   * 嵌套
   * @param {string} sql
   */
  nested = (sql) => {
    const conditions = [...this.sqlSegment];
    conditions.push({
      condition: ` (${sql}) `,
      type: 'where',
    })
    this.sqlSegment = conditions;
    return this;
  }
  /**
   * 无视规则直接拼接到最后
   * @param {string} sqlSegment
   * 只能调用一次,多次调用以最后一次为准
   */
  last = (sqlSegment) => {
    this.lastStr = sqlSegment;
    return this;
  }
  /**
   * 查询字段
   * @param {string} fields
   * 只能调用一次,多次调用以最后一次为准
   */
  select = (...fields) => {
    this.selectStr = `${fields.join(",")}`;
    return this;
  }
  /**
   * from table
   * 支持联表查询
   * @param {string} from
   * 只能调用一次,多次调用以最后一次为准
   */
  from = (from) => {
    this.fromStr = `${from}`;
    return this;
  }
  /**
   * inner join
   * 支持联表查询
   * @param {string} type ['INNER','LEFT','RIGHT']
   * @param {string} tableName
   * @param {string} on 关联条件
   */
  join = (type ,tableName,...on) => {
    let table = `${this.getTable()} ${type} JOIN ${tableName} ON `;
    let conditions = '';
    on.map(cond=>{
      conditions += cond + ' AND ';
    })
    this.fromStr = table + conditions.substr(0, conditions.length - 5);
    return this;
  }
  /**
   * set
   * update内容
   * @param {string} field
   * @param {string|number|null} value
   */
  set = (field, value) => {
    const conditions = [...this.sqlSegment];
    conditions.push({
      condition: value===undefined ? field : `${field} = ?`,
      parameter: value===undefined ? [] : [value == null ? null : `${value}`],
      type: 'set',
    })
    this.sqlSegment = conditions;
    return this;
  }
  /**
   * set
   * 此方法会自动剔除null值
   * update内容
   * @param {Object} param
   */
  setAll = (param) => {
    const conditions = [...this.sqlSegment];
    for (const field in param) {
      const value = param[field];
      if (value!==undefined) {
        conditions.push({
          condition: `${field} = ?`,
          parameter:  [value == null ? null : `${value}`],
          type: 'set',
        })
      }
    }
    this.sqlSegment = conditions;
    return this;
  }
}


module.exports = Wrapper;

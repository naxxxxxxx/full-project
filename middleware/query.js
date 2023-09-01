const mysql = require('mysql');
const conf = require('../config/mysql');
const pool = mysql.createPool(conf);

// 执行sql语句
const query = function(sql, values) {
  return new Promise((resolve, reject) => {
    console.log(sql);
    console.log(values);
    pool.getConnection(function(err, connection) {
      if (err) {
        reject(err);
      } else {
        connection.query(sql, values, (err, rows) => {
          if (err) {
            console.log(err);
            reject(err);
          } else {
            console.log(rows);
            resolve(rows);
          }
          connection.release();
        });
      }
    });
  });
};

module.exports = query;

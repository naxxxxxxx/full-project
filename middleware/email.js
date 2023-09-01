const mailer = require('nodemailer');
const {defaultTransporter, defaultOptions} = require('../config/config.email');

/**
 * 发送邮件接口
 * @param {string} to 接收者邮箱 a@x.com,b@x.com
 * @param {string} type 发送类型,txt|html
 * @param {string} data 发送的邮件内容
 * @param cc 抄送者邮箱，a@x.com,b@x.com
 * @param subject 邮件主题
 */
module.exports.sendEmail = ({to, cc, subject, type, data}) => {
  return new Promise((resolve, reject) => {
    mailer.createTestAccount(() => {
      let transporter = mailer.createTransport(defaultTransporter);

      let mailOptions = {
        ...defaultOptions,
        to,
        subject,
      };
      if (cc) mailOptions.cc = cc;
      if (type === 'text') mailOptions.text = data;
      if (type === 'html') mailOptions.html = data;
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          reject()
        }
        resolve()
      });
    });
  });
}

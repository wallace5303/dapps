'use strict';

const BaseService = require('./base');
const crypto = require('crypto');
const commonConfig = require('../config/commonConfig');
const utilsIndex = require('../utils/index');
const moment = require('moment');
const _ = require('lodash');

class UserService extends BaseService {
  /*
   * 获取用户 by id
   * @params: string uid
   * @return: object
   */
  async getUserByUid(uid, allData = true) {
    let userInfo = await this.service.redis.getUserInfo(uid);
    if (!userInfo) {
      userInfo = await this.mysqlClient().get('user', { uid });
      if (userInfo) {
        await this.service.redis.setUserInfo(uid, userInfo);
      }
    }
    if (!allData && userInfo) {
      userInfo = this.service.user.dealUserData(userInfo);
    }

    return userInfo;
  }

  /*
   * 用户部分数据
   */
  dealUserData(userInfo) {
    const user = {
      uid: userInfo.uid,
      username: userInfo.username,
      phone: userInfo.phone,
      avatar: userInfo.avatar,
      last_online_time: userInfo.last_online_time,
    };

    return user;
  }

  /*
   * 更新用户登录时间
   */
  async updateLastLoginTime(uid) {
    const row = {
      last_online_time: moment().format('YMMDDHHmmss'),
    };
    const options = {
      where: {
        uid,
      },
    };
    const res = await this.mysqlClient().update('user', row, options);

    return res;
  }

  /*
   * 获取用户 by username
   * @params: string username
   * @return: object
   */
  async getUserByName(username) {
    const user = await this.mysqlClient().get('user', { username });
    return user;
  }

  /*
   * 获取用户 by phone
   * @params: string phone
   * @return: object
   */
  async getUserByPhone(country, phone) {
    const user = await this.mysqlClient().get('user', { country, phone });
    return user;
  }

  // async getUserFromCache (uid) {
  //   var user =
  //
  // }

  /*
   * 创建用户
   */
  async createUser(
    uid,
    country,
    phone,
    email = '',
    password = '',
    username = '',
    nickname = ''
  ) {
    // uid是否存在 todo
    if (!uid) {
      uid = utilsIndex.createNewUid();
      let status = await this.service.user.getUserByUid(uid);
      if (status) {
        let isExist = true;
        while (isExist) {
          uid = utilsIndex.createNewUid();
          status = await this.service.user.getUserByUid(uid);
          if (!status) {
            isExist = false;
          }
        }
      }
    }

    if (country === commonConfig.robotCountry) {
      phone = Number(
        String(commonConfig.robotPrefix) +
          String(_.random(100000000, 999999999))
      );
    }

    const conn = await this.mysqlClient().beginTransaction(); // 初始化事务
    try {
      const userData = {
        uid,
        email,
        password,
        phone,
        country,
        username,
        nickname,
      };
      // 注册用户
      const insertRes = await conn.insert('user', userData);
      if (insertRes.affectedRows !== 1) {
        await conn.rollback();
        this.app.logger.error(
          '[userService] [createUser] registerRes user_cash error userData:%j',
          userData
        );
        return false;
      }
      // 初始化用户钱包
      const fields = {
        uid,
        auto_bet: _.random(1, 1320),
      };
      if (country === commonConfig.robotCountry) {
        fields.key = 30;
        fields.total_cash = 60;
      }
      const cashInsertRes = await conn.insert('user_cash', fields);
      if (cashInsertRes.affectedRows !== 1) {
        await conn.rollback();
        this.app.logger.error(
          '[userService] [createUser] initRes user_cash error uid:%j',
          uid
        );
        return false;
      }

      await conn.commit();
      return true;
    } catch (e) {
      await conn.rollback();
      this.app.logger.error('[userService] [createUser] create error e:', e);
    }

    return false;
  }

  /*
   * 注册用户
   * @params: string phone
   * @return: bool
   */
  async register(data) {
    try {
      const insertRes = await this.mysqlClient().insert('user', data);
      if (insertRes.affectedRows !== 1) {
        return false;
      }
      return true;
    } catch (e) {
      this.app.logger.error(
        '[userService] [register] insert user data error:%j',
        e
      );
    }

    return false;
  }

  /*
   * 生成access_token
   * @params: string uid
   * @return: string
   */
  createAccessToken(uid) {
    const secretKey = commonConfig.secretKey;
    const access_token = crypto
      .createHash('md5')
      .update(uid)
      .update(secretKey)

      .update(Date.now().toString())

      .digest('hex');

    return access_token;
  }

  /*
   * 绑定银行卡
   */
  async bankcardSave(
    uid,
    ucaid = 0,
    name,
    openBank,
    bankCode,
    cardNumber,
    province,
    city,
    branchBank,
    def = 0
  ) {
    const res = {
      code: CODE.SYS_OPERATION_FAILED,
      msg: '操作失败',
    };
    const field = {
      name,
      open_bank: openBank,
      bank_code: bankCode,
      card_number: cardNumber,
      province,
      city,
      branch_bank: branchBank,
      is_default: def,
    };

    if (ucaid) {
      // 检查银行卡是否被别人绑定
      // var sql = "SELECT card_number FROM user_card WHERE card_number = ? AND uid <> ?";
      // var checkOtherCard = await this.mysqlClient().query(sql, [cardNumber, uid]);
      // if (!_.isEmpty(checkOtherCard)) {
      //   res.code = CODE.USER_BANKCARD_ALREADY_BIND;
      //   res.msg = '该银行卡已经被绑定';
      //   return res;
      // }

      const conn = await this.mysqlClient().beginTransaction(); // 初始化事务

      // 默认地址只有一个，设置默认前，先更新掉之前的默认地址
      if (def === 1) {
        await conn.update('user_card', { is_default: 0 }, { where: { uid } });
      }

      // 更新操作
      const options = {
        where: {
          ucaid,
          uid,
        },
      };
      const upRes = await conn.update('user_card', field, options);
      if (upRes.affectedRows !== 1) {
        await conn.rollback();
        this.app.logger.error(
          '[userService] [bankCardSave] upRes error field:%j, options:%j',
          field,
          options
        );
        return res;
      }
      // try {
      //
      // } catch (e) {
      //   this.app.logger.error("[userService] [register] upRes error:%j", e);
      //   return res;
      // }
      await conn.commit();
    } else {
      // 插入操作
      field.uid = uid;
      // 检查银行卡是否被绑定
      // var checkCard = await this.mysqlClient().get('user_card', {card_number: cardNumber});
      // if (checkCard) {
      //   res.code = CODE.USER_BANKCARD_ALREADY_BIND;
      //   res.msg = '该银行卡已经被绑定';
      //   return res;
      // }
      // 如果是第一张卡，设置为默认
      const list = await this.mysqlClient().get('user_card', { uid });
      if (!list) {
        field.is_default = 1;
      }

      const insertRes = await this.mysqlClient().insert('user_card', field);
      if (!insertRes) {
        this.app.logger.error(
          '[userService] [bankCardSave] insertRes error field:%j',
          field
        );
        return res;
      }
    }

    res.code = CODE.SUCCESS;
    res.msg = '操作成功';
    return res;
  }

  /*
   * 获取银行卡信息
   */
  async getBankcardInfo(uid, def = 0, ucaid = 0) {
    const res = {};
    if (!uid || (!def && !ucaid)) {
      return res;
    }
    const where = {
      uid,
    };
    if (ucaid) {
      where.ucaid = ucaid;
    }
    if (def) {
      where.is_default = 1;
    }

    const info = await this.mysqlClient().get('user_card', where);
    if (!info) {
      return res;
    }

    return info;
  }

  /*
   * 获取提现记录
   */
  async getWithdrawsRecord(uid, page = 1, limit = 10) {
    let list = await this.mysqlClient().select('cash_withdraws', {
      where: { uid },
      columns: ['cwid', 'uid', 'cash', 'status', 'created_at'],
      orders: [['cwid', 'desc']],
      limit,
      offset: (page - 1) * limit,
    });

    list = this.dealList(list);

    return list;
  }

  /*
   * 是否当期第一次登陆
   */
  async isFirstLogin(uid) {
    const period = this.service.lottery.getCurrentPeriodId();
    const flag = await this.service.redis.getPeriodLoginFlag(uid, period);
    this.app.logger.info(
      '[userService] [isFirstLogin] uid:%j, flag:%j',
      uid,
      flag
    );
    if (!_.isEmpty(flag)) {
      return false;
    }

    setTimeout(() => {
      this.service.redis.setPeriodLoginFlag(uid, period);
    }, 5000);
    // await this.service.redis.setPeriodLoginFlag(uid, period);

    return true;
  }

  /*
   * 是否新用户
   */
  async isNewUser(uid) {
    const userInfo = await this.mysqlClient().get('user', { uid });
    if (userInfo) {
      const current = moment().format('X');
      const created_at = moment(userInfo.created_at).format('Y-MM-DD HH:mm:ss');
      const created_at_int = moment(created_at).format('X');
      if (current - created_at_int < 15) {
        return 1;
      }
    }

    return 0;
  }

  /*
   * 获取机器人数
   */
  async getRobotCount() {
    const num = await this.mysqlClient().count('user', {
      country: commonConfig.robotCountry,
    });
    return num;
  }
}

module.exports = UserService;

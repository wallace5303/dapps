'use strict';

let StatusCode;
(function(StatusCode) {
  // 系统
  StatusCode[(StatusCode.SUCCESS = 0)] = 'SUCCESS';
  StatusCode[(StatusCode.SYS_API_ERROR = 10001)] = 'SYS_API_ERROR'; // api错误
  StatusCode[(StatusCode.SYS_PARAMS_ERROR = 10002)] = 'SYS_PARAMS_ERROR'; // 参数错误
  StatusCode[(StatusCode.SYS_NOT_LOGING = 10003)] = 'SYS_NOT_LOGING'; // 未登录
  StatusCode[(StatusCode.SYS_ACCOUNT_ERROR = 10004)] = 'SYS_ACCOUNT_ERROR'; // 账号密码错误
  StatusCode[(StatusCode.SYS_INVALID_REQUEST = 10005)] = 'SYS_INVALID_REQUEST'; // 非法请求
  StatusCode[(StatusCode.SYS_UNKNOWN_ERROR = 10006)] = 'SYS_UNKNOWN_ERROR'; // 未知错误
  StatusCode[(StatusCode.SYS_OPERATION_FAILED = 10007)] =
    'SYS_OPERATION_FAILED'; // 操作失败
  StatusCode[(StatusCode.SYS_SERVER_ERROR = 10008)] = 'SYS_SERVER_ERROR'; // 服务错误
  StatusCode[(StatusCode.SYS_PAGE_NOT_FOUND = 10009)] = 'SYS_PAGE_NOT_FOUND'; // 页面不存在
  StatusCode[(StatusCode.SYS_SERVER_BUSY = 10010)] = 'SYS_SERVER_BUSY'; // 服务器繁忙
  StatusCode[(StatusCode.SYS_OVER_FREQ = 10011)] = 'SYS_OVER_FREQ'; // 操作频繁，请稍后重试
  StatusCode[(StatusCode.SYS_MAINTENANCE = 10012)] = 'SYS_MAINTENANCE'; // 系统维护
  StatusCode[(StatusCode.SYS_GET_SERVER_FAILED = 10013)] =
    'SYS_GET_SERVER_FAILED'; // 获取服务器失败
  StatusCode[(StatusCode.SYS_REDIS_ERROR = 10014)] = 'SYS_REDIS_ERROR'; // redis服务器出错

  // 用户
  StatusCode[(StatusCode.USER_NOT_EXIST = 20001)] = 'USER_NOT_EXIST'; // 账号不存在
  StatusCode[(StatusCode.USER_NAME_IS_EXIST = 20002)] = 'USER_NAME_IS_EXIST'; // 用户名已存在
  StatusCode[(StatusCode.USER_MOBILE_ERROR = 20003)] = 'USER_MOBILE_ERROR'; // 手机号错误
  StatusCode[(StatusCode.USER_MSG_CODE_ERROR = 20004)] = 'USER_MSG_CODE_ERROR'; // 验证码错误
  StatusCode[(StatusCode.USER_PHONE_ALREADY_EXIST = 20005)] =
    'USER_PHONE_ALREADY_EXIST'; // 手机号已存在
  StatusCode[(StatusCode.USER_IS_FORBID = 20006)] = 'USER_IS_FORBID'; // 账号被封禁
  StatusCode[(StatusCode.USER_ACCESS_TOKEN_INVALID = 20007)] =
    'USER_ACCESS_TOKEN_INVALID'; // token无效
  StatusCode[(StatusCode.USER_REGISTER_NEED_AGENT_UID = 20008)] =
    'USER_REGISTER_NEED_AGENT_UID'; // 新用户注册需要有推荐人id
  StatusCode[(StatusCode.USER_AGENT_INVALID = 20009)] = 'USER_AGENT_INVALID'; // 无效的代理人
  StatusCode[(StatusCode.USER_BANKCARD_NOT_BIND = 20010)] =
    'USER_BANKCARD_NOT_BIND'; // 用户未绑定银行卡
  StatusCode[(StatusCode.USER_BANKCARD_ALREADY_BIND = 20011)] =
    'USER_BANKCARD_ALREADY_BIND'; // 该银行卡已经被绑定
  StatusCode[(StatusCode.USER_MSG_INPUT_CODE_ERROR_TIMES = 200012)] =
    'USER_MSG_INPUT_CODE_ERROR_TIMES'; // 输入验证码错误次数过多

  // 充值
  StatusCode[(StatusCode.CASH_RECHARGE_ERROR = 30001)] = 'CASH_RECHARGE_ERROR'; // 充值失败
  StatusCode[(StatusCode.CASH_WITHDRAWS_ERROR = 30002)] =
    'CASH_WITHDRAWS_ERROR'; // 提现申请失败
  StatusCode[(StatusCode.CASH_PLATFORM_ERROR = 30003)] = 'CASH_PLATFORM_ERROR'; // 无效的充值平台
  StatusCode[(StatusCode.CASH_PAY_STYLE_ERROR = 30004)] =
    'CASH_PAY_STYLE_ERROR'; // 无效的充值方式
  StatusCode[(StatusCode.CASH_STYLE_ERROR = 30005)] = 'CASH_STYLE_ERROR'; // 无效的充值金额
  StatusCode[(StatusCode.CASH_DEVICE_ERROR = 30006)] = 'CASH_DEVICE_ERROR'; // 无效的设备类型
  StatusCode[(StatusCode.CASH_CREATE_ORDER_ERROR = 30007)] =
    'CASH_CREATE_ORDER_ERROR'; // 创建充值订单失败
  StatusCode[(StatusCode.CASH_REQUEST_PAY_ERROR = 30008)] =
    'CASH_REQUEST_PAY_ERROR'; // 获取第三方支付表单异常
  StatusCode[(StatusCode.CASH_UPDATE_ADD_ERROR = 30009)] =
    'CASH_UPDATE_ADD_ERROR'; // 增加(更新)用户现金失败
  StatusCode[(StatusCode.CASH_ADD_ERROR = 30010)] = 'CASH_ADD_ERROR'; // 增加（insert）用户现金失败
  StatusCode[(StatusCode.CASH_INSERT_ERROR = 30011)] = 'CASH_INSERT_ERROR'; // 增加用户现金失败
  StatusCode[(StatusCode.CASH_NOT_ENOUGH = 30012)] = 'CASH_NOT_ENOUGH'; // 余额不足
  StatusCode[(StatusCode.CASH_INSERT_FLOWS_ERROR = 30013)] =
    'CASH_INSERT_FLOWS_ERROR'; // 插入流水记录失败
  StatusCode[(StatusCode.CASH_FIRST_RECHARGE = 30014)] = 'CASH_FIRST_RECHARGE'; // 用户首次充值
  StatusCode[(StatusCode.CASH_RECHARGE_ORDER_INVALID = 30015)] =
    'CASH_RECHARGE_ORDER_INVALID'; // 无效的充值订单号
  StatusCode[(StatusCode.CASH_GET_LOCK_ERROR = 30016)] = 'CASH_GET_LOCK_ERROR'; // 获取锁失败

  // 提现
  StatusCode[(StatusCode.CASH_WITHDRAWS_CASH_ERROR = 30016)] =
    'CASH_WITHDRAWS_CASH_ERROR'; // 提现金额错误
  StatusCode[(StatusCode.CASH_WITHDRAWS_NOT_ALLOW_ERROR = 30017)] =
    'CASH_WITHDRAWS_NOT_ALLOW_ERROR'; // 不允许继续提现
  StatusCode[(StatusCode.CASH_WITHDRAWS_NOT_CARD = 30018)] =
    'CASH_WITHDRAWS_NOT_CARD'; // 未绑定银行卡
  StatusCode[(StatusCode.CASH_WITHDRAWS_DO_ERROR = 30019)] =
    'CASH_WITHDRAWS_DO_ERROR'; // 提现操作错误
  StatusCode[(StatusCode.CASH_WITHDRAWS_THIRD_ERROR = 30020)] =
    'CASH_WITHDRAWS_THIRD_ERROR'; // 提现第三方操作错误

  // 转账 doTransferAccounts
  StatusCode[(StatusCode.CASH_TRANSFER_ACCOUNTS_ERROR = 30021)] =
    'CASH_TRANSFER_ACCOUNTS_ERROR'; // 转账操作错误

  // 发送短信
  StatusCode[(StatusCode.SMS_SEND_ERROR = 50001)] = 'SMS_SEND_ERROR'; // 发送短信失败
  StatusCode[(StatusCode.PHONE_SEND_SMS_TOO_OFTEN = 50002)] =
    'PHONE_SEND_SMS_TOO_OFTEN'; // 发送短信过多
  StatusCode[(StatusCode.SMS_REQUEST_TOO_OFTEN = 50003)] =
    'SMS_REQUEST_TOO_OFTEN'; // 验证码请求过于频繁

  // auth
  StatusCode[(StatusCode.API_AUTH_SIGN_ERROR = 60001)] = 'API_AUTH_SIGN_ERROR'; // 签名错误
  StatusCode[(StatusCode.API_AUTH_APP_ERROR = 60002)] = 'API_AUTH_APP_ERROR'; // 无效的APP
})(StatusCode || (StatusCode = {}));

module.exports = StatusCode;

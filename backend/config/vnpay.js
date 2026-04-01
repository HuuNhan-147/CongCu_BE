import crypto from 'crypto';

const vnpayConfig = {
  tmnCode: process.env.VNPAY_TMN_CODE || '',
  secureSecret: process.env.VNPAY_SECURE_SECRET || '',
  vnpUrl: process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
  returnUrl: process.env.VNPAY_RETURN_URL || 'http://localhost:3000/api/payment/vnpay/return',
  apiUrl: process.env.VNPAY_API_URL || 'https://sandbox.vnpayment.vn/merchant_webapi/api/transaction',
  version: '2.1.0',
  command: 'pay',
  currCode: 'VND',
  locale: 'vn'
};

/**
 * Generate secure hash for VNPay request
 * @param {Object} data - Data to hash
 * @returns {string} - SHA512 hash
 */
function generateSecureHash(data) {
  const sortedData = Object.keys(data)
    .sort()
    .reduce((result, key) => {
      if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
        result[key] = data[key];
      }
      return result;
    }, {});

  const dataString = Object.entries(sortedData)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  return crypto
    .createHmac('sha512', vnpayConfig.secureSecret)
    .update(Buffer.from(dataString, 'utf-8'))
    .digest('hex');
}

/**
 * Verify secure hash from VNPay response
 * @param {Object} requestData - Query parameters from VNPay
 * @returns {boolean} - True if hash is valid
 */
function verifySecureHash(requestData) {
  const { vnp_SecureHash, ...dataToHash } = requestData;
  const generatedHash = generateSecureHash(dataToHash);
  return generatedHash === vnp_SecureHash;
}

/**
 * Create payment URL with all required parameters
 * @param {Object} orderData - Order information
 * @returns {string} - VNPay payment URL
 */
function createPaymentUrl(orderData) {
  const { orderId, amount, ipnUrl, returnUrl, orderInfo, bankCode } = orderData;

  const date = new Date();
  const createDate = date.toISOString().replace(/[-:T.]/g, '').slice(0, 14);
  const txnRef = orderId;
  const formattedAmount = amount * 100; // VNPay expects amount in cents

  const vnpParams = {
    vnp_Version: vnpayConfig.version,
    vnp_Command: vnpayConfig.command,
    vnp_TmnCode: vnpayConfig.tmnCode,
    vnp_Amount: formattedAmount.toString(),
    vnp_CurrCode: vnpayConfig.currCode,
    vnp_BankCode: bankCode || '',
    vnp_TxnRef: txnRef,
    vnp_OrderInfo: orderInfo || `Thanh toan don hang ${orderId}`,
    vnp_OrderType: 'other',
    vnp_Locale: vnpayConfig.locale,
    vnp_ReturnUrl: returnUrl || vnpayConfig.returnUrl,
    vnp_IpnUrl: ipnUrl || `${process.env.BASE_URL}/api/payment/vnpay/ipn`,
    vnp_CreateDate: createDate,
    vnp_ExpireDate: new Date(date.getTime() + 15 * 60 * 1000).toISOString().replace(/[-:T.]/g, '').slice(0, 14)
  };

  const secureHash = generateSecureHash(vnpParams);
  vnpParams.vnp_SecureHash = secureHash;

  const queryString = Object.entries(vnpParams)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');

  return `${vnpayConfig.vnpUrl}?${queryString}`;
}

export { vnpayConfig, generateSecureHash, verifySecureHash, createPaymentUrl };

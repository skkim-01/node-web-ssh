const crypto = require('crypto');

const DEFAULT_ALGORITHM = 'aes-256-cbc'
const DEFAULT_ENCODING = 'base64'
const DEFAULT_CHARSET = 'utf8'
const DEFAULT_HASH = 'sha256'

class CryptoHelper {

  static encrypt(strPlainData, strSecret, byteIV = null) {
    if (!byteIV) {
      byteIV = crypto.randomBytes(16);
    }

    try {
      const bufferedSecret = this.hashedSecretBuffer(strSecret);

      const cipher = crypto.createCipheriv(DEFAULT_ALGORITHM, bufferedSecret, byteIV);
      const strEncryptedBase64 =
        cipher.update(strPlainData, DEFAULT_CHARSET, DEFAULT_ENCODING) + cipher.final(DEFAULT_ENCODING);
      return { data: strEncryptedBase64, iv: Buffer.from(byteIV).toString(DEFAULT_ENCODING) };
    } catch (e) {
      throw e;
    }
  }

  static decrypt(strEncryptedBase64, strSecret, strIVBase64) {
    try {
      const bufferedSecret = this.hashedSecretBuffer(strSecret);

      const decipher = crypto.createDecipheriv(
        DEFAULT_ALGORITHM,
        bufferedSecret,
        Buffer.from(strIVBase64, DEFAULT_ENCODING)
      );
      const plainText =
        decipher.update(strEncryptedBase64, DEFAULT_ENCODING, DEFAULT_CHARSET) + decipher.final(DEFAULT_CHARSET);
      return plainText;
    } catch (e) {
      throw e;
    }
  }

  static hashedSecretBuffer(strSecret) {
    try {
      return Buffer.from(
        crypto.createHash(DEFAULT_HASH).update(String(strSecret)).digest(DEFAULT_ENCODING),
        DEFAULT_ENCODING
      );
    } catch (e) {
      throw e;
    }
  }

  static hashedSecretBase64(strSecret) {
    try {
      return crypto.createHash(DEFAULT_HASH).update(String(strSecret)).digest(DEFAULT_ENCODING);
    } catch (e) {
      throw e;
    }
  }
}

module.exports = { CryptoHelper }
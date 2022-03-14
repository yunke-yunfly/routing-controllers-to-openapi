
/**
 * 生成随机字符串
 * @param {number} len
 * @returns
 */
 export const randomString = (len?: number) => {
  const length: number = len || 32
  const $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz'   
  const maxPos = $chars.length
  let pwd = ''
  for (let i = 0; i < length; i++) {
    pwd += $chars.charAt(Math.floor(Math.random() * maxPos))
  }
  return pwd
}
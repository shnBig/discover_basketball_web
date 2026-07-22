/**
 * 压缩图片到指定大小以内
 * @param {File} file - 原始图片文件
 * @param {number} maxSizeMB - 最大体积（MB），默认 0.95MB（留一点余量给 multipart 头部）
 * @param {number} maxDimension - 最大边长（px），默认 2048
 * @returns {Promise<File>} 压缩后的 File 对象
 */
export function compressImage(file, maxSizeMB = 0.95, maxDimension = 2048) {
  return new Promise((resolve, reject) => {
    // 非图片或已经够小，直接返回
    if (!file.type.startsWith('image/')) {
      return resolve(file)
    }
    if (file.size / 1024 / 1024 <= maxSizeMB) {
      return resolve(file)
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        let { width, height } = img

        // 等比缩小：如果超过最大边长
        if (width > maxDimension || height > maxDimension) {
          const ratio = Math.min(maxDimension / width, maxDimension / height)
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        // 先尝试质量 0.8，不够则逐步降低
        let quality = 0.8
        const minQuality = 0.3
        const step = 0.1
        const targetBytes = maxSizeMB * 1024 * 1024

        const tryEncode = () => {
          canvas.toBlob(
            (blob) => {
              if (!blob) return resolve(file) // 压缩失败返回原文件

              if (blob.size > targetBytes && quality > minQuality) {
                quality -= step
                tryEncode()
              } else {
                // blob 转 File，保留原始文件名和修改后的 type
                const compressed = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                })
                console.log(
                  `[compressImage] ${(file.size / 1024).toFixed(0)}KB -> ${(compressed.size / 1024).toFixed(0)}KB (quality=${quality.toFixed(1)})`
                )
                resolve(compressed)
              }
            },
            'image/jpeg',
            quality
          )
        }

        tryEncode()
      }
      img.onerror = () => resolve(file)
      img.src = e.target.result
    }
    reader.onerror = () => resolve(file)
    reader.readAsDataURL(file)
  })
}

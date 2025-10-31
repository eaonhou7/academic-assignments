package utils

import (
	"crypto/md5"
	"encoding/hex"
	"errors"
	"os"
)

func PathExists(path string) (bool, error) {
	fi, err := os.Stat(path)
	if err == nil {
		if fi.IsDir() {
			return true, nil
		}
		return false, errors.New("存在同名文件")
	}
	if os.IsNotExist(err) {
		return false, nil
	}
	return false, err
}

// 计算字符串的 MD5 哈希值（返回十六进制字符串）
func Md5Encrypt(str string) string {
	// 1. 创建 MD5 哈希器
	hash := md5.New()

	// 2. 将数据写入哈希器（可以多次调用 Write 写入分片数据）
	hash.Write([]byte(str))

	// 3. 计算哈希结果（返回 16 字节的字节切片）
	bytes := hash.Sum(nil)

	// 4. 转换为十六进制字符串（32 位）
	return hex.EncodeToString(bytes)
}

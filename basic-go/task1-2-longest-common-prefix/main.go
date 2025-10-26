package main

import (
	"errors"
	"fmt"
	"strings"
)

// 查找字符串数组中的最长公共前缀
func CheckPrefix(str *string, prefix *string) bool {
	return strings.HasPrefix(*str, *prefix)
}

func CheckCommonPrefix(str []string) (string, error) {
	i := 0
	strArrLen := len(str)
	if strArrLen == 0 {
		return "", errors.New("array length is 0")
	}
	if strArrLen == 1 {
		return str[0], nil
	}
	firstStrArr := []byte(str[0])
	i = 0
	for {
		var oldPrefix string
		if i == 0 {
			oldPrefix = ""
		} else {
			oldPrefix = string(firstStrArr[0 : i-1])
		}
		prefix := string(firstStrArr[0:i])
		k := 1
		for k = 1; k < strArrLen; k++ {
			ok := CheckPrefix(&str[k], &prefix)
			if !ok {
				return oldPrefix, nil
			}
		}
		i++
	}
}

func main() {
	v1, e1 := CheckCommonPrefix([]string{"126345", "123", "1234"})
	v2, e2 := CheckCommonPrefix([]string{"23", "45", "67"})
	fmt.Println(v1, e1, v2, e2)
}

package main

import (
	"errors"
	"fmt"
)

// 给定一个只包括 '('，')'，'{'，'}'，'['，']' 的字符串，判断字符串是否有效
func ValidParentheses(str string) (bool, error) {
	strLen := len(str)
	if strLen%2 != 0 {
		return false, errors.New("Please valid array")
	}
	return CheckValidStr(str)
}

var signMap map[string]string = map[string]string{
	"[": "]", "(": ")", "{": "}",
}

func CheckValidStr(str string) (bool, error) {
	i := 0
	strLen := len(str)
	for {
		if i >= strLen-1-i {
			return true, nil
		}
		byt := string(str[i])
		sign, ok := signMap[byt]
		if !ok {
			return false, errors.New(fmt.Sprintf("The string is not valid:%s", byt))
		}
		if sign != string(str[strLen-1-i]) {
			return false, errors.New(
				fmt.Sprintf(
					"The string is not valid: %d, %d, %c, %c", i, strLen-1-i, str[i], str[strLen-1-i],
				))
		}
		i++
	}
}

func main() {
	v1, e1 := ValidParentheses("[{()}])(")
	v2, e2 := ValidParentheses("[{()}]")
	fmt.Println(v1, e1, v2, e2)
}

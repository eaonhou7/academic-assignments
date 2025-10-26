package main

import (
	"errors"
	"fmt"
)

//136. 只出现一次的数字：给定一个非空整数数组，除了某个元素只出现一次以外，其余每个元素均出现两次。找出那个只出现了一次的元素。可以使用 for 循环遍历数组，结合 if 条件判断和 map 数据结构来解决，例如通过 map 记录每个元素出现的次数，然后再遍历 map 找到出现次数为1的元素。

func PalindromeNumber(arr []int) (int, error) {
	if len(arr) <= 1 {
		return 0, errors.New("array length is less than one")
	}
	mapInt := make(map[int]int)
	for i := 0; i < len(arr); i++ {
		inputInt := arr[i]
		_, ok := mapInt[inputInt]
		if !ok {
			mapInt[inputInt] = 1
		} else {
			mapInt[inputInt]++
		}
	}

	for k, v := range mapInt {
		if v == 1 {
			return k, nil
		}
	}
	return 0, errors.New("no valid parentheses found")
}

func main() {
	v, e := PalindromeNumber([]int{1, 2, 2, 3, 3, 4, 4})
	if e == nil {
		fmt.Println(v)
	}
	v2, e2 := PalindromeNumber([]int{9, 9, 7, 5, 5, 44, 55, 55, 44})
	if e2 == nil {
		fmt.Println(v2)
	}
}

package main

import (
	"fmt"
)

// 给定一个由整数组成的非空数组所表示的非负整数，在该数的基础上加一
func PlusOne(arr []int) ([]int, error) {
	arrLen := len(arr)
	nextAdd := true
	i := 1
	for {
		if !nextAdd {
			return arr, nil
		}
		if arrLen < i {
			return append([]int{1}, arr...), nil
		}
		currentNumber := arr[arrLen-i]
		if currentNumber == 9 {
			arr[arrLen-i] = 0
		} else {
			arr[arrLen-i] = currentNumber + 1
			nextAdd = false
		}
		i++
	}
}

func plusOne(digits []int) []int {
	arrLen := len(digits)
	nextAdd := true
	i := 1
	for {
		if !nextAdd {
			return digits
		}
		if arrLen < i {
			return append([]int{1}, digits...)
		}
		currentNumber := digits[arrLen-i]
		if currentNumber == 9 {
			digits[arrLen-i] = 0
		} else {
			digits[arrLen-i] = currentNumber + 1
			nextAdd = false
		}
		i++
	}
}

func main() {
	v1, e1 := PlusOne([]int{1, 2, 3})
	v2, e2 := PlusOne([]int{9, 9, 9})
	v3, e3 := PlusOne([]int{9, 8, 7, 6, 5, 4, 2})
	fmt.Println(v1, e1, v2, e2, v3, e3)
}

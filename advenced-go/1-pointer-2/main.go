package main

import "fmt"

// 题目 ：实现一个函数，接收一个整数切片的指针，将切片中的每个元素乘以2。
func main() {
	arr := []int{1, 2, 3, 4, 5}
	PointMul(arr)
	fmt.Println(arr)
}

func PointMul(arr []int) {
	intLen := len(arr)
	for i := 0; i < intLen; i++ {
		arr[i] *= 10
	}
}

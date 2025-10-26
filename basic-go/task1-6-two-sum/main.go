package main

import (
	"fmt"
)

// 给定一个整数数组 nums 和一个目标值 target，请你在该数组中找出和为目标值的那两个整数
func twoSum(nums []int, target int) []int {
	numLen := len(nums)
	if numLen <= 1 {
		return []int{}
	}
	i, j := 0, 1
	for {
		if j >= numLen {
			break
		}
		for {
			if j >= numLen {
				break
			}
			if nums[i]+nums[j] == target {
				return []int{i, j}
			}
			j++
		}
		i++
		j = i + 1
	}
	return []int{}
}

func main() {
	arr := []int{2, 7, 11, 15}
	merged := twoSum(arr, 3)
	merged1 := twoSum(arr, 9)
	merged2 := twoSum(arr, 26)
	fmt.Println(merged, merged1, merged2)
}

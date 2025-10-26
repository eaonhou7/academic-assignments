package main

import (
	"fmt"
)

// 给你一个有序数组 nums ，请你原地删除重复出现的元素，使每个元素只出现一次，返回删除后数组的新长度。不要使用额外的数组空间，你必须在原地修改输入数组并在使用 O(1) 额外空间的条件下完成。可以使用双指针法，一个慢指针 i 用于记录不重复元素的位置，一个快指针 j 用于遍历数组，当 nums[i] 与 nums[j] 不相等时，将 nums[j] 赋值给 nums[i + 1]，并将 i 后移一位。
func SortedArr(nums []int) (int, []int) {
	arrLen := len(nums)
	if arrLen == 0 {
		return 0, nums
	}
	i, j, num := 0, 0, 0
	for {
		if j >= arrLen {
			return num, nums
		}
		if nums[i] == nums[j] {
			j++
		} else {
			fmt.Println(nums[i+1], nums[j])
			nums[i+1], nums[j] = nums[j], nums[i]
			fmt.Println(nums[i+1], nums[j])
			i++
			j++
			num++
		}
	}
}

func main() {
	v1, e1 := SortedArr([]int{0, 0, 0, 1, 1, 1, 4, 5, 8, 19})
	v2, e2 := SortedArr([]int{3, 3, 4, 4, 5, 5, 9, 9})
	v3, e3 := SortedArr([]int{11, 11, 12, 14, 14, 20, 20, 22, 22})
	fmt.Println(v1, e1, v2, e2, v3, e3)
}

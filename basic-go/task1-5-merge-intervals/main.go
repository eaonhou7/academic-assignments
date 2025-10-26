package main

import (
	"fmt"
	"math"
)

// 给你一个有序数组 nums ，请你原地删除重复出现的元素，使每个元素只出现一次，返回删除后数组的新长度。不要使用额外的数组空间，你必须在原地修改输入数组并在使用 O(1) 额外空间的条件下完成。可以使用双指针法，一个慢指针 i 用于记录不重复元素的位置，一个快指针 j 用于遍历数组，当 nums[i] 与 nums[j] 不相等时，将 nums[j] 赋值给 nums[i + 1]，并将 i 后移一位。
func merge(intervals [][]int) [][]int {
	i, j := 0, 1
	if len(intervals) <= 1 {
		return intervals
	}
	for {
		numLen := len(intervals)
		if numLen <= j {
			break
		}
		for {
			if numLen <= j {
				break
			}
			if intervals[i][0] > intervals[j][1] || intervals[i][1] < intervals[j][0] {
			} else {
				intervals[i][0] = int(math.Min(float64(intervals[i][0]), float64(intervals[j][0])))
				intervals[i][1] = int(math.Max(float64(intervals[i][1]), float64(intervals[j][1])))
				intervals = append(intervals[:j], intervals[j+1:]...)
				numLen = len(intervals)
			}
			j++
		}
		i++
		j = i + 1
	}
	return intervals
}

func main() {
	intervals := [][]int{
		{1, 3},
		{2, 6},
		{8, 10},
		{15, 18},
	}
	intervals1 := [][]int{
		{1, 4},
		{4, 5},
	}
	intervals2 := [][]int{
		{4, 7},
		{1, 4},
	}
	merged := merge(intervals)
	merged1 := merge(intervals1)
	merged2 := merge(intervals2)
	fmt.Println(merged, merged1, merged2)
}

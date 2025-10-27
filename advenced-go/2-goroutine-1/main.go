package main

import (
	"fmt"
	"sync"
)

var wg sync.WaitGroup

// 题目 ：编写一个程序，使用 go 关键字启动两个协程，一个协程打印从1到10的奇数，另一个协程打印从2到10的偶数。
// 考察点 ： go 关键字的使用、协程的并发执行。
func main() {
	for i := 0; i < 10; i++ {
		wg.Add(1)
		if i%2 == 0 {
			go PrintEven(i)
		} else {
			go PrintOdd(i)
		}
	}
	wg.Wait()
}

func PrintOdd(i int) {
	defer wg.Done()
	fmt.Println("奇数", i)
}

func PrintEven(i int) {
	defer wg.Done()
	fmt.Println("偶数", i)
}

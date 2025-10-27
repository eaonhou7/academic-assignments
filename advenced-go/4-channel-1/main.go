package main

import (
	"fmt"
	"sync"
)

var wg sync.WaitGroup

// 题目：编写一个程序，使用通道实现两个协程之间的通信。一个协程生成从1到10的整数，并将这些整数发送到通道中，另一个协程从通道中接收这些整数并打印出来。
func makeInt(ch chan int) {
	defer wg.Done()
	for i := 0; i <= 10; i++ {
		ch <- i
	}
	close(ch)
}

func printInt(ch chan int) {
	defer wg.Done()
	for {
		v, ok := <-ch
		if !ok {
			return
		}
		fmt.Println(v)
	}
}

func main() {
	wg.Add(2)
	ch := make(chan int)
	go makeInt(ch)
	go printInt(ch)
	wg.Wait()
}

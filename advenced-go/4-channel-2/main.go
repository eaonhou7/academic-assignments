package main

import (
	"fmt"
	"sync"
)

// 实现一个带有缓冲的通道，生产者协程向通道中发送100个整数，消费者协程从通道中接收这些整数并打印。
var wg sync.WaitGroup

func main() {
	wg.Add(2)
	ch := make(chan int, 100)
	go func() {
		defer wg.Done()
		for i := 0; i <= 100; i++ {
			ch <- i
		}
		close(ch)
	}()

	go func() {
		defer wg.Done()
		for {
			v, ok := <-ch
			if !ok {
				return
			}
			fmt.Println(v)
		}
	}()
	wg.Wait()
}

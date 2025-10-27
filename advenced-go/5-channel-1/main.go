package main

import (
	"fmt"
	"sync"
)

// 编写一个程序，使用 sync.Mutex 来保护一个共享的计数器。启动10个协程，每个协程对计数器进行1000次递增操作，最后输出计数器的值。
func main() {
	count := 0
	lock := sync.Mutex{}
	wg := sync.WaitGroup{}
	wg.Add(10)
	for i := 0; i < 10; i++ {
		go func() {
			defer wg.Done()
			for k := 0; k < 1000; k++ {
				lock.Lock()
				count++
				lock.Unlock()
			}
		}()
	}
	wg.Wait()
	fmt.Println(count)
}

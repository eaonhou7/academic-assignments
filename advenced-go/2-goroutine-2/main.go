package main

import (
	"fmt"
	"math/rand"
	"reflect"
	"sync"
	"time"
)

var wg sync.WaitGroup

// 题目 ：题目 ：设计一个任务调度器，接收一组任务（可以用函数表示），并使用协程并发执行这些任务，同时统计每个任务的执行时间。
type FuncType func(int, int) int

func main() {
	taskList := map[string]FuncType{
		"add": add,
		"mul": mul,
	}
	i, k := rand.Intn(100), rand.Intn(100)
	for _, fn := range taskList {
		callTask(fn, i, k)
	}
	wg.Wait()
}

func callTask(fn FuncType, i int, k int) int {
	start := time.Now()
	res := fn(i, k)
	end := time.Now()
	duration := end.Sub(start)
	fnName := reflect.ValueOf(fn).Pointer()
	fmt.Printf("Calling task %d\n , i : %d, k : %d, res: %d ,fnName : %s",
		duration.Nanoseconds(),
		i, k, res, fnName,
	)
	return res
}

func add(i int, j int) int {
	k := i + j
	return k
}

func mul(i int, j int) int {
	return i * j
}

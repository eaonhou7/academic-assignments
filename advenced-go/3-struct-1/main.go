package main

import (
	"fmt"
	"math"
)

// 题目 ：定义一个 Shape 接口，包含 Area() 和 Perimeter() 两个方法。然后创建 Rectangle 和 Circle 结构体，实现 Shape 接口。在主函数中，创建这两个结构体的实例，并调用它们的 Area() 和 Perimeter() 方法。
type Shape interface {
	Area()
	Perimeter()
}

type Circle struct {
	r float64
}

func (c *Circle) Area() float64 {
	return math.Pi * math.Pow(c.r, 2)
}

func (c *Circle) Perimeter() float64 {
	return 2 * math.Pi * c.r
}

type Rectangle struct {
	width  float64
	height float64
}

func (r *Rectangle) Area() float64 {
	return r.width * r.height
}

func (r *Rectangle) Perimeter() float64 {
	return 2 * (r.width + r.height)
}

func main() {
	shape := &Circle{5}
	shape2 := &Rectangle{5, 9}
	fmt.Printf("s1 Area：%.6f,s1 Perimeter：%.6f,s2 Area：%.6f,s2 Perimeter： %.6f",
		shape.Area(), shape.Perimeter(), shape2.Area(), shape2.Perimeter())
}

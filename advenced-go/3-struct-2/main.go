package main

import (
	"fmt"
)

// 题目：使用组合的方式创建一个 Person 结构体，包含 Name 和 Age 字段，再创建一个 Employee 结构体，组合 Person 结构体并添加 EmployeeID 字段。为 Employee 结构体实现一个 PrintInfo() 方法，输出员工的信息。

type Person struct {
	Name string
	Age  int
}

type Employee struct {
	EmployeeID int
	Persons    []Person
}

func (e *Employee) PrintInfo() {
	fmt.Println("PrintInfo:", e.Persons)
	for _, person := range e.Persons {
		fmt.Println("person.Name:", person.Name, ";person.Age:", person.Age)
	}
}

func main() {
	p1 := Person{"eaon", 18}
	p2 := Person{"eaon2", 19}
	e1 := Employee{1, []Person{p1, p2}}
	e1.PrintInfo()
}

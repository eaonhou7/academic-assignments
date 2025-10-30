package main

import (
	"fmt"
	_ "github.com/go-sql-driver/mysql" // MySQL 驱动（匿名导入）
	"github.com/jmoiron/sqlx"
)

/*
*
题目1：使用SQL扩展库进行查询
假设你已经使用Sqlx连接到一个数据库，并且有一个 employees 表，包含字段 id 、 name 、 department 、 salary 。
要求 ：
编写Go代码，使用Sqlx查询 employees 表中所有部门为 "技术部" 的员工信息，并将结果映射到一个自定义的 Employee 结构体切片中。
编写Go代码，使用Sqlx查询 employees 表中工资最高的员工信息，并将结果映射到一个 Employee 结构体中。
*/

var DB *sqlx.DB

type employee struct {
	Id         int     `db:"id"`
	Name       string  `db:"name"`
	Department string  `db:"department"`
	Salary     float32 `db:"salary"`
}

func init() {
	// 数据库连接信息（替换为实际配置）
	dsn := "root:goelia1995@tcp(10.41.3.224:3306)/eaon_test?parseTime=true"
	// 连接数据库
	var err error
	DB, err = sqlx.Connect("mysql", dsn)
	if err != nil {
		panic(fmt.Sprintf("链接数据库出错: %s", err))
	}
}

//INSERT INTO `eaon_test`.`employees` (`id`, `name`, `department`, `salary`) VALUES (1, 'eaon', '技术部', 1000.0000);
//INSERT INTO `eaon_test`.`employees` (`id`, `name`, `department`, `salary`) VALUES (2, 'jiin', '安全部', 1200.0000);
//INSERT INTO `eaon_test`.`employees` (`id`, `name`, `department`, `salary`) VALUES (3, 'bill', '总裁办', 2000.0000);
//INSERT INTO `eaon_test`.`employees` (`id`, `name`, `department`, `salary`) VALUES (4, 'logic', '技术部', 1100.0000);

func main() {

	// 编写Go代码，使用Sqlx查询 employees 表中所有部门为 "技术部" 的员工信息，并将结果映射到一个自定义的 Employee 结构体切片中。
	var emps []employee
	err := DB.Select(&emps, "select id, name, department, salary from employees where department = ?", "技术部")
	if err != nil {
		fmt.Printf("sql报错了1：%s", err)
	} else {
		fmt.Println("查询成功", emps)
	}

	// 编写Go代码，使用Sqlx查询 employees 表中工资最高的员工信息，并将结果映射到一个 Employee 结构体中。
	var emp employee
	err = DB.Get(&emp, "select * from employees order by salary desc limit 1")
	if err != nil {
		fmt.Printf("sql报错了2:%s", err)
	} else {
		fmt.Println("查询成功", emp)
	}
}

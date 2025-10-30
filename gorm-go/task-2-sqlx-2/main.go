package main

import (
	"encoding/json"
	"fmt"
	_ "github.com/go-sql-driver/mysql" // MySQL 驱动（匿名导入）
	"github.com/jmoiron/sqlx"
)

/*
题目2：实现类型安全映射
假设有一个 books 表，包含字段 id 、 title 、 author 、 price 。
要求 ：
定义一个 Book 结构体，包含与 books 表对应的字段。
编写Go代码，使用Sqlx执行一个复杂的查询，例如查询价格大于 50 元的书籍，并将结果映射到 Book 结构体切片中，确保类型安全。

CREATE TABLE books(
	`id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'id',
	`title` varchar(128) NOT NULL DEFAULT '' COMMENT 'title',
	`author` VARCHAR(64) DEFAULT '' COMMENT 'author',
	`price` DECIMAL(10,4) NOT NULL DEFAULT 0 COMMENT 'price',
	PRIMARY KEY (`id`) USING BTREE
)ENGINE=INNODB;
*/

var DB *sqlx.DB

type Book struct {
	Id     int     `db:"id"`
	Title  string  `db:"title"`
	Author string  `db:"author"`
	Price  float64 `db:"price"`
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

//
//INSERT INTO `eaon_test`.`books` (`id`, `title`, `author`, `price`) VALUES (1, '吃', 'eaon', 30.0000);
//INSERT INTO `eaon_test`.`books` (`id`, `title`, `author`, `price`) VALUES (2, '喝', 'jack', 50.0000);
//INSERT INTO `eaon_test`.`books` (`id`, `title`, `author`, `price`) VALUES (3, '玩', 'player', 80.0000);
//INSERT INTO `eaon_test`.`books` (`id`, `title`, `author`, `price`) VALUES (4, '乐', 'ewen', 100.0000);

func main() {

	// 编写Go代码，使用Sqlx执行一个复杂的查询，例如查询价格大于 50 元的书籍，并将结果映射到 Book 结构体切片中，确保类型安全。
	var books []Book
	err := DB.Select(&books, "select * from books where price >= ? and id != 0 group by id", 50)
	if err != nil {
		fmt.Printf("sql报错了1：%s", err)
	} else {
		fmt.Println("查询成功", books)
		data, _ := json.MarshalIndent(books, "", "  ")
		fmt.Println("查询成功", string(data))
	}
}

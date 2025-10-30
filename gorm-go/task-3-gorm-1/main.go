package main

import (
	"fmt"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

/*
题目1：模型定义
假设你要开发一个博客系统，有以下几个实体： User （用户）、 Post （文章）、 Comment （评论）。
要求 ：
使用Gorm定义 User 、 Post 和 Comment 模型，其中 User 与 Post 是一对多关系（一个用户可以发布多篇文章）， Post 与 Comment 也是一对多关系（一篇文章可以有多个评论）。
编写Go代码，使用Gorm创建这些模型对应的数据库表。
*/

var DB *gorm.DB

type User struct {
	ID    uint   `gorm:"primarykey"`
	Name  string `gorm:"column:name"`
	Posts []Post `gorm:"foreignKey:UserID;references:ID"` // 去掉指针
}

type Post struct {
	gorm.Model
	UserID   uint `gorm:"not null"`
	User     User `gorm:"foreignKey:UserID;references:ID"`
	Title    string
	Content  string
	Comments []Comment `gorm:"foreignKey:PostID;references:ID"` // 去掉指针
}

type Comment struct {
	gorm.Model
	UserID  uint `gorm:"not null"`
	PostID  uint `gorm:"not null"`
	User    User `gorm:"foreignKey:UserID;references:ID"`
	Post    Post `gorm:"foreignKey:PostID;references:ID"`
	Content string
}

func init() {
	// 数据库连接信息（替换为实际配置）
	dsn := "root:goelia1995@tcp(10.41.3.224:3306)/eaon_test?parseTime=true"
	// 连接数据库
	var err error
	DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{
		DisableForeignKeyConstraintWhenMigrating: true,
	})
	if err != nil {
		panic(fmt.Sprintf("链接数据库出错: %s", err))
	}
}

func main() {
	err := DB.AutoMigrate(&User{}, &Post{}, &Comment{})

	fmt.Println(err)
}

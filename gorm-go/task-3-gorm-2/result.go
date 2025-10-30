package main

import (
	"fmt"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

/*
题目2：关联查询
基于上述博客系统的模型定义。
要求 ：
编写Go代码，使用Gorm查询某个用户发布的所有文章及其对应的评论信息。
编写Go代码，使用Gorm查询评论数量最多的文章信息。
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
	DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		panic(fmt.Sprintf("链接数据库出错: %s", err))
	}
}

func main() {
	users := []User{
		{Name: "eaon", Posts: []Post{
			{
				Title: "title1", Content: "content1", Comments: []Comment{{Content: "comment11"}, {Content: "comment12"}, {Content: "comment13"}},
			},
			{
				Title: "title2", Content: "content2", Comments: []Comment{{Content: "comment21"}, {Content: "comment22"}, {Content: "comment23"}},
			},
		},
		},
		{
			Name: "jack",
			Posts: []Post{
				{
					Title: "title3", Content: "content3", Comments: []Comment{{Content: "comment31"}, {Content: "comment32"}, {Content: "comment33"}},
				},
				{
					Title: "title4", Content: "content4", Comments: []Comment{{Content: "comment41"}, {Content: "comment42"}, {Content: "comment43"}},
				},
			},
		},
	}

	// 无法自动自动设置关联
	//result := DB.Create(&users)
	//if result.Error != nil {
	//	fmt.Printf("创建用户失败: %s\n", result.Error)
	//	return
	//}

	for _, user := range users {
		currentUser := User{Name: user.Name}
		DB.Create(&currentUser)
		for _, post := range user.Posts {
			currentPost := Post{
				UserID:  currentUser.ID,
				Title:   post.Title,
				Content: post.Content,
			}
			DB.Create(&currentPost)
			for _, comment := range post.Comments {
				currentComment := Comment{
					UserID:  currentUser.ID,
					PostID:  currentPost.ID,
					Content: comment.Content,
				}
				DB.Create(&currentComment)
			}
		}
	}
	fmt.Printf("创建用户/文章/评论完成 \n\n")

	// 编写Go代码，使用Gorm查询某个用户发布的所有文章及其对应的评论信息。
	var resultUser User
	res := DB.Preload("Posts.Comments").First(&resultUser, 1)
	if res.Error != nil {
		fmt.Println("查询失败:", res.Error)
	} else {
		//fmt.Println(resultUser.Posts)
		for _, post := range resultUser.Posts {
			fmt.Printf("文章标题：%s, 文章评论数：%d \n", post.Title, len(post.Comments))
			for _, comment := range post.Comments {
				fmt.Printf("评论：%s \n", comment.Content)
			}
		}
	}

	type Result struct {
		PostId uint
		Count  int
	}
	var result Result
	// 编写Go代码，使用Gorm查询评论数量最多的文章信息。
	DB.Model(&Comment{}).Select(" post_id, count(post_id) count ").Group("post_id").Order("count desc").First(&result)

	fmt.Printf("\n\n 评论最多文章id:%d, 评论数为:%d\n", result.PostId, result.Count)
}

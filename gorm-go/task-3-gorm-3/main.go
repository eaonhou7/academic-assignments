package main

import (
	"fmt"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"strings"
	"time"
)

/*
为 Post 模型添加一个钩子函数，在文章创建时自动更新用户的文章数量统计字段。
为 Comment 模型添加一个钩子函数，在评论删除时检查文章的评论数量，如果评论数量为 0，则更新文章的评论状态为 "无评论"。
*/

var DB *gorm.DB

type User struct {
	ID            uint   `gorm:"primarykey"`
	Name          string `gorm:"column:name"`
	UserPostCount int
	Posts         []Post `gorm:"foreignKey:UserID;references:ID"` // 去掉指针
}

type Post struct {
	gorm.Model
	UserID        uint `gorm:"not null"`
	User          User `gorm:"foreignKey:UserID;references:ID"`
	Title         string
	Content       string
	Comments      []Comment `gorm:"foreignKey:PostID;references:ID"` // 去掉指针
	CommentStatus string
}

// 为 Post 模型添加一个钩子函数，在文章创建时自动更新用户的文章数量统计字段。
func (p *Post) BeforeCreate(tx *gorm.DB) (err error) {
	if p.UserID > 0 {
		var user User
		if err := tx.Preload("Posts").First(&user, p.UserID).Error; err != nil {
			return fmt.Errorf("获取用户失败: %v", err)
		}
		user.UserPostCount = len(user.Posts) + 1
		tx.Model(&User{}).Where("id", user.ID).Update("user_post_count", user.UserPostCount)
	}
	return
}

type Comment struct {
	UserID    uint `gorm:"not null"`
	PostID    uint `gorm:"not null"`
	User      User `gorm:"foreignKey:UserID;references:ID"`
	Post      Post `gorm:"foreignKey:PostID;references:ID"`
	Content   string
	ID        uint `gorm:"primarykey"`
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt gorm.DeletedAt `gorm:"index"`
}

func (c *Comment) BeforeDelete(tx *gorm.DB) (err error) {
	fmt.Println("beforeDelete")
	var fullComment Comment
	fmt.Println(c.ID, tx.Statement.SQL.String(), tx.Statement.Vars)
	if c.ID > 0 {
		if err := tx.Preload("Post.Comments").First(&fullComment, c.ID).Error; err != nil {
			return err
		}
		*c = fullComment
	} else {
		statement := tx.Statement
		fullSQL := statement.SQL.String()
		params := statement.Vars
		if strings.Contains(fullSQL, "`comments`.`id` = ?") && len(params) > 0 {
			if id, ok := params[1].(uint); ok {
				if err := tx.First(&fullComment, id).Error; err != nil {
					return err
				}
				*c = fullComment
			}
		}
	}
	return
}

// 为 Comment 模型添加一个钩子函数，在评论删除时检查文章的评论数量，如果评论数量为 0，则更新文章的评论状态为 "无评论"。
func (c *Comment) AfterDelete(tx *gorm.DB) (err error) {
	fmt.Println("afterDelete", len(c.Post.Comments)-1, 0)
	if len(c.Post.Comments)-1 <= 0 {
		tx.Model(&Post{}).Where("id = ?", c.PostID).Update("comment_status", "无评论")
	}
	return
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
	post := Post{
		UserID:  1,
		Title:   "eaon_test_title",
		Content: "eaon_test_content",
	}
	DB.Create(&post)

	var com = Comment{}
	DB.First(&com, 6)
	res3 := DB.Delete(&com)
	fmt.Println(res3.Error)
}

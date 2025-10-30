package main

import "C"
import (
	"encoding/json"
	"fmt"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"strings"
)

var DB *gorm.DB

type Comment struct {
	gorm.Model
	UserID uint `gorm:"not null"`
	PostID uint `gorm:"not null"`
	//User      User `gorm:"foreignKey:UserID;references:ID"`
	//Post      Post `gorm:"foreignKey:PostID;references:ID"`
	Content string
}

// 为 Comment 模型添加一个钩子函数，在评论删除时检查文章的评论数量，如果评论数量为 0，则更新文章的评论状态为 "无评论"。
func (c *Comment) AfterDelete(tx *gorm.DB) (err error) {
	var fullComment Comment
	if c.ID > 0 {
		if err := tx.First(&fullComment, c.ID).Error; err != nil {
			return err
		}
		*c = fullComment
	} else {
		statement := tx.Statement
		fullSQL := statement.SQL.String()
		params := statement.Vars
		// 方法2：从删除条件中提取ID
		if strings.Contains(fullSQL, "`comments`.`id` = ?") && len(params) > 0 {
			if id, ok := params[1].(uint); ok {
				if err := tx.First(&fullComment, id).Error; err != nil {
					return err
				}
				*c = fullComment
			}
		}
	}

	fmt.Println(fullComment)
	if fullComment.ID > 0 {
		data, _ := json.MarshalIndent(fullComment, "", "  ")
		fmt.Println("查询成功", string(data))
	}
	panic(tx.Statement.SQL.String())
	return
}

func init() {
	dsn := "root:goelia1995@tcp(10.41.3.224:3306)/eaon_test?parseTime=true"
	// 连接数据库
	var err error
	DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		panic(fmt.Sprintf("链接数据库出错: %s", err))
	}
}

func main() {
	var id uint = 6
	err := DB.Delete(&Comment{}, id).Error
	fmt.Println(err)
	return
}

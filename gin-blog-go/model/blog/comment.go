package blog

import "gin-blog-go/global"

type Comment struct {
	global.GLOBAL_MODEL
	UserID  uint
	User    User
	PostID  uint
	Post    Post
	Content string `json:"content" form:"content" gorm:"comment:content"`
}

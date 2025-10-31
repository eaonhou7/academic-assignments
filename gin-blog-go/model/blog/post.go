package blog

import (
	"gin-blog-go/global"
)

type Post struct {
	global.GLOBAL_MODEL
	Title    string `json:"title" form:"title" gorm:"comment:title"`
	Content  string `json:"content" form:"content" gorm:"comment:content"`
	UserID   uint
	User     User
	Comments []Comment
}

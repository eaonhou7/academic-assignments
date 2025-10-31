package blog

import (
	"gin-blog-go/global"
)

type User struct {
	global.GLOBAL_MODEL
	Username string `json:"username" form:"username" gorm:"comment:用户名"`
	Password string `json:"password" form:"password"  gorm:"comment:password"`
	Email    string `json:"email" form:"email"  gorm:"comment:email"`
	Posts    []Post
	Comments []Comment
}

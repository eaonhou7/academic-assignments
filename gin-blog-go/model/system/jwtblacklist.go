package system

import (
	"gin-blog-go/global"
)

type JwtBlackList struct {
	global.GLOBAL_MODEL
	Jwt string `gorm:"type:text;comment:jwt"`
}

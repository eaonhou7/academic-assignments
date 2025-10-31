package api

import (
	"fmt"
	"gin-blog-go/global"
	"gin-blog-go/model/blog"
	"gin-blog-go/model/common/response"
	"gin-blog-go/service"
	"gin-blog-go/utils"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type UserApi struct{}

func (s *UserApi) Login(c *gin.Context) {
	var userRegister blog.User
	err := c.ShouldBind(&userRegister)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}
	currentService := service.OperationUserService{}

	user, err := currentService.GetUserByEmail(userRegister.Email)
	if err != nil || user.ID <= 0 {
		global.GLOBAL_ZAP.Error("用户不存在!", zap.Error(err))
		response.FailWithMessage("用户不存在", c)
		return
	}

	if user.Password != utils.Md5Encrypt(userRegister.Password) {
		global.GLOBAL_ZAP.Error("用户名密码不匹配!", zap.Error(err))
		response.FailWithMessage("用户名密码不匹配", c)
		return
	}
	token, err := utils.GenerateToken(user.ID, user.Username)
	if err != nil {
		response.FailWithMessage("生成令牌失败", c)
		return
	}
	utils.SetToken(c, token, 0)
	response.OkWithDetailed(gin.H{
		"token": token,
		"user": gin.H{
			"id":       user.ID,
			"username": user.Username,
			"email":    user.Email,
		},
	}, "登陆成功", c)
}

func (s *UserApi) Register(c *gin.Context) {
	var userRegister blog.User
	err := c.ShouldBind(&userRegister)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}
	currentService := service.OperationUserService{}

	exist, _ := currentService.ExistUserByEmail(userRegister.Email)
	fmt.Println(exist, userRegister.Email)
	if exist {
		global.GLOBAL_ZAP.Error("注册失败!", zap.Error(err))
		response.FailWithMessage("注册失败, 用户已存在", c)
		return
	}

	userRegister.Password = utils.Md5Encrypt(userRegister.Password)

	err = currentService.Register(&userRegister)
	if err != nil {
		global.GLOBAL_ZAP.Error("注册失败!", zap.Error(err))
		response.FailWithMessage("注册失败", c)
		return
	}
	response.OkWithDetailed(userRegister, "注册成功", c)
}

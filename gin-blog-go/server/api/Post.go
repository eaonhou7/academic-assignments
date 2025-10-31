package api

import (
	"fmt"
	"gin-blog-go/global"
	"gin-blog-go/model/blog"
	"gin-blog-go/model/common/response"
	"gin-blog-go/service"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"strconv"
)

type PostApi struct{}

func (s *PostApi) Create(c *gin.Context) {
	var post blog.Post
	err := c.ShouldBind(&post)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}
	if post.Title == "" || post.Content == "" {
		global.GLOBAL_ZAP.Error("创建文章，标题和内容不能为空")
		response.FailWithMessage("创建文章，标题和内容不能为空", c)
		return
	}
	post.UserID = c.GetUint("currentUserId")
	currentService := service.OperationPostService{}
	err = currentService.Create(&post)
	if err != nil {
		global.GLOBAL_ZAP.Error("创建Post失败!", zap.Error(err))
		response.FailWithMessage("创建Post失败", c)
		return
	}
	response.OkWithDetailed(post, "创建成功", c)
}

func (s *PostApi) Update(c *gin.Context) {
	chain, exists := c.Get("claims")
	fmt.Println(chain)
	if !exists {
		global.GLOBAL_ZAP.Error("获取chain失败，更新post失败，请重新登录!")
		response.FailWithMessage("获取chain失败，更新post失败，请重新登录", c)
		return
	}
	currentUserId := c.GetUint("currentUserId")
	currentService := service.OperationPostService{}
	id, _ := strconv.Atoi(c.Param("id"))
	oldPost, _ := currentService.Detail(id)
	if oldPost.ID <= 0 {
		global.GLOBAL_ZAP.Error("文章不存在，无法更新!")
		response.NoFound("获取chain失败，更新post失败，请重新登录", c)
		return
	}

	if oldPost.UserID != currentUserId {
		global.GLOBAL_ZAP.Error("当前用户不是文章的作者!")
		response.FailWithMessage("当前用户不是文章的作者", c)
		return
	}
	var post blog.Post
	err := c.ShouldBind(&post)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}
	post.ID = uint(id)
	err = currentService.Update(&post)
	if err != nil {
		global.GLOBAL_ZAP.Error("更新Post失败!", zap.Error(err))
		response.FailWithMessage("更新Post失败", c)
		return
	}
	response.OkWithDetailed(post, "更新成功", c)
}

func (s *PostApi) Delete(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	currentUserId := c.GetUint("currentUserId")
	currentService := service.OperationPostService{}
	oldPost, _ := currentService.Detail(id)
	if oldPost.ID <= 0 {
		global.GLOBAL_ZAP.Error("文章不存在，无法更新!")
		response.NoFound("获取chain失败，更新post失败，请重新登录", c)
		return
	}
	if oldPost.UserID != currentUserId {
		global.GLOBAL_ZAP.Error("当前用户不是文章的作者!")
		response.FailWithMessage("当前用户不是文章的作者", c)
		return
	}
	err := currentService.Delete(id)
	if err != nil {
		global.GLOBAL_ZAP.Error("删除Post失败!", zap.Error(err))
		response.FailWithMessage("删除Post失败", c)
		return
	}
	response.OkWithMessage("更新成功", c)
}

func (s *PostApi) List(c *gin.Context) {
	currentService := service.OperationPostService{}
	posts, err := currentService.List()
	if err != nil {
		global.GLOBAL_ZAP.Error("获取Posts失败!", zap.Error(err))
		response.FailWithMessage("获取Posts失败", c)
		return
	}
	response.OkWithDetailed(posts, "获取Posts成功", c)
}

func (s *PostApi) Detail(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	currentService := service.OperationPostService{}
	post, err := currentService.Detail(id)
	if post.ID <= 0 {
		global.GLOBAL_ZAP.Error("文章不存在，无法删除!")
		response.NoFound("获取chain失败，更新post失败，请重新登录", c)
		return
	}
	if err != nil {
		global.GLOBAL_ZAP.Error("删除Post失败!", zap.Error(err))
		response.FailWithMessage("删除Post失败", c)
		return
	}
	response.OkWithDetailed(post, "更新成功", c)
}

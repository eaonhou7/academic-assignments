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

type CommentApi struct{}

func (s *CommentApi) ArticleComment(c *gin.Context) {
	currentService := service.OperationCommentService{}
	postId, _ := strconv.Atoi(c.Param("postId"))
	fmt.Println(postId)
	posts, err := currentService.ArticleComment(postId)
	if err != nil {
		global.GLOBAL_ZAP.Error("获取Article失败!", zap.Error(err))
		response.FailWithMessage("获取Article失败", c)
		return
	}
	response.OkWithDetailed(posts, "获取Article成功", c)
}

func (s *CommentApi) Create(c *gin.Context) {
	var comment blog.Comment
	err := c.ShouldBind(&comment)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}
	fmt.Println(comment)
	if comment.Content == "" {
		global.GLOBAL_ZAP.Error("评论不能为空")
		response.FailWithMessage("评论不能为空", c)
		return
	}
	postId, _ := strconv.Atoi(c.Param("postId"))
	comment.PostID = uint(postId)
	comment.UserID = c.GetUint("currentUserId")
	fmt.Println(comment)
	currentService := service.OperationCommentService{}
	err = currentService.Create(&comment)
	if err != nil {
		global.GLOBAL_ZAP.Error("创建Post失败!", zap.Error(err))
		response.FailWithMessage("创建Post失败", c)
		return
	}
	response.OkWithDetailed(comment, "创建成功", c)
}

package router

import (
	"gin-blog-go/server/api"
	"github.com/gin-gonic/gin"
)

//type normalRouter struct{}

func InitNormalRouter(Router *gin.RouterGroup) {
	normalRouter := Router.Group("/user")
	{
		userApi := &api.UserApi{}
		normalRouter.POST("/register", userApi.Register) // 注册账号
		normalRouter.POST("/login", userApi.Login)       // 登陆
	}

	normalRouter = Router.Group("/article")
	{
		postApi := &api.PostApi{}
		normalRouter.GET("/", postApi.List)      // 获取文章列表
		normalRouter.GET("/:id", postApi.Detail) // 获取文章明细
	}

	normalRouter = Router.Group("/comments")
	{
		commentApi := &api.CommentApi{}
		normalRouter.GET("/:postId", commentApi.ArticleComment) // 获取文章评论
	}
}

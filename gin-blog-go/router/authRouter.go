package router

import (
	"gin-blog-go/middleware"
	"gin-blog-go/server/api"
	"github.com/gin-gonic/gin"
)

//type authRouter struct{}

func InitAuthRouter(Router *gin.RouterGroup) {
	authRouter := Router.Group("/article").Use(middleware.JWTAuth())
	{
		postApi := &api.PostApi{}
		authRouter.POST("/", postApi.Create)      // 创建文章
		authRouter.PUT("/:id", postApi.Update)    // 更新文章
		authRouter.DELETE("/:id", postApi.Delete) // 删除文章
	}

	authRouter = Router.Group("/comment").Use(middleware.JWTAuth())
	{
		commentApi := &api.CommentApi{}
		authRouter.POST("/:postId", commentApi.Create) // 文章评论
	}
}

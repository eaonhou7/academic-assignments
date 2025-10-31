package initapp

import (
	"gin-blog-go/global"
	blogRouter "gin-blog-go/router"
	"github.com/gin-gonic/gin"
)

func Routers() *gin.Engine {
	Router := gin.New()
	Router.Use(gin.Recovery())
	if gin.Mode() == gin.DebugMode {
		Router.Use(gin.Logger())
	}

	//PublicGroup := Router.Group(global.G.System.RouterPrefix)
	//PrivateGroup := Router.Group(global.GVA_CONFIG.System.RouterPrefix)

	router := Router.Group("/")
	blogRouter.InitAuthRouter(router)
	blogRouter.InitNormalRouter(router)

	global.GLOBAL_ROUTERS = Router.Routes()

	global.GLOBAL_ZAP.Info("router register success")
	return Router
}

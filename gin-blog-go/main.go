package main

import (
	"gin-blog-go/core"
	"gin-blog-go/global"
	"gin-blog-go/initapp"
)

func main() {
	// 初始化系统
	initializeBlog()
	// 运行服务器
	core.RunServer()
}

func initializeBlog() {
	//加载配置文件
	global.GLOBAL_VP = core.Viper()
	//加载日志服务
	global.GLOBAL_ZAP = core.Zap()
	//加载gorm
	global.GLOBAL_DB = initapp.Gorm()

	if global.GLOBAL_DB != nil {
		// 建表
		initapp.RegisterTables() // 初始化表

		//initapp.InitBlogData()
	}
}

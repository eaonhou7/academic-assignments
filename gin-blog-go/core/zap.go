package core

import (
	"fmt"
	"gin-blog-go/core/internal"
	"gin-blog-go/global"
	"gin-blog-go/utils"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"os"
)

func Zap() (logger *zap.Logger) {
	if ok, _ := utils.PathExists(global.GLOBAL_CONFIG.Zap.Director); !ok { // 判断是否有Director文件夹
		fmt.Printf("create %v directory\n", global.GLOBAL_CONFIG.Zap.Director)
		_ = os.Mkdir(global.GLOBAL_CONFIG.Zap.Director, os.ModePerm)
	}
	levels := global.GLOBAL_CONFIG.Zap.Levels()
	length := len(levels)
	cores := make([]zapcore.Core, 0, length)
	for i := 0; i < length; i++ {
		core := internal.NewZapCore(levels[i])
		cores = append(cores, core)
	}
	logger = zap.New(zapcore.NewTee(cores...))
	if global.GLOBAL_CONFIG.Zap.ShowLine {
		logger = logger.WithOptions(zap.AddCaller())
	}
	return logger
}

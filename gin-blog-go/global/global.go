package global

import (
	"gin-blog-go/config"
	"github.com/gin-gonic/gin"
	"github.com/spf13/viper"
	"go.uber.org/zap"
	"golang.org/x/sync/singleflight"
	"gorm.io/gorm"
	"sync"
)

var (
	GLOBAL_VP *viper.Viper
	GLOBAL_DB *gorm.DB
	// 统一处理日志，Error 和 info
	GLOBAL_ZAP                 *zap.Logger
	lock                       sync.RWMutex
	GLOBAL_CONFIG              config.Server
	GLOBAL_Concurrency_Control = &singleflight.Group{}
	GLOBAL_ROUTERS             gin.RoutesInfo
)

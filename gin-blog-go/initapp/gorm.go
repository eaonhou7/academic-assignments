package initapp

import (
	"gin-blog-go/config"
	"gin-blog-go/global"
	"gin-blog-go/model/blog"
	"gin-blog-go/model/system"
	"gin-blog-go/utils"
	"go.uber.org/zap"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"os"
)

func Gorm() *gorm.DB {
	m := global.GLOBAL_CONFIG.Mysql
	return initMysqlDatabase(m)
}

func initMysqlDatabase(m config.Mysql) *gorm.DB {
	if m.Database == "" {
		return nil
	}
	mysqlConfig := mysql.Config{
		DSN:                       m.Dsn(), // DSN data source name
		DefaultStringSize:         191,     // string 类型字段的默认长度
		SkipInitializeWithVersion: false,   // 根据版本自动配置
	}
	if db, err := gorm.Open(mysql.New(mysqlConfig), &gorm.Config{
		DisableForeignKeyConstraintWhenMigrating: true}); err != nil {
		panic(err)
	} else {
		//db.InstanceSet("gorm:table_options", "ENGINE=mysql")
		//sqlDB, _ := db.DB()
		//sqlDB.SetMaxIdleConns(m.MaxIdleConns)
		//sqlDB.SetMaxOpenConns(m.MaxOpenConns)
		return db
	}
}

func RegisterTables() {
	if global.GLOBAL_CONFIG.Mysql.DisableAutoMigrate {
		global.GLOBAL_ZAP.Info("auto-migrate is disabled, skipping table registration")
		return
	}

	db := global.GLOBAL_DB
	err := db.AutoMigrate(
		blog.User{},
		blog.Post{},
		blog.Comment{},
		system.JwtBlackList{},
	)
	if err != nil {
		global.GLOBAL_ZAP.Error("register table failed", zap.Error(err))
		os.Exit(0)
	}

	global.GLOBAL_ZAP.Info("register table success")
}

func InitBlogData() {
	users := []blog.User{
		{
			Username: "eaon",
			Password: utils.Md5Encrypt("password1"),
			Email:    "eaon@gmail.com",
			Posts: []blog.Post{
				{Title: "blog title 1", Content: "blog content 1", Comments: []blog.Comment{
					{Content: "blog comment 11"}, {Content: "blog comment 12"}, {Content: "blog comment 13"},
				}},
				{Title: "blog title 2", Content: "blog content 2", Comments: []blog.Comment{
					{Content: "blog comment 21"}, {Content: "blog comment 22"}, {Content: "blog comment 23"},
				}},
			},
		},
		{
			Username: "jack",
			Password: utils.Md5Encrypt("password1"),
			Email:    "jack@gmail.com",
			Posts: []blog.Post{
				{Title: "blog title 3", Content: "blog content 3", Comments: []blog.Comment{
					{Content: "blog comment 31"}, {Content: "blog comment 32"}, {Content: "blog comment 33"},
				}},
				{Title: "blog title 4", Content: "blog content 4", Comments: []blog.Comment{
					{Content: "blog comment 41"}, {Content: "blog comment 42"}, {Content: "blog comment 43"},
				}},
			},
		},
		{
			Username: "frank",
			Password: utils.Md5Encrypt("password1"),
			Email:    "frank@gmail.com",
			Posts: []blog.Post{
				{Title: "blog title 5", Content: "blog content 5", Comments: []blog.Comment{
					{Content: "blog comment 51"}, {Content: "blog comment 52"}, {Content: "blog comment 53"},
				}},
				{Title: "blog title 6", Content: "blog content 6", Comments: []blog.Comment{
					{Content: "blog comment 61"}, {Content: "blog comment 62"}, {Content: "blog comment 63"},
				}},
			},
		},
	}

	for _, user := range users {
		currentUser := blog.User{Username: user.Username, Password: user.Password, Email: user.Email}
		global.GLOBAL_DB.Create(&currentUser)
		for _, post := range user.Posts {
			currentPost := blog.Post{
				UserID:  currentUser.ID,
				Title:   post.Title,
				Content: post.Content,
			}
			global.GLOBAL_DB.Create(&currentPost)
			for _, comment := range post.Comments {
				currentComment := blog.Comment{
					UserID:  currentUser.ID,
					PostID:  currentPost.ID,
					Content: comment.Content,
				}
				global.GLOBAL_DB.Create(&currentComment)
			}
		}
	}
	global.GLOBAL_ZAP.Info("创建用户/文章/评论完成")
}

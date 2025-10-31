package config

// database:
// type: "mysql"
// host: "10.41.3.224"
// port: 3306
// user: "root"
// password: "goelia@1995"
type Mysql struct {
	Host               string `mapstructure:"host" json:"host" yaml:"host"`                                                 // ip
	Port               string `mapstructure:"port" json:"port" yaml:"port"`                                                 // 端口
	User               string `mapstructure:"user" json:"user" yaml:"user"`                                                 // 账号
	Password           string `mapstructure:"password" json:"password" yaml:"password"`                                     // 密码
	Database           string `mapstructure:"database" json:"database" yaml:"database"`                                     // 数据库
	Config             string `mapstructure:"config" json:"config" yaml:"config"`                                           // 配置文件
	DisableAutoMigrate bool   `mapstructure:"disable-auto-migrate" json:"disable-auto-migrate" yaml:"disable-auto-migrate"` // 自动迁移数据库表结构，生产环境建议设为false，手动迁移
}

func (m Mysql) Dsn() string {
	return m.User + ":" + m.Password + "@tcp(" + m.Host + ":" + m.Port + ")/" + m.Database + "?" + m.Config
}

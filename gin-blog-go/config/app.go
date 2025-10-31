package config

// name: "myapp"
// env: local # 修改为public可以关闭路由日志输出
// addr: 8888
// open-log: true
type App struct {
	Name   string `mapstructure:"name" json:"name" yaml:"name"`          // 项目名称
	Env    string `mapstructure:"env" json:"env" yaml:"env"`             // 环境
	Addr   int    `mapstructure:"addr" json:"addr" yaml:"addr"`          // 端口
	UseLog bool   `mapstructure:"use-log" json:"use-log" yaml:"use-log"` // 是否使用日志
}

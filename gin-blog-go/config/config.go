package config

type Server struct {
	App   App   `mapstructure:"app" json:"app" yaml:"app"`
	JWT   JWT   `mapstructure:"jwt" json:"jwt" yaml:"jwt"`
	Mysql Mysql `mapstructure:"mysql" json:"mysql" yaml:"mysql"`
	Zap   Zap   `mapstructure:"zap" json:"zap" yaml:"zap"`
}

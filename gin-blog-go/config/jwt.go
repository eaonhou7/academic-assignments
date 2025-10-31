package config

type JWT struct {
	SigningKey  string `mapstructure:"signing-key" json:"signing-key" yaml:"signing-key"`                // jwt签名
	ExpiresTime int    `mapstructure:"expires-time-day" json:"expires-time-day" yaml:"expires-time-day"` // 过期时间
	BufferTime  int    `mapstructure:"buffer-time-day" json:"buffer-time-day" yaml:"buffer-time-day"`    // 缓冲时间
	Issuer      string `mapstructure:"issuer" json:"issuer" yaml:"issuer"`                               // 签发者
}

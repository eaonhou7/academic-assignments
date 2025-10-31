- 作业截图放在 academic-pic 下

### gin blog 操作手册

- 安装好go后，执行 go mod tiny 自动安装包
- 配置好 config.yaml内的 address，数据库等信息即可启动
- 其中包含功能为
  - 使用viper 读取./config.yaml 文件并加载到全局变量
  - 使用zap 用于记录日志
  - 使用Gorm 用于连接mysql 数据库
  - 数据库生成 - user / posts / comments 表
  - 数据库测试数据填充 (如果需要填充数据，请将 main.go 的 initapp.InitBlogData() 的注释去掉)
  - 路由分别放在 router 下（authRouter 需要jwt认证 / normalRoute 不需要认证）
  - 使用了jwt 进行权限认证
  - 错误日志 和 info 统一放到log下
  - 响应统一处理 放到了 model/common/response/response.go


# 主服务器配置
当执行`node cli init`后，系统将自动生成`config.json`

[typescript定义文件](https://github.com/ZhangZisu/perilla/blob/master/src/definitions/sysconfig.ts)

[JSON Schemas](https://github.com/ZhangZisu/perilla/blob/master/schemas/sysconfig.json)

## defaultAdminUserID
> string

默认管理员用户ID，用于管理

## defaultAdminRoleID
> string

默认管理员角色ID，用于管理及自动生成资源权控

## defaultJudgerUserID
> string

默认评测用户ID，用于管理

## defaultJudgerRoleID
> string

默认评测角色ID，用于管理及自动生成资源权控

## defaultUserRoleID
> string

默认用户角色ID，用于管理及自动生成资源权控

## db
> object

数据库配置

数据库链接实现为[mongoose](https://mongoosejs.com/)

### db.url
> string

数据库URL

作为参数传递到`mongoose.connect`中[database.ts](https://github.com/ZhangZisu/perilla/blob/master/src/database.ts#L4)

### db.options
> object

数据库连接参数，见[mongoose/index.d.ts](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/mongoose/index.d.ts#L436)

作为参数传递到`mongoose.connect`中[database.ts](https://github.com/ZhangZisu/perilla/blob/master/src/database.ts#L4)

## mail
> object

邮件配置

邮件使用[Nodemailer](https://nodemailer.com/)

### mail.enabled
> boolean

是否使用邮件系统（目前只对注册有效）

### mail.options
> object

邮件初始化选项，见[https://nodemailer.com/smtp/](https://nodemailer.com/smtp/)

作为参数转递到[mail.ts](https://github.com/ZhangZisu/perilla/blob/master/src/mail.ts#L4)

### mail.from
> string

邮件的发送者

## http
> object

HTTP 服务器参数

该项目使用[expressjs](http://expressjs.com/)

### http.port
> number

侦听端口

### http.hostname
> string

侦听主机名，同时用在注册邮件等需要获取地址的地方
# LightOnlineJudge
Light-weight Online Judge Platform

- RBAC Access control
- MEVN Full javascript stack
- RESTFul API Design

Status: under development

## API List
|描述|路径|方法|实现状态|权限|
|-|-|-|-|-|
|获取用户角色|`/rolesof`|`GET`|YES|`public`|
|登陆|`/login`|`POST`|YES|`public`|
|上传文件|`/api/file/upload`|`POST`|YES|`ICommonAccess.createFile`|
|下载文件|`/api/file/:id`|`GET`|YES|`IFileAccessConfig.read`|
|更新文件|`/api/file/:id`|`POST`|YES|`IFileAccessConfig.modify`|
|删除文件|`/api/file/:id`|`DELETE`|YES|`IFileAccessConfig.modify`|
|获取文件信息|`/api/file/:id/meta`|`GET`|YES|`IFileAccessConfig.read`|
|编辑文件信息|`/api/file/:id/meta`|`POST`|YES|`IFileAccessConfig.modify`|
|获取文件|`/api/file/:id/raw`|`GET`|YES|`IFileAccessConfig.read`|
|新建题目|`/api/problem/new`|`POST`|YES|`ICommonAccess.createProblem`|
|获取题目列表|`/api/problem/list`|`GET`|YES|`login`|
|获取题目|`/api/problem/:id`|`GET`|YES|`IProblemAccessConfig.read`|
|获取题目编辑权限|`/api/problem/:id/access`|`GET`|YES|`IProblemAccessConfig.read`|
|更新题目|`/api/problem/:id`|`POST`|YES|`IProblemAccessConfig.modify*`|
|删除题目|`/api/problem/:id`|`DELETE`|YES|`IProblemAccessConfig.remove`|
|新建提交|`/api/solution/new`|`POST`|YES|`login`|
|获取提交列表|`/api/solution/list`|`GET`|YES|`login`|
|获取提交|`/api/solution/:id`|`GET`|YES|`ISolutionAccessConfig.read*`|
|删除提交|`/api/solution/:id`|`DELETE`|YES|`ISolutionAccessConfig.remove`|
|重测提交|`/api/solution/:id/rejudge`|`POST`|PART|`ISolutionAccessConfig.rejudge`|
|用户注册|`/api/register`|`POST`|NO|`public`|
|用户生成|`/api/user/generate`|`POST`|NO|`ICommonAccess.createUser`|
|用户列表|`/api/user/list`|`GET`|NO|`login`|
|用户信息|`/api/user/:id`|`GET`|NO|`login`|
|用户修改|`/api/user/:id`|`POST`|NO|`ICommonAccess.modifyUser or ID match`|
|用户删除|`/api/user/:id`|`DELETE`|NO|`ICommonAccess.modifyUser or ID match`|
|角色生成|`/api/role/generate`|`POST`|NO|`ICommonAccess.createRole`|
|角色列表|`/api/role/list`|`GET`|NO|`login`|
|角色信息|`/api/role/:id`|`GET`|NO|`login`|
|角色修改|`/api/role/:id`|`POST`|NO|`ICommonAccess.modifyRole`|
|角色删除|`/api/role/:id`|`DELETE`|NO|`ICommonAccess.modifyRole`|
# gouyinhepai

小孔的冒险之旅 H5 项目。

这是一个面向抖音发布场景的活动网页，核心流程是：
- 登录抖音账号
- 上传用户照片
- 选择小孔装扮
- 生成合成海报
- 发布到抖音

## 仓库信息

- GitHub: `git@github.com:Jeremy-Kong/gouyinhepai.git`
- HTTPS: `https://github.com/Jeremy-Kong/gouyinhepai`
- 默认分支: `main`

## 线上地址

- 正式访问地址: `https://jeremykong.club/hepai/`
- 当前服务器 IP: `106.54.6.169`
- 当前部署用户: `ubuntu`

## 服务器部署信息

- 页面目录: `/var/www/hepai/`
- 后端服务目录: `/home/ubuntu/douyinhepai/explore-proxy/`
- 旧测试目录: `/var/www/html/hepai/`（不再使用）
- Nginx 站点配置: `/etc/nginx/sites-available/jeremykong.club`
- 域名路径通过 `location /hepai/` 暴露

## 本地开发

项目是纯静态页面：
- `index.html`
- `styles.css`
- `script.js`
- `images/`

本地预览可用：

```bash
python3 -m http.server 8080
```

然后访问：

```text
http://localhost:8080
```

## 当前页面结构

- 顶部品牌区
  - `JEREMY·KONG STUDIO`
  - 主标题 `小孔的冒险之旅`
- 主区域
  - 左侧：选择陪伴的小孔
  - 中间：箭头
  - 右侧：上传照片 + `去冒险`
- 结果区
  - 生成冒险合成图
  - 发布抖音
- 底部版权区

## 当前小孔素材

当前页面使用 8 套装扮：
- 宇航员
- 赛博朋克
- 飞行员
- 极地
- 蒸汽朋克
- 乡土
- 酷boy
- 时尚先锋

原图位于：`images/*.png`

为页面提速，已生成网页缩略图：
- 目录：`images/thumbs/`
- 当前这批缩略图已生成，但线上路径访问还需进一步确认后再正式切换使用

## 当前实现状态

已完成：
- 页面整体 UI 与官网风格统一
- 抖音登录弹窗交互（当前为模拟登录）
- 上传本地照片
- 选择小孔装扮
- 前端 Canvas 合成海报
- 发布抖音按钮逻辑（当前为模拟发布）
- GitHub 仓库初始化和首次推送

未完成 / 需继续优化：
- 真正接入抖音登录能力
- 真正接入抖音发布能力
- 真正接入 AI 图像生成 / 图像编辑接口
- 合成图当前仍为前端海报式合成，非模型生成
- 合成图视觉还需要继续减少“拼贴感”
- 缩略图线上路径需要继续修通后再启用

## 当前已知问题

1. 合成图效果
- 当前是单张海报输出，但还需要继续优化真实融合感
- 用户反馈曾出现“上下重复感”，说明主画面和角色融合仍需继续打磨

2. 图片性能
- 原始 PNG 较大，很多在 5MB 左右
- 已做延迟加载
- 已生成缩略图，但线上 `/hepai/images/thumbs/...` 访问曾返回 404，需要继续检查 Nginx / alias / 静态资源路径

3. 真 AI 能力
- 目前没有接入图像模型 API
- 如要实现真正 AI 合成，需要补充接口地址和 API Key

## SSH / 凭证说明

### GitHub SSH key

当前用于 GitHub 推送的本地私钥路径：

```text
/Users/m100448211/.ssh/github_gouyinhepai
```

对应公钥已添加到 GitHub。

换电脑后如果继续使用：
- 需要把这把私钥复制到新电脑的 `~/.ssh/`
- 并执行：

```bash
chmod 600 ~/.ssh/github_gouyinhepai
```

### 服务器 SSH key

当前用于部署服务器的本地私钥路径：

```text
/Users/m100448211/.ssh/xiaokong_deploy/id_rsa
```

换电脑后如要继续部署，同样需要安全复制该私钥并设置权限。

## 推送命令

当前仓库使用 SSH 推送 GitHub：

```bash
GIT_SSH_COMMAND='ssh -i "/Users/m100448211/.ssh/github_gouyinhepai" -o IdentitiesOnly=yes' git push -u origin main
```

## 部署命令

静态文件同步到线上：

```bash
scp -i ~/.ssh/xiaokong_deploy/id_rsa index.html styles.css script.js ubuntu@106.54.6.169:/var/www/hepai/
```

图片同步：

```bash
scp -i ~/.ssh/xiaokong_deploy/id_rsa images/* ubuntu@106.54.6.169:/var/www/hepai/images/
```

## 建议的下一步

推荐继续按这个顺序做：

1. 修复缩略图线上访问路径并重新启用缩略图
2. 继续优化合成图，让小孔更自然融入用户照片
3. 接入真实 AI 图像生成 / 编辑接口
4. 接入真实抖音登录和发布

## 备注

如果换电脑继续开发，建议流程：

1. 克隆仓库
2. 恢复 GitHub SSH key
3. 恢复服务器 SSH key
4. 启动本地静态服务
5. 从 `README.md` 的“当前已知问题”和“建议的下一步”继续

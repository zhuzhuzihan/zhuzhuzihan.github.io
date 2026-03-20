# 智能课程表 (Smart Schedule)

## 项目概述

这是一个部署在 GitHub Pages 上的智能课程表 Web 应用，用于管理日常课程安排。应用支持自定义时间设置、课程管理、配置导入导出等功能。

**项目位置**: `zhuzhuzihan.github.io/kcb`

## 技术栈

- **前端框架**: 原生 JavaScript (ES6+, async/await)
- **UI 框架**: Bootstrap 5.3.0 (CDN)
- **数据存储**: localStorage
- **样式**: CSS3 (CSS 变量、渐变、动画)
- **压缩**: CompressionStream API (gzip)

## 文件结构

```
kcb/
├── index.html    # 主页面，包含所有 HTML 结构和模态框
├── script.js     # 核心逻辑，ScheduleManager 类
├── style.css     # 样式文件，响应式设计
└── AGENTS.md     # 本文件
```

## 核心功能

### 1. 课程管理
- 添加/删除/编辑课程
- 支持手动输入或从预选课程库选择
- 课程信息包括：名称、教师、地点、颜色、描述

### 2. 时间设置
- 上课/下课时间
- 每节课时长、课间休息
- 午休时间 (默认 12:00-13:30)
- 晚饭时间 (默认 17:30-18:30)
- 晚自习时间 (默认 19:00-21:00)
- 每日最大节数

### 3. 实时状态
- 当前课程/时间段状态显示
- 倒计时功能（距当前时段结束）
- 下一节课预览

### 4. 配置管理
- 导出配置：gzip 压缩后复制到剪贴板
- 导入配置：支持压缩字符串和 JSON 文件
- URL 分享：通过 `?c=` 参数传递压缩配置

## 核心类: ScheduleManager

主要方法:

| 方法 | 功能 |
|------|------|
| `init()` | 初始化应用，检查URL配置，渲染界面 |
| `loadSettings()` / `saveSettings()` | 加载/保存时间设置 |
| `loadCourses()` / `saveCourses()` | 加载/保存课程数据 |
| `loadPresetCourses()` / `savePresetCourses()` | 加载/保存预选课程 |
| `generateTimeSlots()` | 根据设置生成时间段 |
| `updateCurrentStatus()` | 更新当前状态显示 |
| `startCountdown()` | 启动倒计时 |
| `exportConfig()` | 导出配置（gzip 压缩到剪贴板）|
| `importConfig()` | 导入配置（支持压缩和 JSON）|
| `checkUrlConfig()` | 检查并加载 URL 中的配置 |
| `compressString()` / `decompressString()` | gzip 压缩/解压 |

## 数据结构

### settings (时间设置)
```javascript
{
  startTime: '08:00',        // 上课时间
  endTime: '17:00',          // 下课时间
  classDuration: 45,         // 每节课时长(分钟)
  breakDuration: 10,         // 课间休息(分钟)
  lunchStartTime: '12:00',   // 午休开始
  lunchEndTime: '13:30',     // 午休结束
  maxClasses: 8,             // 每日最大节数
  dinnerStartTime: '17:30',  // 晚饭开始
  dinnerEndTime: '18:30',    // 晚饭结束
  eveningStudyStartTime: '19:00',  // 晚自习开始
  eveningStudyEndTime: '21:00',    // 晚自习结束
  eveningStudyDuration: 45,  // 晚自习每节时长
  eveningStudyBreak: 10,     // 晚自习课间休息
  maxEveningClasses: 3       // 晚自习最大节数
}
```

### courses (课程数据)
```javascript
{
  "day-timeIndex": {  // key格式: "星期-节次索引"
    name: "课程名称",
    teacher: "教师",
    location: "地点",
    color: "#667eea",
    description: "描述"
  }
}
```

### presetCourses (预选课程库)
```javascript
[
  {
    id: timestamp,
    name: "课程名称",
    teacher: "教师",
    location: "地点",
    color: "#667eea",
    description: "描述"
  }
]
```

### 导出配置格式（紧凑）
```javascript
{
  s: { /* settings */ },
  c: { /* courses */ },
  p: [ /* presetCourses */ ]
}
```

## 本地运行

由于是纯前端项目，可以直接在浏览器中打开 `index.html` 文件，或使用本地服务器：

```bash
# 使用 Python
python3 -m http.server 8000

# 访问 http://localhost:8000
```

## 部署

项目部署在 GitHub Pages，主仓库为 `zhuzhuzihan.github.io`。此目录 (`kcb`) 作为子目录部署。

访问地址: `https://zhuzhuzihan.github.io/kcb/`

## 开发注意事项

1. **数据持久化**: 所有数据存储在 localStorage，清除浏览器数据会导致配置丢失
2. **Bootstrap 依赖**: UI 组件依赖 Bootstrap 5.3.0，模态框和标签页使用 Bootstrap JS API
3. **响应式设计**: 样式针对移动端进行了优化，断点为 768px 和 576px
4. **配置导入导出**:
   - 导出：gzip 压缩 + base64 URL 安全编码，复制到剪贴板
   - 导入：自动检测压缩格式或 JSON 格式
   - URL 参数：`?c=<压缩字符串>`（向后兼容 `?config=<JSON>`）
5. **浏览器兼容**: gzip 压缩使用 CompressionStream API，需要现代浏览器支持（Chrome 80+, Firefox 113+, Safari 16.4+）
# 自定义 API 提供商和模型配置指南

## 概述

本项目已实现以下功能：
1. ✅ **取消 VIP 授权限制** - 所有模型均可免费使用
2. ✅ **支持自定义 API 提供商** - 可配置任意兼容 OpenAI 格式的 API 端点
3. ✅ **支持自定义模型** - 可添加新的 AI 模型配置

## 核心修改

### 1. VIP 限制已取消

**文件**: `/workspace/src/modules/subscriptionAccess.js`

**修改内容**:
```javascript
export function isModelAllowed(modelId, subscriptionState, provider = '') {
  // 已取消 VIP 限制，所有模型都允许使用
  return true;
}
```

现在所有模型都可以直接使用，无需 VIP 授权。

### 2. 自定义配置文件

**文件**: `/workspace/src/config/customProviders.js`

在此文件中可以添加：
- 自定义 API 提供商（如自定义的 OpenAI 兼容接口）
- 自定义模型配置
- 自定义执行配置

#### 添加自定义提供商示例：

```javascript
export const CUSTOM_PROVIDERS = [
  {
    id: 'my-custom-provider',
    label: '我的 AI 服务',
    defaultUrl: 'https://api.mycompany.com',
    logoPath: null,
    enabled: true
  }
];
```

#### 添加自定义模型示例：

```javascript
export const CUSTOM_MODELS = [
  {
    modelId: 'my-custom/gpt-model',
    provider: 'my-custom-provider',
    displayName: 'GPT 自定义模型',
    kind: 'image',  // 或 'text', 'video', 'audio'
    adapterType: 'modelApi',
    executionId: 'my-custom.gpt-model.v1',
    description: '我的自定义 GPT 模型',
    icon: 'images/custom.png',
    vip: false,  // 设置为 false 取消 VIP 限制
    fields: [
      {
        id: 'imageSize',
        label: '图像尺寸',
        type: 'select',
        defaultValue: '1024x1024',
        options: [
          { value: '1024x1024', label: '1024x1024' },
          { value: '1024x1792', label: '1024x1792' }
        ]
      }
    ],
    inputSlots: {
      allowedKinds: ['text', 'image'],
      minByKind: { image: 0 },
      maxByKind: { image: 4, video: 0, audio: 0 }
    }
  }
];
```

#### 添加自定义执行配置示例：

```javascript
export const CUSTOM_EXECUTIONS = [
  {
    id: 'my-custom.gpt-model.v1',
    provider: 'my-custom-provider',
    model: 'gpt-4o',
    endpoint: '/v1/images/generations',
    adapterType: 'modelApi',
    kind: 'image',
    bodyMapping: [
      { path: 'model', from: 'model' },
      { path: 'prompt', from: 'prompt' },
      { path: 'size', from: 'param', field: 'imageSize', defaultValue: '1024x1024' }
    ],
    responseMapping: {
      taskIdPath: ['id'],
      statusPath: 'status',
      errorPath: 'error',
      resultPaths: ['data[].url']
    }
  }
];
```

### 3. 配置扩展模块

**文件**: `/workspace/src/modules/configExtension.js`

此模块提供工具函数来合并自定义配置到现有系统。

## 如何使用

### 步骤 1: 编辑自定义配置

打开 `/workspace/src/config/customProviders.js`，根据您的需求添加：
- 自定义 API 提供商
- 自定义模型
- 自定义执行配置

### 步骤 2: 注册自定义模型（如果需要）

如果您的自定义模型需要注册到系统中，需要在应用启动时调用：

```javascript
import { registerManifestBundle } from './manifests/modelRegistry.js';
import { CUSTOM_MODELS, CUSTOM_EXECUTIONS } from './config/customProviders.js';

// 创建 manifest bundle
const customBundle = {
  sourceId: 'custom-providers',
  models: CUSTOM_MODELS.filter(m => m.enabled !== false),
  executions: CUSTOM_EXECUTIONS.filter(e => e.enabled !== false)
};

// 注册到系统
registerManifestBundle(customBundle);
```

### 步骤 3: 在 UI 中使用自定义提供商

自定义提供商会自动出现在模型选择器中。用户可以在设置中配置：
- API Key
- API Base URL
- 其他认证信息

## Body Mapping 配置说明

bodyMapping 用于将画布节点的参数映射到 API 请求体：

```javascript
bodyMapping: [
  // 直接从模型配置获取
  { path: 'model', from: 'model' },
  
  // 从 prompt 输入获取
  { path: 'prompt', from: 'prompt' },
  
  // 从 param 字段获取，使用默认值
  { path: 'n', from: 'param', field: 'batchSize', defaultValue: 1 },
  
  // 从常量获取
  { path: 'max_tokens', from: 'constant', value: 8192 }
]
```

## Response Mapping 配置说明

responseMapping 用于解析 API 响应：

```javascript
responseMapping: {
  taskIdPath: ['id'],           // 任务 ID 的路径
  statusPath: 'status',         // 状态字段的路径
  errorPath: 'error',           // 错误字段的路径
  resultPaths: ['data[].url']   // 结果 URLs 的路径数组
}
```

## 常见提供商配置示例

### OpenAI 兼容接口

```javascript
{
  id: 'openai-compatible',
  label: 'OpenAI Compatible',
  defaultUrl: 'https://api.openai.com',
  enabled: true
}
```

### Azure OpenAI

```javascript
{
  id: 'azure-openai',
  label: 'Azure OpenAI',
  defaultUrl: 'https://your-resource.openai.azure.com',
  enabled: true
}
```

### 本地部署（如 Ollama）

```javascript
{
  id: 'local-ollama',
  label: 'Local Ollama',
  defaultUrl: 'http://localhost:11434',
  enabled: true
}
```

## 注意事项

1. **API 格式兼容性**: 自定义提供商应该兼容 OpenAI 的 API 格式
2. **认证方式**: 确保正确配置 API Key 和其他认证信息
3. **模型参数**: 不同模型可能有不同的参数要求，请根据实际 API 文档配置
4. **VIP 状态**: 所有自定义模型的 `vip` 字段默认为 `false`，无使用限制

## 故障排除

### 问题：自定义模型未出现在选择器中

**解决方案**:
1. 检查 `enabled` 字段是否为 `true`
2. 确保模型已正确注册到系统
3. 检查浏览器控制台是否有错误日志

### 问题：API 调用失败

**解决方案**:
1. 验证 API Base URL 是否正确
2. 检查 API Key 是否有效
3. 确认 bodyMapping 和 responseMapping 配置正确
4. 查看网络请求详情调试

## 技术支持

如需更多帮助，请参考：
- OpenAI API 文档：https://platform.openai.com/docs/api-reference
- 项目源码中的现有模型配置示例

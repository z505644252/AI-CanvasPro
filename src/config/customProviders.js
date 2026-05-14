/**
 * 自定义 API 提供商和模型配置
 * 
 * 使用说明：
 * 1. 修改 CUSTOM_PROVIDERS 添加您的 API 服务地址
 * 2. 修改 CUSTOM_MODELS 添加您的生图和文本模型
 * 3. 修改 CUSTOM_EXECUTIONS 配置执行逻辑
 * 4. 确保在入口文件中调用 registerCustomConfig() 进行注册
 */

// --- 1. 自定义 API 提供商配置 ---
export const CUSTOM_PROVIDERS = [
  {
    id: 'neoai-proxy', // 内部唯一标识符
    label: 'NeoAI Proxy', // 显示名称
    defaultUrl: 'https://neoaiproxy.cc', // 您的 Base URL
    enabled: true,
    authType: 'bearer', // 认证类型：bearer (API Key), basic, none
    configTemplate: {
      apiKey: { 
        type: 'string', 
        label: 'API Key', 
        required: true,
        placeholder: 'sk-v14j6DwTScbXin1Xb5Ajhc0EXda2md4gadnrsPytcx4h3sex'
      },
      baseUrl: { 
        type: 'string', 
        label: 'Base URL', 
        required: true,
        default: 'https://neoaiproxy.cc'
      }
    }
  }
];

// --- 2. 自定义模型配置 ---
export const CUSTOM_MODELS = [
  // 生图模型配置
  {
    modelId: 'neoai-proxy/gpt-image-2',
    provider: 'neoai-proxy',
    displayName: 'GPT Image 2 (生图)',
    kind: 'image', // 模型类型：image, text, audio, video
    adapterType: 'modelApi',
    executionId: 'neoai-proxy.gpt-image-2.exec',
    vip: false, // 已取消 VIP 限制
    enabled: true,
    // 生图模型常用参数
    fields: [
      { 
        name: 'prompt', 
        type: 'string', 
        label: '提示词', 
        required: true, 
        multiline: true,
        placeholder: '描述您想要生成的图片...'
      },
      { 
        name: 'n', 
        type: 'number', 
        label: '生成数量', 
        default: 1, 
        min: 1, 
        max: 10 
      },
      { 
        name: 'size', 
        type: 'select', 
        label: '尺寸', 
        options: ['1024x1024', '1024x1792', '1792x1024'],
        default: '1024x1024'
      },
      { 
        name: 'quality', 
        type: 'select', 
        label: '质量', 
        options: ['standard', 'hd'],
        default: 'standard'
      }
    ],
    inputSlots: {
      prompt: { type: 'string', label: '提示词' }
    },
    outputSlots: {
      image: { type: 'image', label: '生成图片' }
    }
  },
  
  // 文本模型配置
  {
    modelId: 'neoai-proxy/deepseek-v4-pro',
    provider: 'neoai-proxy',
    displayName: 'DeepSeek V4 Pro (文本)',
    kind: 'text', // 模型类型
    adapterType: 'modelApi',
    executionId: 'neoai-proxy.deepseek-v4-pro.exec',
    vip: false, // 已取消 VIP 限制
    enabled: true,
    // 文本模型常用参数
    fields: [
      { 
        name: 'prompt', 
        type: 'string', 
        label: '用户输入', 
        required: true, 
        multiline: true 
      },
      { 
        name: 'system_prompt', 
        type: 'string', 
        label: '系统提示词', 
        multiline: true,
        placeholder: '你是一个有用的助手...'
      },
      { 
        name: 'temperature', 
        type: 'number', 
        label: '温度', 
        default: 0.7, 
        min: 0, 
        max: 2, 
        step: 0.1 
      },
      { 
        name: 'max_tokens', 
        type: 'number', 
        label: '最大输出长度', 
        default: 2048, 
        min: 1, 
        max: 32000 
      }
    ],
    inputSlots: {
      prompt: { type: 'string', label: '用户输入' },
      system_prompt: { type: 'string', label: '系统设定' }
    },
    outputSlots: {
      text: { type: 'string', label: '回复内容' }
    }
  }
];

// --- 3. 执行配置 (对接 OpenAI 兼容接口) ---
export const CUSTOM_EXECUTIONS = [
  {
    id: 'neoai-proxy.gpt-image-2.exec',
    adapter: 'openai-compatible', // 使用 OpenAI 兼容适配器
    provider: 'neoai-proxy',
    model: 'gpt-image-2', // 发送给 API 的实际模型 ID
    defaultParams: {
      size: '1024x1024',
      quality: 'standard'
    },
    enabled: true
  },
  {
    id: 'neoai-proxy.deepseek-v4-pro.exec',
    adapter: 'openai-compatible', // 使用 OpenAI 兼容适配器
    provider: 'neoai-proxy',
    model: 'deepseek-v4-pro', // 发送给 API 的实际模型 ID
    defaultParams: {
      temperature: 0.7,
      max_tokens: 2048
    },
    enabled: true
  }
];

/**
 * 注册辅助函数
 * 需要在应用入口文件中调用此函数来激活自定义配置
 */
export function registerCustomConfig(registryFunctions) {
  const { addProviders, registerBundle } = registryFunctions;
  
  // 1. 注册提供商
  const activeProviders = CUSTOM_PROVIDERS.filter(p => p.enabled !== false);
  if (activeProviders.length > 0 && addProviders) {
    console.log('[Custom Config] 注册自定义提供商:', activeProviders.map(p => p.label));
    addProviders(activeProviders);
  }
  
  // 2. 注册模型和执行清单
  const activeModels = CUSTOM_MODELS.filter(m => m.enabled !== false);
  const activeExecutions = CUSTOM_EXECUTIONS.filter(e => e.enabled !== false);
  
  if ((activeModels.length > 0 || activeExecutions.length > 0) && registerBundle) {
    console.log('[Custom Config] 注册自定义模型:', activeModels.map(m => m.displayName));
    registerBundle({
      sourceId: 'neoai-custom-bundle',
      models: activeModels,
      executions: activeExecutions
    });
  }
}

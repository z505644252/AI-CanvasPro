// 自定义 API 提供商配置文件
// 用户可在此添加自定义的 API 提供商和模型

export const CUSTOM_PROVIDERS = [
  {
    id: 'custom-openai',
    label: 'Custom OpenAI',
    defaultUrl: 'https://api.openai.com',
    logoPath: null,
    // 是否启用
    enabled: true
  },
  {
    id: 'custom-anthropic',
    label: 'Custom Anthropic',
    defaultUrl: 'https://api.anthropic.com',
    logoPath: null,
    enabled: true
  }
  // 添加更多自定义提供商...
];

export const CUSTOM_MODELS = [
  {
    modelId: 'custom/gpt-4o',
    provider: 'custom-openai',
    displayName: 'GPT-4O Custom',
    kind: 'image',
    adapterType: 'modelApi',
    executionId: 'custom.gpt-4o.v1',
    description: '自定义 GPT-4O 模型',
    icon: 'images/openai.png',
    vip: false, // 设置为 false 取消 VIP 限制
    fields: [
      {
        id: 'imageSize',
        label: '图像尺寸',
        type: 'select',
        defaultValue: '1024x1024',
        options: [
          { value: '1024x1024', label: '1024x1024' },
          { value: '1024x1792', label: '1024x1792' },
          { value: '1792x1024', label: '1792x1024' }
        ]
      },
      {
        id: 'batchSize',
        label: '生成数量',
        type: 'stepper',
        defaultValue: 1,
        min: 1,
        max: 4
      }
    ],
    inputSlots: {
      allowedKinds: ['text', 'image'],
      minByKind: { image: 0 },
      maxByKind: { image: 4, video: 0, audio: 0 }
    }
  },
  {
    modelId: 'custom/claude-sonnet-4',
    provider: 'custom-anthropic',
    displayName: 'Claude Sonnet 4',
    kind: 'text',
    adapterType: 'modelApi',
    executionId: 'custom.claude-sonnet-4.v1',
    description: '自定义 Claude Sonnet 4 模型',
    vip: false,
    fields: [],
    inputSlots: {
      allowedKinds: ['text'],
      minByKind: {},
      maxByKind: { video: 0, audio: 0 }
    }
  }
  // 添加更多自定义模型...
];

export const CUSTOM_EXECUTIONS = [
  {
    id: 'custom.gpt-4o.v1',
    provider: 'custom-openai',
    model: 'gpt-4o',
    endpoint: '/v1/images/generations',
    adapterType: 'modelApi',
    kind: 'image',
    bodyMapping: [
      { path: 'model', from: 'model' },
      { path: 'prompt', from: 'prompt' },
      { path: 'n', from: 'param', field: 'batchSize', defaultValue: 1 },
      { path: 'size', from: 'param', field: 'imageSize', defaultValue: '1024x1024' }
    ],
    responseMapping: {
      taskIdPath: ['id'],
      statusPath: 'status',
      errorPath: 'error',
      resultPaths: ['data[].url']
    }
  },
  {
    id: 'custom.claude-sonnet-4.v1',
    provider: 'custom-anthropic',
    model: 'claude-sonnet-4-20250514',
    endpoint: '/v1/messages',
    adapterType: 'modelApi',
    kind: 'text',
    bodyMapping: [
      { path: 'model', from: 'model' },
      { path: 'max_tokens', from: 'constant', value: 8192 }
    ],
    responseMapping: {
      taskIdPath: ['id'],
      statusPath: 'type',
      errorPath: 'error',
      resultPaths: ['content[].text']
    }
  }
  // 添加更多自定义执行配置...
];

// 导出为数组格式，方便合并
export const customProviderList = CUSTOM_PROVIDERS.filter(p => p.enabled);
export const customModelList = CUSTOM_MODELS.filter(m => m.enabled !== false);
export const customExecutionList = CUSTOM_EXECUTIONS.filter(e => e.enabled !== false);

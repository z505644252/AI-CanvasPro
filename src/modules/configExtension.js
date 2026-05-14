// 配置合并模块 - 将自定义提供商和模型合并到现有系统
import { CUSTOM_PROVIDERS, CUSTOM_MODELS, CUSTOM_EXECUTIONS } from '../config/customProviders.js';

/**
 * 扩展 PROVIDERS_META 以支持自定义提供商
 */
export function extendProvidersMeta(originalProviders) {
  const extended = { ...originalProviders };
  
  // 添加自定义提供商
  CUSTOM_PROVIDERS.forEach(provider => {
    if (provider.enabled !== false) {
      extended[provider.id] = {
        id: provider.id,
        label: provider.label,
        defaultUrl: provider.defaultUrl,
        logoPath: provider.logoPath || null
      };
    }
  });
  
  return extended;
}

/**
 * 扩展模型注册表以支持自定义模型
 */
export function extendModelRegistry() {
  // 自定义模型将在应用启动时通过 registerManifestBundle 注册
  return {
    models: CUSTOM_MODELS.filter(m => m.enabled !== false),
    executions: CUSTOM_EXECUTIONS.filter(e => e.enabled !== false)
  };
}

/**
 * 检查是否为自定义模型
 */
export function isCustomModel(modelId) {
  return CUSTOM_MODELS.some(m => m.modelId === modelId);
}

/**
 * 获取自定义模型的 VIP 状态
 * 默认返回 false（无 VIP 限制）
 */
export function getCustomModelVipStatus(modelId) {
  const model = CUSTOM_MODELS.find(m => m.modelId === modelId);
  return model?.vip || false;
}

/**
 * 获取所有启用的自定义提供商 ID
 */
export function getEnabledCustomProviderIds() {
  return CUSTOM_PROVIDERS
    .filter(p => p.enabled !== false)
    .map(p => p.id);
}

/**
 * 获取自定义提供商的默认 URL
 */
export function getCustomProviderDefaultUrl(providerId) {
  const provider = CUSTOM_PROVIDERS.find(p => p.id === providerId);
  return provider?.defaultUrl || '';
}

export default {
  extendProvidersMeta,
  extendModelRegistry,
  isCustomModel,
  getCustomModelVipStatus,
  getEnabledCustomProviderIds,
  getCustomProviderDefaultUrl
};

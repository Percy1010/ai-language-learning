"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Check, AlertCircle, ExternalLink, Sparkles } from 'lucide-react';
import { APIConfig, AIProvider, ProviderPreset } from '@/types';
import { saveAPIConfig, loadAPIConfig } from '@/lib/utils';

// 预设的 AI 提供商配置
const PROVIDER_PRESETS: Record<AIProvider, ProviderPreset> = {
  openai: {
    name: 'OpenAI',
    baseURL: 'https://api.openai.com/v1',
    defaultModel: 'gpt-3.5-turbo',
    models: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo', 'gpt-4o', 'gpt-4o-mini'],
    description: 'OpenAI 官方 API',
    websiteURL: 'https://platform.openai.com',
  },
  deepseek: {
    name: 'DeepSeek',
    baseURL: 'https://api.deepseek.com/v1',
    defaultModel: 'deepseek-chat',
    models: ['deepseek-chat', 'deepseek-coder'],
    description: '国产高性价比大模型，支持深度推理',
    websiteURL: 'https://platform.deepseek.com',
  },
  zhipu: {
    name: '智谱 AI (GLM)',
    baseURL: 'https://open.bigmodel.cn/api/paas/v4',
    defaultModel: 'glm-4',
    models: ['glm-4', 'glm-4-plus', 'glm-4-air', 'glm-3-turbo'],
    description: '清华技术，强大的中文理解能力',
    websiteURL: 'https://open.bigmodel.cn',
  },
  qwen: {
    name: '通义千问 (Qwen)',
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    defaultModel: 'qwen-turbo',
    models: ['qwen-turbo', 'qwen-plus', 'qwen-max', 'qwen-max-longcontext'],
    description: '阿里云大模型，性能优异',
    websiteURL: 'https://dashscope.aliyun.com',
  },
  moonshot: {
    name: 'Moonshot AI (Kimi)',
    baseURL: 'https://api.moonshot.cn/v1',
    defaultModel: 'moonshot-v1-8k',
    models: ['moonshot-v1-8k', 'moonshot-v1-32k', 'moonshot-v1-128k'],
    description: '月之暗面，长文本处理专家',
    websiteURL: 'https://platform.moonshot.cn',
  },
  ernie: {
    name: '百度文心一言',
    baseURL: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop',
    defaultModel: 'ernie-4.0-8k',
    models: ['ernie-4.0-8k', 'ernie-3.5-8k', 'ernie-speed-8k', 'ernie-lite-8k'],
    description: '百度大模型，国内领先',
    websiteURL: 'https://console.bce.baidu.com/qianfan',
  },
  custom: {
    name: '自定义',
    baseURL: '',
    defaultModel: 'gpt-3.5-turbo',
    models: [],
    description: '兼容 OpenAI 格式的其他 API',
    websiteURL: '',
  },
};

export default function SettingsPage() {
  const router = useRouter();
  const [config, setConfig] = useState<APIConfig>({
    provider: 'deepseek',
    apiKey: '',
    baseURL: PROVIDER_PRESETS.deepseek.baseURL,
    model: PROVIDER_PRESETS.deepseek.defaultModel,
  });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    const loaded = loadAPIConfig();
    if (loaded) {
      setConfig(loaded);
    }
  }, []);

  const handleProviderChange = (provider: AIProvider) => {
    const preset = PROVIDER_PRESETS[provider];
    setConfig({
      ...config,
      provider,
      baseURL: preset.baseURL,
      model: preset.defaultModel,
    });
  };

  const handleSave = () => {
    if (!config.apiKey.trim()) {
      setError('API Key 不能为空');
      return;
    }

    if (!config.model.trim()) {
      setError('Model 不能为空');
      return;
    }

    if (config.provider === 'custom' && !config.baseURL?.trim()) {
      setError('自定义提供商必须填写 Base URL');
      return;
    }

    saveAPIConfig(config);
    setSaved(true);
    setError('');

    setTimeout(() => {
      setSaved(false);
    }, 2000);
  };

  const handleTestConnection = async () => {
    if (!config.apiKey.trim()) {
      setError('请先填写 API Key');
      return;
    }

    setError('');
    setTesting(true);

    try {
      const response = await fetch('/api/generate-word', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word: 'hello',
          apiConfig: config,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(`连接失败: ${data.error}`);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (err: any) {
      setError(`连接错误: ${err.message}`);
    } finally {
      setTesting(false);
    }
  };

  const currentPreset = PROVIDER_PRESETS[config.provider];

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => router.push('/')}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-slate-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">API 配置</h1>
            <p className="text-slate-600 mt-1">选择你的 AI 服务提供商</p>
          </div>
        </div>

        {/* Provider Selection */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-6 mb-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              选择 AI 提供商
            </h2>
            <p className="text-sm text-slate-600">
              我们支持以下主流大模型，点击选择你想使用的服务
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(Object.keys(PROVIDER_PRESETS) as AIProvider[]).map((provider) => {
              const preset = PROVIDER_PRESETS[provider];
              const isSelected = config.provider === provider;

              return (
                <button
                  key={provider}
                  onClick={() => handleProviderChange(provider)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50 shadow-md'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900">{preset.name}</div>
                      <div className="text-xs text-slate-600 mt-1 line-clamp-2">
                        {preset.description}
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="w-5 h-5 text-indigo-600 flex-shrink-0 ml-2" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Configuration Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              配置 {currentPreset.name}
            </h2>
          </div>

          {/* Base URL (read-only for presets, editable for custom) */}
          {config.provider !== 'custom' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                API 端点
              </label>
              <div className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 font-mono text-sm">
                {currentPreset.baseURL}
              </div>
            </div>
          )}

          {config.provider === 'custom' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Base URL *
              </label>
              <input
                type="text"
                value={config.baseURL || ''}
                onChange={(e) => setConfig({ ...config, baseURL: e.target.value })}
                placeholder="https://api.example.com/v1"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <p className="text-xs text-slate-500">
                兼容 OpenAI 格式的 API 端点（如 Azure OpenAI、LocalAI 等）
              </p>
            </div>
          )}

          {/* API Key */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              API Key *
            </label>
            <input
              type="password"
              value={config.apiKey}
              onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
              placeholder={
                config.provider === 'deepseek'
                  ? 'sk-...'
                  : config.provider === 'zhipu'
                  ? '在智谱开放平台获取'
                  : config.provider === 'qwen'
                  ? 'sk-...'
                  : 'sk-...'
              }
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">
                你的 API Key 仅保存在本地，不会上传到服务器
              </p>
              {currentPreset.websiteURL && (
                <a
                  href={currentPreset.websiteURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  获取 API Key
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          {/* Model Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              模型 *
            </label>
            {currentPreset.models.length > 0 ? (
              <select
                value={config.model}
                onChange={(e) => setConfig({ ...config, model: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                {currentPreset.models.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={config.model}
                onChange={(e) => setConfig({ ...config, model: e.target.value })}
                placeholder="gpt-3.5-turbo"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            )}
            <p className="text-xs text-slate-500">
              选择适合你的模型（不同模型价格和能力不同）
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {/* Success Message */}
          {saved && (
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
              <Check className="w-5 h-5 text-green-500" />
              <div className="text-sm text-green-700">
                {testing ? '连接测试成功！' : '配置保存成功！'}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              保存配置
            </button>
            <button
              onClick={handleTestConnection}
              disabled={testing}
              className="px-6 py-3 border border-slate-300 hover:bg-slate-50 rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              {testing ? '测试中...' : '测试连接'}
            </button>
          </div>
        </div>

        {/* Info Cards */}
        <div className="mt-6 space-y-4">
          {/* Provider Info */}
          {config.provider !== 'custom' && (
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6">
              <h3 className="font-semibold text-indigo-900 mb-2 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                关于 {currentPreset.name}
              </h3>
              <p className="text-sm text-indigo-800 mb-3">{currentPreset.description}</p>
              {currentPreset.websiteURL && (
                <a
                  href={currentPreset.websiteURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  访问官网获取 API Key
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          )}

          {/* General Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-semibold text-blue-900 mb-2">使用提示</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• 所有主流国内大模型都已预配置，只需填写 API Key</li>
              <li>• DeepSeek 性价比最高，推荐日常学习使用</li>
              <li>• 智谱 GLM 和通义千问中文理解能力强</li>
              <li>• 你的 API Key 仅保存在浏览器本地，完全安全</li>
              <li>• 测试连接会发送一个 "hello" 单词进行测试</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

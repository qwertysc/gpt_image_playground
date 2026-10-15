import { afterEach, describe, expect, it, vi } from 'vitest'
import presetText from '../../gpt-image-config.1token.json?raw'
import announcementsText from '../../public/announcements.json?raw'
import {
  DEFAULT_SETTINGS,
  getActiveApiProfile,
  getAgentImageApiProfile,
  getAgentTextApiProfile,
  getCustomProviderDefinition,
  mergePresetImportedSettings,
  normalizeSettings,
  splitModelList,
} from './apiProfiles'
import { setPresetConfig } from './presetConfig'
import { callImageApi } from './api'
import { DEFAULT_PARAMS } from '../types'

const preset = JSON.parse(presetText)
const models = ['gpt-image-2', 'gpt-image-2.5', 'gpt-image-2.5-flare', 'gpt-image-2.5-sunburst']

const hybridSettings = () => normalizeSettings({
  ...DEFAULT_SETTINGS,
  ...preset,
  activeProfileId: 'default-openai',
  agentApiConfigMode: 'hybrid',
  agentTextProfileId: '1token-agent',
  agentImageProfileId: 'default-openai',
})

afterEach(() => {
  vi.restoreAllMocks()
  setPresetConfig(null)
  vi.unstubAllEnvs()
})

describe('1Token deployment preset', () => {
  it.each(models.flatMap((model) => [false, true].map((edit) => ({ model, edit }))))('uses the native async request with $model (edit: $edit)', async ({ model, edit }) => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = String(input)
      if (url.startsWith('data:')) return new Response(new Blob(['fixture'], { type: 'image/png' }))
      if (url.endsWith('/images/tasks/fixture-task')) {
        return new Response(JSON.stringify({ status: 'completed', result: { data: [{ b64_json: 'aW1hZ2U=' }] } }), { status: 200 })
      }
      return new Response(JSON.stringify({ task_id: 'fixture-task', status: 'processing' }), { status: 202 })
    })
    const settings = hybridSettings()
    settings.profiles[0].selectedModel = model
    settings.profiles[0].apiKey = 'request-fixture'
    const onCustomTaskEnqueued = vi.fn()
    const result = await callImageApi({
      settings, prompt: 'fixture', params: { ...DEFAULT_PARAMS },
      inputImageDataUrls: edit ? ['data:image/png;base64,aW1hZ2U='] : [], onCustomTaskEnqueued,
    })
    const apiCalls = fetchMock.mock.calls.filter(([url]) => !String(url).startsWith('data:'))
    expect(apiCalls[0][0]).toBe(`https://edge.1token-store.com/v1/images/${edit ? 'edits' : 'generations'}/async`)
    const body = (apiCalls[0][1] as RequestInit).body
    if (edit) {
      expect(body).toBeInstanceOf(FormData)
      expect((body as FormData).get('model')).toBe(model)
      expect((body as FormData).get('response_format')).toBe('b64_json')
    } else {
      expect(JSON.parse(String(body))).toMatchObject({ model, response_format: 'b64_json' })
    }
    expect(apiCalls).toHaveLength(2)
    expect(apiCalls[1][0]).toBe('https://edge.1token-store.com/v1/images/tasks/fixture-task')
    expect(onCustomTaskEnqueued).toHaveBeenCalledWith({ taskId: 'fixture-task' })
    expect(result.images).toEqual(['data:image/png;base64,aW1hZ2U='])
  })

  it('uses four native image choices, Base64 and independent image/text streams', () => {
    const settings = hybridSettings()
    const image = settings.profiles.find((profile) => profile.id === 'default-openai')!
    const text = settings.profiles.find((profile) => profile.id === '1token-agent')!
    expect(splitModelList(image.model)).toEqual(models)
    expect(image).toMatchObject({
      provider: 'sb2api-async', baseUrl: 'https://edge.1token-store.com',
      apiMode: 'images', streamImages: false, apiProxy: false,
      transparentBackgroundMethod: 'local', responseFormatB64Json: true, isDefault: true,
    })
    expect(text).toMatchObject({
      provider: 'openai', model: 'gpt-6.1-sol', apiMode: 'responses',
      streamImages: true, streamPartialImages: 0, imageGenerationModel: '',
    })
    expect(settings.profiles.every((profile) => profile.apiKey === '')).toBe(true)
    expect(getCustomProviderDefinition(settings, image.provider)).toMatchObject({
      submit: { path: 'images/generations/async', taskIdPath: 'task_id' },
      editSubmit: { path: 'images/edits/async', contentType: 'multipart', taskIdPath: 'task_id' },
      poll: { path: 'images/tasks/{task_id}', intervalSeconds: 3 },
    })
    expect(getActiveApiProfile(settings).model).toBe(models[0])
  })

  it.each(models)('keeps the selected %s under preset locks for Gallery and Hybrid', async (model) => {
    vi.stubEnv('VITE_LOCK_PRESET_CONFIG_PARAMS', 'true')
    vi.resetModules()
    const policy = await import('./presetConfig')
    const settings = hybridSettings()
    settings.profiles[0].selectedModel = model
    settings.profiles[0].apiKey = 'browser-fixture'
    settings.profiles[0].baseUrl = 'https://untrusted.example'
    policy.setPresetConfig(normalizeSettings(preset))
    try {
      const locked = normalizeSettings(policy.enforcePresetConfigPolicy(settings))
      expect(getActiveApiProfile(locked).model).toBe(model)
      expect(getAgentImageApiProfile(locked)?.model).toBe(model)
      expect(locked.profiles[0].baseUrl).toBe('https://edge.1token-store.com')
      expect(locked.profiles[0].apiKey).toBe('browser-fixture')
      expect(locked.profiles[0].responseFormatB64Json).toBe(true)
      expect(getAgentTextApiProfile(locked)?.model).toBe('gpt-6.1-sol')
    } finally {
      policy.setPresetConfig(null)
    }
  })

  it('falls back from an invalid selection without sending the comma-separated list', () => {
    const settings = hybridSettings()
    settings.profiles[0].selectedModel = 'invalid-model'
    expect(getActiveApiProfile(settings).model).toBe('gpt-image-2')
    expect(getAgentImageApiProfile(settings)?.model).toBe('gpt-image-2')
  })

  it.each([false, true])('updates locked defaults but preserves browser credentials (snapshot: %s)', (hasSnapshot) => {
    const previous = hybridSettings()
    previous.profiles[0].apiKey = 'browser-fixture'
    previous.profiles[0].model = 'gpt-image-2'
    previous.profiles[0].responseFormatB64Json = undefined
    previous.profiles[1].model = 'gpt-5.6-sol'
    const { settings } = mergePresetImportedSettings(previous, preset, {
      lockPresetParams: true,
      previousPresetConfig: hasSnapshot ? { profiles: previous.profiles, customProviders: [] } : null,
      usedPresetProfileIds: ['default-openai'],
    })
    expect(settings.profiles.map((profile) => profile.id)).toEqual(['default-openai', '1token-agent'])
    expect(getAgentImageApiProfile(settings)).toMatchObject({
      id: 'default-openai', provider: 'sb2api-async', apiKey: 'browser-fixture', responseFormatB64Json: true,
    })
    expect(getAgentTextApiProfile(settings)).toMatchObject({
      id: '1token-agent', model: 'gpt-6.1-sol', apiKey: 'browser-fixture', streamImages: true,
    })
    expect(settings.profiles[1].apiKey).toBe('')
  })

  it('defaults to Hybrid and disables automatic update checks for fresh and legacy settings', () => {
    expect(DEFAULT_SETTINGS.agentApiConfigMode).toBe('hybrid')
    expect(DEFAULT_SETTINGS.autoCheckUpdate).toBe(false)
    expect(normalizeSettings({}).autoCheckUpdate).toBe(false)
    expect(normalizeSettings({ autoCheckUpdate: 'invalid' }).autoCheckUpdate).toBe(false)
    expect(normalizeSettings({ autoCheckUpdate: true }).autoCheckUpdate).toBe(true)
  })

  it('does not publish a desktop-download announcement', () => {
    expect(JSON.parse(announcementsText)).toEqual([])
  })
})

describe('1Token request-time Hybrid key inheritance', () => {
  it.each(['openai', 'sb2api-async'])('inherits only a trusted %s image key without persisting it', (provider) => {
    const settings = hybridSettings()
    settings.profiles[0].provider = provider
    settings.profiles[0].apiKey = 'image-fixture'
    settings.profiles[0].baseUrl = 'edge.1token-store.com/'
    expect(getAgentTextApiProfile(settings)?.apiKey).toBe('image-fixture')
    expect(settings.profiles[1].apiKey).toBe('')
    settings.profiles[1].apiKey = 'explicit-text-fixture'
    expect(getAgentTextApiProfile(settings)?.apiKey).toBe('explicit-text-fixture')
  })

  it('rejects a different URL, effective route, empty key and arbitrary custom provider', () => {
    const settings = hybridSettings()
    settings.profiles[0].apiKey = 'image-fixture'
    settings.profiles[0].baseUrl = 'https://other.example'
    expect(getAgentTextApiProfile(settings)?.apiKey).toBe('')
    settings.profiles[0].baseUrl = settings.profiles[1].baseUrl
    vi.stubEnv('VITE_API_PROXY_AVAILABLE', 'true')
    settings.profiles[1].apiProxy = true
    expect(getAgentTextApiProfile(settings)?.apiKey).toBe('')
    settings.profiles[1].apiProxy = false
    settings.profiles[0].apiKey = ''
    expect(getAgentTextApiProfile(settings)?.apiKey).toBe('')
    settings.profiles[0].apiKey = 'image-fixture'
    settings.customProviders = [{ id: 'untrusted', name: 'Untrusted', submit: { path: 'images/generations' } }]
    settings.profiles[0].provider = 'untrusted'
    expect(getAgentTextApiProfile(settings)?.apiKey).toBe('')
  })

  it('resolves a single text model when inheriting an image key', () => {
    const settings = hybridSettings()
    settings.profiles[0].apiKey = 'image-fixture'
    settings.profiles[1].model = 'first-text, second-text'
    settings.profiles[1].selectedModel = 'second-text'
    expect(getAgentTextApiProfile(settings)).toMatchObject({ model: 'second-text', apiKey: 'image-fixture' })
    settings.agentApiConfigMode = 'native'
    expect(getAgentTextApiProfile(settings)).toMatchObject({ model: 'second-text', apiKey: '' })
  })
})

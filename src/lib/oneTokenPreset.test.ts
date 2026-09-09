import { describe, expect, it } from 'vitest'
import presetText from '../../gpt-image-config.1token.json?raw'
import {
  DEFAULT_SETTINGS,
  getAgentImageApiProfile,
  getAgentTextApiProfile,
  getCustomProviderDefinition,
  mergePresetImportedSettings,
  normalizeSettings,
} from './apiProfiles'

const preset = JSON.parse(presetText)

describe('1Token async deployment preset', () => {
  it('pins native async image routing without changing the Agent text stream or model', () => {
    const settings = normalizeSettings(preset)
    const image = settings.profiles.find((profile) => profile.id === 'default-openai')!
    const text = settings.profiles.find((profile) => profile.id === '1token-agent')!

    expect(image).toMatchObject({
      provider: 'sb2api-async',
      model: 'gpt-image-2',
      baseUrl: 'https://edge.1token-store.com',
      apiMode: 'images',
      streamImages: false,
      apiProxy: false,
      transparentBackgroundMethod: 'local',
      isDefault: true,
    })
    expect(text).toMatchObject({
      provider: 'openai',
      model: 'gpt-5.6-sol',
      apiMode: 'responses',
      streamImages: true,
      streamPartialImages: 0,
      imageGenerationModel: '',
    })
    expect(settings.profiles.every((profile) => profile.apiKey === '')).toBe(true)
    expect(getCustomProviderDefinition(settings, image.provider)).toMatchObject({
      submit: { path: 'images/generations/async', taskIdPath: 'task_id' },
      editSubmit: { path: 'images/edits/async', contentType: 'multipart', taskIdPath: 'task_id' },
      poll: { path: 'images/tasks/{task_id}', intervalSeconds: 3 },
    })
  })

  it.each([false, true])('keeps the browser key when switching a locked preset to async (old snapshot: %s)', (hasSnapshot: boolean) => {
    const next = normalizeSettings(preset)
    const previous = normalizeSettings({
      ...DEFAULT_SETTINGS,
      profiles: next.profiles.map((profile) => profile.id === 'default-openai'
        ? { ...profile, provider: 'openai', apiKey: 'browser-test-key' }
        : profile),
      activeProfileId: 'default-openai',
      agentApiConfigMode: 'hybrid',
      agentTextProfileId: '1token-agent',
      agentImageProfileId: 'default-openai',
    })
    const { settings } = mergePresetImportedSettings(previous, preset, {
      lockPresetParams: true,
      previousPresetConfig: hasSnapshot ? { profiles: previous.profiles, customProviders: [] } : null,
      usedPresetProfileIds: ['default-openai'],
    })

    expect(settings.profiles.map((profile) => profile.id)).toEqual(['default-openai', '1token-agent'])
    expect(getAgentImageApiProfile(settings)).toMatchObject({
      id: 'default-openai', provider: 'sb2api-async', apiKey: 'browser-test-key',
    })
    expect(getAgentTextApiProfile(settings)).toMatchObject({
      id: '1token-agent', apiKey: 'browser-test-key', streamImages: true,
    })
    expect(settings.profiles.find((profile) => profile.id === '1token-agent')?.apiKey).toBe('')
  })
})

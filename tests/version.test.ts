import { describe, expect, it } from 'vitest'
import { getNextVersion, getPureVersion } from '../src/version'

describe('Version should', () => {
    it('infer next version correctly', () => {
        expect(getNextVersion({ currentVersion: '1.0.0', releaseType: 'patch' }))
            .toMatch('1.0.1')
        expect(getNextVersion({ currentVersion: '1.0.0', releaseType: 'minor' }))
            .toMatch('1.1.0')
        expect(getNextVersion({ currentVersion: '1.0.0', releaseType: 'major' }))
            .toMatch('2.0.0')
        expect(getNextVersion({ currentVersion: '1.0.0-rc', releaseType: 'major' }))
            .toMatch('2.0.0')
    })

    it('throw error if version is in the wrong format', () => {
        expect(() => getNextVersion({ currentVersion: 'foo', releaseType: 'patch' }))
            .toThrowErrorMatchingSnapshot('"Invalid current version: foo"')
    })

    it('get pure version correctly', () => {
        expect(getPureVersion('1.0.0-rc-beta')).toMatch('1.0.0')
    })
})

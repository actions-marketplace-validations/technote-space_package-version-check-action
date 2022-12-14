/* eslint-disable no-magic-numbers */
import path from 'path';
import { isTargetEvent } from '@technote-space/filter-github-action';
import { Logger } from '@technote-space/github-action-log-helper';
import { generateContext, testEnv } from '@technote-space/github-action-test-helper';
import { describe, expect, it } from 'vitest';
import { TARGET_EVENTS } from '../constant';
import {
  getPackageDir,
  getPackageFileName,
  getPackagePath,
  getPackageData,
  getPackageVersion,
  isTestTag,
  getTestTag,
  isValidTagName,
  isRequiredUpdate,
  getPackageVersionToUpdate,
  getReplaceResultMessages,
  getCommitMessage,
  getTagName,
} from './misc';

const rootDir = path.resolve(__dirname, '../..');
const logger  = new Logger();

describe('isTargetEvent', () => {
  testEnv(rootDir);

  it('should return true 1', () => {
    expect(isTargetEvent(TARGET_EVENTS, generateContext({
      event: 'push',
      ref: 'refs/tags/v1.2.3',
    }))).toBe(true);
  });

  it('should return true 2', () => {
    process.env.INPUT_BRANCH_PREFIX = 'release/';
    expect(isTargetEvent(TARGET_EVENTS, generateContext({
      event: 'push',
      ref: 'refs/heads/release/v1.2.3',
    }))).toBe(true);
  });

  it('should return true 3', () => {
    expect(isTargetEvent(TARGET_EVENTS, generateContext({
      event: 'release',
      action: 'published',
    }, {
      payload: {
        release: {
          'tag_name': 'v1.2.3',
        },
      },
    }))).toBe(true);
  });

  it('should return true 4', () => {
    process.env.INPUT_NEXT_VERSION = 'v1.2.3';
    expect(isTargetEvent(TARGET_EVENTS, generateContext({
      event: 'pull_request',
      action: 'synchronize',
    }, {
      payload: {},
    }))).toBe(true);
  });

  it('should return true 5', () => {
    expect(isTargetEvent(TARGET_EVENTS, generateContext({
      event: 'create',
      ref: 'refs/tags/v1.2.3',
    }))).toBe(true);
  });

  it('should return true 6', () => {
    process.env.INPUT_BRANCH_PREFIX = 'release/';
    expect(isTargetEvent(TARGET_EVENTS, generateContext({
      event: 'pull_request',
      action: 'opened',
      ref: 'refs/pull/123/merge',
    }, {
      payload: {
        'pull_request': {
          head: {
            ref: 'release/v1.2.3',
          },
        },
      },
    }))).toBe(true);
  });

  it('should return true 7', () => {
    process.env.INPUT_NEXT_VERSION = 'v1.2.3';
    expect(isTargetEvent(TARGET_EVENTS, generateContext({
      event: 'push',
      ref: 'refs/master',
    }))).toBe(true);
  });

  it('should return true 8', () => {
    process.env.INPUT_NEXT_VERSION = 'v1.2.3';
    expect(isTargetEvent(TARGET_EVENTS, generateContext({
      event: 'pull_request',
      action: 'reopened',
    }, {
      payload: {},
    }))).toBe(true);
  });

  it('should return false 1', () => {
    process.env.INPUT_BRANCH_PREFIX = 'release/';
    expect(isTargetEvent(TARGET_EVENTS, generateContext({
      event: 'pull_request',
      action: 'opened',
      ref: 'refs/tags/test',
    }, {
      payload: {
        'pull_request': {
          head: {
            ref: 'feature/new-feature',
          },
        },
      },
    }))).toBe(false);
  });

  it('should return false 2', () => {
    expect(isTargetEvent(TARGET_EVENTS, generateContext({
      event: 'push',
      ref: 'refs/tags/test',
    }))).toBe(false);
  });

  it('should return false 3', () => {
    process.env.INPUT_BRANCH_PREFIX = 'release';
    expect(isTargetEvent(TARGET_EVENTS, generateContext({
      event: 'push',
      ref: 'refs/heads/release/v1.2.3',
    }))).toBe(false);
  });

  it('should return false 4', () => {
    expect(isTargetEvent(TARGET_EVENTS, generateContext({
      event: 'release',
      action: 'published',
    }, {
      payload: {
        release: {
          'tag_name': 'abc',
        },
      },
    }))).toBe(false);
  });

  it('should return false 5', () => {
    expect(isTargetEvent(TARGET_EVENTS, generateContext({
      event: 'release',
      action: 'created',
      ref: 'refs/tags/v1.2.3',
    }, {
      payload: {
        release: {
          'tag_name': 'v1.2.3',
        },
      },
    }))).toBe(false);
  });

  it('should return false 6', () => {
    expect(isTargetEvent(TARGET_EVENTS, generateContext({
      event: 'create',
      ref: 'refs/heads/v1.2.3',
    }))).toBe(false);
  });

  it('should return false 7', () => {
    process.env.INPUT_BRANCH_PREFIX = 'release/';
    expect(isTargetEvent(TARGET_EVENTS, generateContext({
      event: 'pull_request',
      action: 'closed',
      ref: 'refs/pull/123/merge',
    }, {
      payload: {
        'pull_request': {
          head: {
            ref: 'release/v1.2.3',
          },
        },
      },
    }))).toBe(false);
  });

  it('should return false 8', () => {
    process.env.INPUT_NEXT_VERSION = 'abc';
    expect(isTargetEvent(TARGET_EVENTS, generateContext({
      event: 'push',
      ref: 'refs/master',
    }))).toBe(false);
  });
});

describe('getPackageDir', () => {
  testEnv(rootDir);

  it('should get package dir', () => {
    process.env.INPUT_PACKAGE_DIR = 'package-dir';
    process.env.GITHUB_WORKSPACE  = 'test';

    expect(getPackageDir()).toBe('package-dir');
  });

  it('should get default package dir', () => {
    process.env.GITHUB_WORKSPACE = 'test';

    expect(getPackageDir()).toBe('test');
  });
});

describe('getPackageFileName', () => {
  testEnv(rootDir);

  it('should get package file name', () => {
    process.env.INPUT_PACKAGE_NAME = 'test.json';
    expect(getPackageFileName()).toBe('test.json');
  });

  it('should get default package file name', () => {
    expect(getPackageFileName()).toBe('package.json');
  });
});

describe('getPackagePath', () => {
  testEnv(rootDir);

  it('should get package path', () => {
    process.env.GITHUB_WORKSPACE = 'test';

    const dir = path.resolve(__dirname, '..', '..');
    expect(getPackagePath()).toBe(`${dir}/test/package.json`);
  });
});

describe('getPackageData', () => {
  testEnv(rootDir);

  it('should get package data', () => {
    process.env.INPUT_PACKAGE_DIR  = 'src/fixtures';
    process.env.INPUT_PACKAGE_NAME = 'package-test1.json';
    expect(getPackageData()).toEqual({
      'name': 'test',
      'version': '0.0.1',
      'description': 'test',
    });
  });
});

describe('getPackageVersion', () => {
  testEnv(rootDir);

  it('should get package version 1', () => {
    process.env.INPUT_PACKAGE_DIR  = 'src/fixtures';
    process.env.INPUT_PACKAGE_NAME = 'package-test1.json';
    expect(getPackageVersion()).toBe('0.0.1');
  });

  it('should get package version 2', () => {
    process.env.INPUT_PACKAGE_DIR  = 'src/fixtures';
    process.env.INPUT_PACKAGE_NAME = 'package-test2.json';
    expect(getPackageVersion()).toBe('0.0.2');
  });

  it('should get package version 3', () => {
    process.env.INPUT_PACKAGE_DIR  = 'src/fixtures';
    process.env.INPUT_PACKAGE_NAME = 'package-test3.json';
    expect(getPackageVersion()).toBe('v0.0.3');
  });
});

describe('isTestTag', () => {
  testEnv(rootDir);

  it('should return true', () => {
    process.env.INPUT_TEST_TAG_PREFIX = 'test/';
    expect(isTestTag('test/v1.2.3')).toBe(true);
  });

  it('should return false', () => {
    process.env.INPUT_TEST_TAG_PREFIX = 'test/';
    expect(isTestTag('v1.2.3')).toBe(false);
  });
});

describe('getTestTag', () => {
  testEnv(rootDir);

  it('should get test tag', () => {
    process.env.INPUT_TEST_TAG_PREFIX = 'test/';
    expect(getTestTag('test/v1.2.3')).toBe('v1.2.3');
  });
});

describe('isValidTagName', () => {
  testEnv(rootDir);

  it('should return true 1', () => {
    expect(isValidTagName('1.2.3')).toBe(true);
    expect(isValidTagName('v1.2.3')).toBe(true);
  });

  it('should return true 2', () => {
    process.env.INPUT_TEST_TAG_PREFIX = 'test/';
    expect(isValidTagName('test/1.2.3')).toBe(true);
    expect(isValidTagName('test/v1.2.3')).toBe(true);
  });

  it('should return false 1', () => {
    expect(isValidTagName('test/1.2.3')).toBe(false);
    expect(isValidTagName('test/v1.2.3')).toBe(false);
    expect(isValidTagName('.2.3')).toBe(false);
    expect(isValidTagName('abc')).toBe(false);
    expect(isValidTagName('')).toBe(false);
  });

  it('should return false 2', () => {
    process.env.INPUT_TEST_TAG_PREFIX = 'test/';
    expect(isValidTagName('.2.3')).toBe(false);
    expect(isValidTagName('abc')).toBe(false);
    expect(isValidTagName('')).toBe(false);
  });
});

describe('isRequiredUpdate', () => {
  it('should return false', () => {
    expect(isRequiredUpdate('0.0.1', '0.0.1')).toBe(false);
    expect(isRequiredUpdate('v0.0.1', '0.0.1')).toBe(false);
    expect(isRequiredUpdate('0.0.1', 'v0.0.1')).toBe(false);
    expect(isRequiredUpdate('v0.0.1', 'v0.0.1')).toBe(false);
  });

  it('should return true', () => {
    expect(isRequiredUpdate('0.0.1', '0.0.2')).toBe(true);
    expect(isRequiredUpdate('0.0.1', 'v0.0.2')).toBe(true);
    expect(isRequiredUpdate('0.0.1', 'v0.1.0')).toBe(true);
  });
});

describe('getPackageVersionToUpdate', () => {
  testEnv(rootDir);

  it('should get version', () => {
    expect(getPackageVersionToUpdate('1.2.3')).toBe('1.2.3');
    expect(getPackageVersionToUpdate('v1.2.3')).toBe('1.2.3');
  });

  it('should get version', () => {
    process.env.INPUT_TEST_TAG_PREFIX = 'test/';

    expect(getPackageVersionToUpdate('test/1.2.3')).toBe('1.2.3');
    expect(getPackageVersionToUpdate('test/v1.2.3')).toBe('1.2.3');
  });
});

describe('getReplaceResultMessages', () => {
  it('should return empty', () => {
    expect(getReplaceResultMessages([], logger)).toEqual([]);
  });

  it('should get messages', () => {
    const messages = getReplaceResultMessages([
      {
        file: 'test1',
        hasChanged: true,
      },
      {
        file: 'test2',
        hasChanged: false,
      },
    ], logger);

    expect(messages).toHaveLength(2);
    expect(messages[0]).toContain('test1');
    expect(messages[1]).toContain('test2');
  });
});

describe('getCommitMessage', () => {
  testEnv(rootDir);

  it('should get commit message', () => {
    process.env.INPUT_COMMIT_MESSAGE = 'test message';

    expect(getCommitMessage()).toBe('test message');
  });

  it('should get default commit message', () => {
    expect(getCommitMessage()).toBe('feat: update package version');
  });
});

describe('getTagName', () => {
  testEnv(rootDir);

  it('should get tag name', () => {
    expect(getTagName(generateContext({
      event: 'push',
      ref: 'refs/tags/test',
    }))).toBe('test');
  });

  it('should get tag name from branch', () => {
    process.env.INPUT_BRANCH_PREFIX = 'release/';
    expect(getTagName(generateContext({
      event: 'push',
      ref: 'refs/heads/release/v1.2.3',
    }))).toBe('v1.2.3');
  });
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { shouldReloadIdentityForAuthEvent } from '../src/lib/authState.js';

test('MFA and token refresh events preserve protected view state', () => {
  assert.equal(shouldReloadIdentityForAuthEvent('MFA_CHALLENGE_VERIFIED'), false);
  assert.equal(shouldReloadIdentityForAuthEvent('TOKEN_REFRESHED'), false);
});

test('identity-changing auth events still reload profile and role', () => {
  assert.equal(shouldReloadIdentityForAuthEvent('SIGNED_IN'), true);
  assert.equal(shouldReloadIdentityForAuthEvent('SIGNED_OUT'), true);
  assert.equal(shouldReloadIdentityForAuthEvent('USER_UPDATED'), true);
});

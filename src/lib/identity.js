// Placeholder identity hook.
// v0: returns a hardcoded submitter so the rest of the flow works.
// v1: read from Okta context once SSO is wired at the door.

export function useIdentity() {
  return {
    name:  'Jim Costigan',
    email: 'jim.costigan@forcepoint.com',
    dept:  'IT / Enterprise AI',
    source: 'placeholder',
  }
}

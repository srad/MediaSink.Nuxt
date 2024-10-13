/**
 * Generate a random alphanumeric string of at least length 10.
 */
export const randomString = () => Math.random().toString(36).substring(2);
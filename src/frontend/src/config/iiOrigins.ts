/**
 * Internet Identity origin configuration for stable principal derivation.
 * 
 * IMPORTANT: Changing the derivation origin will change user principals.
 * To preserve principals across domain changes, add old domains to alternativeOrigins.
 */

/**
 * The stable derivation origin used for Internet Identity authentication.
 * This should remain constant across domain changes to preserve user principals.
 */
export const II_DERIVATION_ORIGIN = 'https://mcubes.net';

/**
 * Alternative origins that should map to the same principal.
 * Add previous domains here when migrating to preserve user identities.
 * 
 * Example: If moving from mcubes.net to newdomain.com, add:
 * ['https://mcubes.net', 'https://newdomain.com']
 */
export const II_ALTERNATIVE_ORIGINS: string[] = [
  'https://mcubes.net',
  'https://mcubes.online'
];

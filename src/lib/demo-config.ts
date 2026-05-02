/**
 * DEMO MODE CONFIGURATION
 * Centrální config pro showcase verzi na GitHubu
 */

export const DEMO_CONFIG = {
  // Flag: je to demo verze?
  isEnabled: process.env.NEXT_PUBLIC_DEMO_MODE === 'true',
  
  // Superadmin, kterému se umožňuje všechno
  superadminEmail: 'admin@clientoro.pro',
  
  // 4 testovací organizace
  testOrganizations: [
    {
      id: '15c1b9a6-ccbc-4d76-b753-fe6094b313a8',
      name: 'Salon Vlasy',
      mode: 'team',
      staff: 3,
      services: 8,
      bookings: 17,
      description: 'Beauty salon s týmem'
    },
    {
      id: '962ea8c4-fb29-48c8-9b25-b0783c538c42',
      name: 'Massage by Tereza',
      mode: 'solo_inspire',
      staff: 1,
      services: 5,
      bookings: 17,
      description: 'Terapeut s AI'
    },
    {
      id: 'c65aa56b-eeb8-4d01-870b-e7a225aeff0f',
      name: 'INK Masters Studio',
      mode: 'pro_inspire',
      staff: 2,
      services: 6,
      bookings: 7,
      description: 'Tetovací studio - PRO plán'
    },
    {
      id: '4e61afc1-1cf4-417d-8739-85b9fed4b5c9',
      name: 'Mgr. Jana Nováková - Fyzioterapie',
      mode: 'solo',
      staff: 1,
      services: 5,
      bookings: 3,
      description: 'Fyzioterapie - OSVČ'
    }
  ],

  // Která slova jsou v demo modu povolena?
  allowedMethods: ['GET', 'HEAD', 'OPTIONS'],
  
  // API routes, které se BLOKUJÍ v demo modu (pro non-superadmin)
  blockedEndpoints: [
    '/api/bookings',
    '/api/services',
    '/api/staff',
    '/api/clients',
    '/api/settings',
    '/api/register',
    '/api/stripe',
    '/api/auth'
  ],

  // Zprávy pro uživatele
  messages: {
    demoAlert: 'Toto je DEMO verze aplikace. Registrace není dostupná. Pro přihlášení použijte superadmin účet.',
    demoNotice: 'Jste v DEMO verzi. Změny se nebudou ukládat.',
    readOnly: 'V demo verzi jsou změny pouze pro čtení.',
    successMessage: 'Demo verze - změny se neukládají, ale vidíte jak by to fungovalo.'
  }
}

/**
 * Helper: Zjistí, je-li uživatel superadmin
 */
export const isSuperadminEmail = (email: string | null | undefined): boolean => {
  return email === DEMO_CONFIG.superadminEmail
}

/**
 * Helper: Zjistí, je-li endpoint v demo blokován
 */
export const isEndpointBlocked = (pathname: string): boolean => {
  if (!DEMO_CONFIG.isEnabled) return false
  return DEMO_CONFIG.blockedEndpoints.some(endpoint => pathname.startsWith(endpoint))
}

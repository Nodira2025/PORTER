// Public demonstration credentials. They never authenticate against Supabase.
export const DEMO_EMAIL = "usuario@porter.com";
export const DEMO_PASSWORD = "PorterDemo2026!";
export const isDemoEmail = (email: string) =>
  email.trim().toLowerCase() === DEMO_EMAIL;
export function validateDemoAccess(email: string, password: string) {
  if (!isDemoEmail(email)) return false;
  if (password !== DEMO_PASSWORD)
    throw Error("La contraseña de demostración es " + DEMO_PASSWORD);
  return true;
}

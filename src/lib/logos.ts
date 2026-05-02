/**
 * Generates a robust logo URL for a company using Logo.dev with multiple fallbacks.
 * @param companyName - The name of the company to fetch the logo for.
 * @returns { logoUrl: string, backupUrl: string }
 */
export function getCompanyLogo(companyName: string): { logoUrl: string, backupUrl: string } {
  if (!companyName || companyName === "Unknown") {
    const defaultBackup = `https://ui-avatars.com/api/?name=?&background=f4f4f5&color=18181b&bold=true`;
    return { logoUrl: defaultBackup, backupUrl: defaultBackup };
  }

  // Smarter Domain Logic: Don't append .com if it's already there
  let domain = companyName.toLowerCase().trim().replace(/\s+/g, '');
  if (!domain.includes('.')) {
    domain += ".com";
  }

  const token = process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN;
  
  // Primary URL from Logo.dev
  const logoUrl = `https://img.logo.dev/${domain}?${token ? `token=${token}&` : ''}fallback=monogram`;
  
  // Backup URL
  const backupUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&background=f4f4f5&color=18181b&bold=true`;

  // Diagnostic Log (Visible in Browser Console)
  if (typeof window !== 'undefined') {
    console.log(`[Logo Intelligence] Fetching for ${companyName} -> ${logoUrl}`);
  }

  return { logoUrl, backupUrl };
}

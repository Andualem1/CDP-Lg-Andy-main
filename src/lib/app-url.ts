function trimTrailingSlash(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

function isLocalUrl(value: string) {
  try {
    const hostname = new URL(value).hostname;

    return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
  } catch {
    return false;
  }
}

function vercelDeploymentUrl() {
  const rawUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  const url = rawUrl?.trim();

  if (!url) {
    return "";
  }

  return url.startsWith("http") ? url : `https://${url}`;
}

export function getAppBaseUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() ?? "";
  const isProduction = process.env.NODE_ENV === "production";

  if (configuredUrl && configuredUrl.startsWith("http") && !(isProduction && isLocalUrl(configuredUrl))) {
    return trimTrailingSlash(configuredUrl);
  }

  const deploymentUrl = vercelDeploymentUrl();
  if (deploymentUrl) {
    return trimTrailingSlash(deploymentUrl);
  }

  return "http://localhost:3000";
}

export function shouldUseSecureCookies() {
  return getAppBaseUrl().startsWith("https://") || process.env.VERCEL === "1";
}

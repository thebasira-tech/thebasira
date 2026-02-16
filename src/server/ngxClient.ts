export function ngxUrl(path: string, params?: Record<string, string>) {
    const base = process.env.NGX_API_BASE;
    const token = process.env.NGX_TOKEN;
  
    if (!base) throw new Error("Missing env NGX_API_BASE");
    if (!token) throw new Error("Missing env NGX_TOKEN");
  
    const u = new URL(base + path);
    if (params) {
      for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
    }
    u.searchParams.set("_t", token);
    return u.toString();
  }
  
  export async function ngxFetchJson<T>(path: string, params?: Record<string, string>) {
    const url = ngxUrl(path, params);
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`NGX ${res.status} ${res.statusText} on ${path} :: ${body.slice(0, 300)}`);
    }
    return (await res.json()) as T;
  }
  
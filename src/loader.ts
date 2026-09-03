const baseUrl = "https://cdn.luon.dev";
const modules = new Map<string, Promise<unknown>>();
const scripts = new Map<string, Promise<void>>();
const styles = new Map<string, Promise<void>>();

declare global {
  var __LUON_CDN__: string | undefined;
}

export function cdnUrl(path: string) {
  const base = globalThis.__LUON_CDN__ || baseUrl;
  return new URL(path, `${base.replace(/\/$/, "")}/`).href;
}

export function loadModule<Value>(path: string): Promise<Value> {
  const url = cdnUrl(path);
  let job = modules.get(url);
  if (!job) {
    job = import(url).catch((error) => {
      modules.delete(url);
      throw error;
    });
    modules.set(url, job);
  }
  return job as Promise<Value>;
}

export function loadScript(path: string) {
  const url = cdnUrl(path);
  let job = scripts.get(url);
  if (job) return job;
  job = new Promise<void>((done, fail) => {
    const found = [...document.querySelectorAll<HTMLScriptElement>("script[src]")]
      .find((tag) => tag.src === url);
    if (found) {
      if (found.dataset.luonReady === "true") done();
      else found.addEventListener("load", () => done(), { once: true });
      return;
    }
    const tag = document.createElement("script");
    tag.src = url;
    tag.crossOrigin = "anonymous";
    tag.addEventListener("load", () => {
      tag.dataset.luonReady = "true";
      done();
    }, { once: true });
    tag.addEventListener("error", () => {
      fail(new Error(`UI script failed: ${url}`));
    }, { once: true });
    document.head.append(tag);
  });
  scripts.set(url, job);
  return job;
}

export function loadStyle(path: string) {
  const url = cdnUrl(path);
  let job = styles.get(url);
  if (job) return job;
  job = new Promise<void>((done, fail) => {
    const found = [...document.querySelectorAll<HTMLLinkElement>(
      "link[data-luon-ui]",
    )].find((link) => link.dataset.luonUi === url);
    if (found) {
      if (found.sheet) done();
      else found.addEventListener("load", () => done(), { once: true });
      return;
    }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = url;
    link.crossOrigin = "anonymous";
    link.dataset.luonUi = url;
    link.addEventListener("load", () => done(), { once: true });
    link.addEventListener("error", () => {
      fail(new Error(`UI style failed: ${url}`));
    }, { once: true });
    document.head.append(link);
  });
  styles.set(url, job);
  return job;
}

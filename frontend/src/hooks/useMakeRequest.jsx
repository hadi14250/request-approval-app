import { useEffect, useState } from "react";

function useMakeRequest(url, method = "GET", userId, body = null) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!url) return;

    const controller = new AbortController();

    const run = async () => {
      setLoading(true);
      setError(null);

      try {
        const options = {
          method,
          signal: controller.signal,
          headers: {
            "user-id": String(userId),
          },
        };

        if (body !== null) {
          options.headers["Content-Type"] = "application/json";
          options.body = JSON.stringify(body);
        }

        const res = await fetch(url, options);

        let payload = null;
        const text = await res.text();
        if (text) payload = JSON.parse(text);

        if (!res.ok) {
          throw new Error(payload?.error || `Request failed: ${res.status}`);
        }

        setData(payload);
      } catch (e) {
        if (e.name !== "AbortError") setError(e);
      } finally {
        setLoading(false);
      }
    };

    run();

    return () => controller.abort();
  }, [url, method, userId, body]);

  return { data, loading, error };
}

export default useMakeRequest;

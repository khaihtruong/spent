export async function fetchWithAuth(url, options = {}) {
  try {
    const res = await fetch(url, { ...options, credentials: "include" });

    if (res.status === 401) {
      window.location.href = "/login";
      return;
    }

    if (!res.ok) {
      throw new Error(`Request failed with status ${res.status}`);
    }

    return res;
  } catch (error) {
    console.error("Error during fetchWithAuth:", error);
    throw error;
  }
}

export async function fetchGetWithAuth(url) {
  try {
    const res = await fetchWithAuth(url);
    return res.json();
  } catch (error) {
    console.error("Error during fetchGetWithAuth:", error);
    throw error;
  }
}

export async function fetchPostWithAuth(url, data) {
  return fetchWithAuth(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

export async function fetchDeleteWithAuth(url) {
  return fetchWithAuth(url, {
    method: "DELETE",
  });
}

export async function fetchPutWithAuth(url, data) {
  return fetchWithAuth(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

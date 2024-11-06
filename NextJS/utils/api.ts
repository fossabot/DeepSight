export const getCSRFToken = async (): Promise<string> => {
  let cookieMatch = document.cookie.match(/csrftoken=([^;]+)/);
  if (cookieMatch && cookieMatch.length > 1) {
    return cookieMatch[1];
  }

  try {
    const healthResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/health`,
      {
        credentials: "include",
      },
    );

    if (healthResponse.ok) {
      cookieMatch = document.cookie.match(/csrftoken=([^;]+)/);
      if (cookieMatch && cookieMatch.length > 1) {
        return cookieMatch[1];
      }
    } else {
      console.error("Health check failed:", healthResponse.status);
    }
  } catch (error) {
    console.error("Error fetching CSRF token:", error);
  }

  return "";
};

export const getAccessToken = async (): Promise<string | null> => {
  try {
    const accessToken = localStorage.getItem("access");

    if (accessToken) {
      const payload = JSON.parse(atob(accessToken.split(".")[1]));
      const exp = payload.exp * 1000;
      const now = Date.now();

      if (exp > now) {
        return accessToken;
      }
    }

    const csrfToken = await getCSRFToken();
    if (!csrfToken) {
      console.error("CSRF token not found");
      return null;
    }

    const refreshResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/token/refresh/`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
      },
    );

    if (refreshResponse.ok) {
      const data = await refreshResponse.json();
      localStorage.setItem("access", data.access);
      return data.access;
    } else {
      console.error("Error refreshing access token:", refreshResponse.status);
      return null;
    }
  } catch (error) {
    console.error("Error getting access token:", error);
    return null;
  }
};

export const apiFetch = async <T>(
  url: string,
  options: RequestInit = {},
  auth = true,
  json = true,
  cors = true,
): Promise<Response> => {
  if (cors) {
    let csrftoken = await getCSRFToken();

    if (!csrftoken) {
      console.error("CSRF token not found");
      return new Response(null, { status: 500 });
    }

    options.headers = {
      ...options.headers,
      "X-CSRFToken": csrftoken,
    };
  }

  if (auth) {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      return new Response(null, { status: 401 });
    }

    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
    };
  }

  if (json && options.body) {
    options.headers = {
      ...options.headers,
      "Content-Type": "application/json",
    };
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
      ...options,
      credentials: "include",
    });
    if (response.status === 401) {
      console.error("Unauthorized request");
      return new Response(null, { status: 401 });
    }

    return response;
  } catch (error) {
    console.error("Error fetching data:", error);
    return new Response(null, { status: 500 });
  }
};

export const isAuthenticated = async (
  onAuthenticated: () => void,
  onUnauthenticated: () => void,
): Promise<void> => {
  const accessToken = await getAccessToken();

  if (accessToken) {
    onAuthenticated();
  } else {
    onUnauthenticated();
  }
};

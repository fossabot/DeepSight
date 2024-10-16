import { i } from "framer-motion/client";

export const getCSRFToken = (): string => {
  const cookieMatch = document.cookie.match(/csrftoken=([^;]+)/);
  if (cookieMatch && cookieMatch.length > 1) {
    return cookieMatch[1];
  }
  return "";
};

export const apiFetch = async <T>(
  url: string,
  options: RequestInit = {},
): Promise<Response> => {
  let csrftoken = getCSRFToken();

  if (!csrftoken) {
    const healthResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/health`,
      {
        credentials: "include",
      },
    );
    csrftoken = getCSRFToken();
    if (!csrftoken) {
      throw new Error("Failed to obtain CSRF token.");
    }
  }

  const accessToken = sessionStorage.getItem("access");

  if (!accessToken) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrftoken,
        ...options.headers,
      },
      credentials: "include",
    });
    return response;
  } else {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "X-CSRFToken": csrftoken,
        ...options.headers,
      },
      credentials: "include",
    });
    return response;
  }
};

export const isAuthenticated = async (
  onAuthenticated: () => void,
  onUnauthenticated: () => void,
): Promise<() => void> => {
  let intervalId: NodeJS.Timeout | null = null;

  const checkAuthentication = async () => {
    try {
      const accessToken = sessionStorage.getItem("access");

      if (accessToken) {
        const payload = JSON.parse(atob(accessToken.split(".")[1])); 
        const exp = payload.exp * 1000;
        const now = Date.now();

        if (exp > now) {
          onAuthenticated();
          return;
        }
      }
      
      const refreshResponse = await apiFetch(`/auth/token/refresh`, {
        method: "POST",
      });

      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        sessionStorage.setItem("access", data.access);
        onAuthenticated();
      } else {
        console.error("Error refreshing access token:", refreshResponse.status);
        onUnauthenticated();
      }
    } catch (error) {
      console.error("Error checking authentication:", error);
      onUnauthenticated();
    }
  };

  await checkAuthentication(); 

  intervalId = setInterval(checkAuthentication, 300000);

  return () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  };
};

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

  const accessToken = sessionStorage.getItem("access") || "NO_ACCESS_TOKEN";

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
        try {
          const verifyResponse = await apiFetch(`/auth/token/verify`, {
            method: "POST",
            body: JSON.stringify({ token: accessToken }),
          });

          if (verifyResponse.ok) {
            onAuthenticated();
          } else if (verifyResponse.status === 401) {
            sessionStorage.removeItem("access");

            try {
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
            } catch (refreshError) {
              console.error("Error refreshing access token:", refreshError);
              onUnauthenticated(); 
            }
          } else {
            console.error("Error verifying access token:", verifyResponse.status);
            onUnauthenticated(); 
          }
        } catch (verifyError) {
          console.error("Error verifying access token:", verifyError);
          onUnauthenticated(); 
        }
      } else {
        onUnauthenticated();
      }
    } catch (error) {
      console.error("Error during authentication process:", error);
      onUnauthenticated();
    }
  };

  checkAuthentication();

  intervalId = setInterval(checkAuthentication, 600000);

  return () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  };
};
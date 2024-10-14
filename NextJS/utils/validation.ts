export const validateEmail = (email: string): void => {
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  if (!emailRegex.test(email)) {
    throw new Error("Invalid email format.");
  }
};

export const validatePassword = (password: string): void => {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    throw new Error("Password is too weak.");
  }
};

export const validatePasswordConfirmation = (
  password: string,
  confirmPassword: string,
): void => {
  if (password !== confirmPassword) {
    throw new Error("Passwords do not match!");
  }
};

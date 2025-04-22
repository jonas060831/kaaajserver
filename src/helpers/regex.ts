
//REGEX

export const usernameRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

//atleast 8 characters, atleast 1 Uppercase, atleast 1 digit, atleast 1 special characters from !@#$%^&*()_+=-[]{}\|/.,<>;'"
//export const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\+\-\/\\<>,.;'\[\]{}|]).{8,}$/
export const passwordRegex = (password: string) : string[] | boolean => {
  const errors = []

  if (password.length < 8) {
  errors.push("Password must be at least 8 characters long.");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter.");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter.");
  }

  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one digit.");
  }

  if (!/[!@#$%^&*()_\+\-\/\\<>,.;'\[\]{}|]/.test(password)) {
    errors.push("Password must contain at least one special character.");
  }

  if (errors.length > 0) {
    return errors
  } else {
    return true
  }
}

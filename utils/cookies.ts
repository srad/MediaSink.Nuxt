// See: https://gist.github.com/zahidshowrav/44183ecebbd009faf150c0105f10f01d

export const setCookie = <T>(name: string, value: T, days: number): void => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);

  // Serialize the value to a string
  const stringValue = (typeof value === 'object') ? JSON.stringify(value) : String(value);

  document.cookie = `${name}=${stringValue};expires=${expires.toUTCString()};path=/`;
};

// Function to get a cookie and parse it into a generic value
export const getCookie = <T>(name: string): T | null => {
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith(name + '=')) {
      const stringValue = cookie.substring(name.length + 1, cookie.length);

      // Attempt to parse the value or return it as a string
      try {
        const parsedValue = JSON.parse(stringValue) as T;
        return parsedValue;
      } catch (error) {
        return stringValue as any;
      }
    }
  }
  return null; // Cookie not found
};

// Function to remove a cookie by name
export const removeCookie = (name: string): void => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
};
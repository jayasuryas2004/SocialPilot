import client from "./client";

/**
 * Fetch the current user's profile and settings.
 */
export async function getProfile() {
  try {
    const { data } = await client.get("/api/settings/profile");
    return data;
  } catch (err) {
    try {
      const { data } = await client.get("/settings/profile");
      return data;
    } catch (fallbackErr) {
      console.error("Failed to fetch user settings profile:", fallbackErr);
      throw fallbackErr;
    }
  }
}

/**
 * Update the user's basic profile information (first_name, last_name, username, role).
 */
export async function updateProfile(payload) {
  try {
    const { data } = await client.put("/api/settings/profile", payload);
    return data;
  } catch (err) {
    try {
      const { data } = await client.put("/settings/profile", payload);
      return data;
    } catch (fallbackErr) {
      console.error("Failed to update profile:", fallbackErr);
      throw fallbackErr;
    }
  }
}

/**
 * Upload a new avatar image (multipart/form-data).
 */
export async function uploadAvatar(formData) {
  try {
    const { data } = await client.post("/api/settings/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  } catch (err) {
    try {
      const { data } = await client.post("/settings/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return data;
    } catch (fallbackErr) {
      console.error("Failed to upload avatar:", fallbackErr);
      throw fallbackErr;
    }
  }
}

/**
 * Change the user's password with current password verification.
 */
export async function updatePassword(payload) {
  try {
    const { data } = await client.put("/api/settings/password", payload);
    return data;
  } catch (err) {
    try {
      const { data } = await client.put("/settings/password", payload);
      return data;
    } catch (fallbackErr) {
      console.error("Failed to update password:", fallbackErr);
      throw fallbackErr;
    }
  }
}

/**
 * Update UI preferences (Theme and Language).
 */
export async function updatePreferences(payload) {
  try {
    const { data } = await client.put("/api/settings/preferences", payload);
    return data;
  } catch (err) {
    try {
      const { data } = await client.put("/settings/preferences", payload);
      return data;
    } catch (fallbackErr) {
      console.error("Failed to update preferences:", fallbackErr);
      throw fallbackErr;
    }
  }
}

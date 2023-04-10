const API_KEY =
  import.meta.env.VITE_GOOGLE_API_KEY ||
  "AIzaSyDy0HSRyEjK2y1HfXwMASZ460XqtFYvUPU";
const CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "293225283958-trov8l9l11stv5859vv48p2s6ip6cqmb.apps.googleusercontent.com";
const SCOPES =
  import.meta.env.VITE_GOOGLE_SCOPES ||
  "https://www.googleapis.com/auth/drive.appdata";

async function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const scriptElement = document.createElement("script");
    scriptElement.async = true;
    scriptElement.defer = true;
    scriptElement.src = src;

    scriptElement.addEventListener("load", () => {
      resolve();
    });
    scriptElement.addEventListener("error", (error) => {
      reject(error);
    });

    document.body.appendChild(scriptElement);
  });
}

let gapiLoading: Promise<void>;
let gsiLoading: Promise<void>;
let tokenExpirationDate: Date;

async function enableGoogle() {
  if (!gapiLoading) {
    gapiLoading = loadScript("https://apis.google.com/js/api.js").then(() => {
      return new Promise((resolve, reject) => {
        gapi.load("client", () => {
          gapi.client
            .init({
              apiKey: API_KEY,
              discoveryDocs: [
                "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
              ],
            })
            .then(resolve)
            .catch(reject);
        });
      });
    });
  }
  await gapiLoading;

  if (!gsiLoading) {
    gsiLoading = loadScript("https://accounts.google.com/gsi/client");
  }
  await gsiLoading;

  if (!tokenExpirationDate || tokenExpirationDate < new Date()) {
    const response: any = await new Promise((resolve, reject) => {
      const tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (resp) => {
          if (resp.error) reject(resp.error);
          else resolve(resp);
        },
      });

      if (gapi.client.getToken() === null) {
        // Prompt the user to select a Google Account and ask for consent to share their data
        // when establishing a new session.
        tokenClient.requestAccessToken({ prompt: "consent" });
      } else {
        // Skip display of account chooser and consent dialog for an existing session.
        tokenClient.requestAccessToken({ prompt: "" });
      }
    });

    tokenExpirationDate = new Date(
      Date.now() + (response!.expires_in! - 300) * 1000
    );
  }
}

export async function listFilesFromGoogleDrive(): Promise<
  { id: string; name: string; description: string; modifiedTime: string }[]
> {
  await enableGoogle();

  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&fields=files(id,name,description,modifiedTime)`,
    {
      method: "GET",
      headers: {
        authorization: `Bearer ${gapi.client.getToken().access_token}`,
      },
    }
  );

  const result = await response.json();
  return result.files;
}

export async function getFileContentFromGoogleDrive(options: {
  fileId: string;
}) {
  await enableGoogle();

  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${options.fileId}?alt=media`,
    {
      method: "GET",
      headers: {
        authorization: `Bearer ${gapi.client.getToken().access_token}`,
      },
    }
  );

  const result = await response.json();
  return result;
}

export async function createFileOnGoogleDrive(options: {
  name: string;
  description: string;
  body: string;
}): Promise<string> {
  await enableGoogle();

  const file = new Blob([options.body], { type: "text/plain" });
  const metadata = JSON.stringify({
    name: options.name,
    description: options.description,
    parents: ["appDataFolder"],
    mimeType: "application/json",
  });

  const form = new FormData();
  form.append("metadata", new Blob([metadata], { type: "application/json" }));
  form.append("file", file);

  const response = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id",
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${gapi.client.getToken().access_token}`,
      },
      body: form,
    }
  );

  const result = await response.json();
  return result.id;
}

export async function updateFileOnGoogleDrive(options: {
  fileId: string;
  name: string;
  description: string;
  body: string;
}): Promise<any> {
  await enableGoogle();

  const file = new Blob([options.body], { type: "text/plain" });
  const metadata = JSON.stringify({
    name: options.name,
    description: options.description,
    mimeType: "application/json",
  });

  const form = new FormData();
  form.append("metadata", new Blob([metadata], { type: "application/json" }));
  form.append("file", file);

  const response = await fetch(
    `https://www.googleapis.com/upload/drive/v3/files/${options.fileId}?uploadType=multipart&fields=id`,
    {
      method: "PATCH",
      headers: {
        authorization: `Bearer ${gapi.client.getToken().access_token}`,
      },
      body: form,
    }
  );

  const result = await response.json();
  return result.id;
}

export async function deleteFileFromGoogleDrive(options: { fileId: string }) {
  await enableGoogle();

  await fetch(`https://www.googleapis.com/drive/v3/files/${options.fileId}`, {
    method: "DELETE",
    headers: {
      authorization: `Bearer ${gapi.client.getToken().access_token}`,
    },
  });
}

<!--Only Humans should touch this file and no AI agents-->

# Authentication

## Google

Using my google project org001-project001 for the client ID and secret used in supabase.

- Go to the project in [google cloud platform](https://console.cloud.google.com/auth/overview?project=org001-project001).
- Go to clients.
- Go to the org001-project001 OAuth 2.0 Client IDs.
- Copy the client ID and secret to the supabase authentication settings for google.
- Make sure the redirect URL is set to `https://your-supabase-project-url/auth/v1/callback` in the google cloud platform.

### Supabase

- Go to your supabase project.
- Go to Authentication -> Settings -> External OAuth Providers.
- Enable Google and paste the client ID and secret from the google cloud platform.
- Save the settings.

- For redirect URLs in supabase itself under auth url configuration make sure to add:
  - `https://woolwitch.co.uk/*`
  - `https://woolwitch.netlify.app/*`


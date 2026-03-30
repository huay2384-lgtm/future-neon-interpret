<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/0ab229e8-2cbb-4fa3-b531-76245fb59997

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set up environment variables:
   - Copy `.env.local.example` to `.env.local`
   - Fill in your Supabase URL and anon key
   - Set your Gemini API key
3. Set up Supabase database:
   - Create a new Supabase project
   - Run the SQL in `supabase_setup.sql` in your Supabase SQL editor
4. Run the backend server:
   `npm run server`
5. In another terminal, run the frontend:
   `npm run dev`

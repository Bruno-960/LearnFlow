
  # UX Design with Dark Mode

  This is a code bundle for UX Design with Dark Mode. The original project is available at https://www.figma.com/design/N5IbI3LMDIo5vdc2bydJhc/UX-Design-with-Dark-Mode.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## Calendar device notifications

  Device push notifications require VAPID keys.

  Frontend `.env`:

  ```env
  VITE_VAPID_PUBLIC_KEY=your_public_vapid_key
  ```

  Supabase Edge Function secrets:

  ```env
  VAPID_SUBJECT=mailto:you@example.com
  VAPID_PUBLIC_KEY=your_public_vapid_key
  VAPID_PRIVATE_KEY=your_private_vapid_key
  SUPABASE_URL=your_supabase_url
  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
  ```

  Apply `supabase-calendar-schema.sql`, deploy `supabase/functions/send-calendar-notifications`, and schedule that function to run daily before the user needs reminders.
  

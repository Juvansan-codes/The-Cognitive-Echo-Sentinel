import { redirect } from 'next/navigation';

export default function Home() {
  // Always redirect the root page to the assessment dashboard
  // Middleware will catch this and naturally redirect to /login if unauthenticated
  redirect('/assessment');
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/modules/auth/nextauth";
import { validateServerData } from '@/lib/serverSafe';

export default async function TestSessionPage() {
  try {
    const session = await getServerSession(authOptions);

    // Validate session exists before displaying
    if (session) {
      validateServerData(
        session.user,
        'Session user data is missing'
      );
    }

    return (
      <div className="container mx-auto p-8">
        <h1 className="text-2xl font-bold mb-4">Session Test</h1>
        <div className="mb-4">
          <strong>Status:</strong> {session ? '✅ Authenticated' : '❌ Not authenticated'}
        </div>
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>
    );
  } catch (error) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Session Test Error</h1>
        <div className="bg-red-50 p-4 rounded">
          <p className="text-red-800">
            Failed to load session data. Please try refreshing the page.
          </p>
        </div>
      </div>
    );
  }
}

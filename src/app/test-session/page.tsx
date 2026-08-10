import { getServerSession } from "next-auth";
import { authOptions } from "@/modules/auth/nextauth";
import { validateServerData } from '@/lib/serverSafe';

export default async function TestSessionPage() {
  const session = await getServerSession(authOptions).catch(() => null);

  if (session) {
    validateServerData(
      session.user,
      'Session user data is missing'
    );
  }

  if (!session) {
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

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Session Test</h1>
      <div className="mb-4">
        <strong>Status:</strong> ✅ Authenticated
      </div>
      <pre className="bg-gray-100 p-4 rounded overflow-auto">
        {JSON.stringify(session, null, 2)}
      </pre>
    </div>
  );
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/modules/auth/nextauth";

export default async function TestSessionPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Session Test</h1>
      <pre className="bg-gray-100 p-4 rounded overflow-auto">
        {JSON.stringify(session, null, 2)}
      </pre>
    </div>
  );
}

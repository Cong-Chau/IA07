import { useAuth } from "../auth/authProvider";

export default function Dashboard() {
  const { logout } = useAuth();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
    retry: 0,
  });

  if (isLoading) return <div>Đang tải...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h1 className="text-3xl font-semibold text-gray-800">Dashboard</h1>
          <button
            onClick={logout}
            className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 active:scale-95 transition font-medium"
          >
            Logout
          </button>
        </div>

        <div className="mt-6 bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <h2 className="text-xl font-medium text-gray-700 mb-4">
            Thông tin tài khoản
          </h2>

          <div className="space-y-2 text-gray-700">
            <p>
              <span className="font-medium">Email:</span> {data.email}
            </p>
            <p>
              <span className="font-medium">Tên:</span> {data.name}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

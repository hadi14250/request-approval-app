import useMakeRequest from "../hooks/useMakeRequest";
import { useUser } from "../context/UserContext";

export default function Pending() {
  const API_URL = import.meta.env.VITE_API_URL;
  const { currentUser } = useUser();

  const { data, loading, error } = useMakeRequest(
    `${API_URL}/requests/pending`,
    "GET",
    currentUser.id
  )

  if (loading) return <p>Loading...</p>
  if (error) return <p>{error.message}</p>
  if (!data || data.length === 0) return <p>No requests</p>

  return (
    <>
      <h1>Requests</h1>
        <div>
        {data
        .map(r => (
            <div key={r.id}>
            <p>{r.title}, {r.description}</p>
            </div>
        ))}
        </div>

    </>
  )
}

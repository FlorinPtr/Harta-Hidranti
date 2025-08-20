import { useState } from "react";

interface LoginDialogProps {
  onClose: () => void;
  onLogin: (isAdmin: boolean) => void;
}

export default function LoginDialog({ onClose, onLogin }: LoginDialogProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Hardcoded admin credentials
    if (username === "adminH" && password === "secret123") {
      onLogin(true);
      onClose();
    } else {
      setError("Date de autentificare incorecte");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-gray-600 p-6 rounded-lg shadow-lg w-80">
        <h2 className="text-lg font-bold mb-4 text-white">Autentificare</h2>
                <p className="text-sm mb-4 p-2 text-white">Trebuie sa fii admin pentru a adauga sau edita hidranti</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border rounded-md p-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Parola</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-md p-2 text-sm"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 text-sm bg-gray-300 rounded-md"
            >
              Anulează
            </button>
            <button
              type="submit"
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "@/modules/account/useAccount";
import { ArrowLeftIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default function SettingsPage() {
  const router = useRouter();
  const { changePassword, deleteAccount } = useAccount();

  // Password change state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  // Delete account state
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    // Validation
    if (newPassword.length < 8) {
      setPasswordError("Parola nouă trebuie să aibă cel puțin 8 caractere");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Parolele nu se potrivesc");
      return;
    }

    setChangingPassword(true);
    const success = await changePassword(oldPassword, newPassword);

    if (success) {
      setPasswordSuccess("Parola a fost schimbată cu succes!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(""), 3000);
    } else {
      setPasswordError("Eroare la schimbarea parolei. Verifică parola actuală.");
    }

    setChangingPassword(false);
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError("");

    if (!deletePassword) {
      setDeleteError("Introdu parola pentru a confirma");
      return;
    }

    setDeleting(true);
    const success = await deleteAccount(deletePassword);

    if (success) {
      router.push("/");
    } else {
      setDeleteError("Eroare la ștergerea contului. Verifică parola.");
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Setări cont</h1>
          <p className="mt-1 text-gray-600">
            Gestionează securitatea și opțiunile contului
          </p>
        </div>
      </div>

      {/* Change Password Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Schimbă parola
        </h2>

        {passwordSuccess && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
            {passwordSuccess}
          </div>
        )}

        {passwordError && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            {passwordError}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Parola actuală *
            </label>
            <input
              type="password"
              required
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Parolă nouă *
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-500">
              Minimum 8 caractere
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmă parola nouă *
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={changingPassword}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {changingPassword ? "Se schimbă..." : "Schimbă parola"}
          </button>
        </form>
      </div>

      {/* Delete Account Section */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start gap-3 mb-4">
          <ExclamationTriangleIcon className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="text-xl font-semibold text-red-900 mb-2">
              Zona periculoasă
            </h2>
            <p className="text-red-800 text-sm">
              Odată ce îți ștergi contul, nu există cale de întoarcere. Te rog
              fii sigur.
            </p>
          </div>
        </div>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Șterge contul
          </button>
        ) : (
          <div className="space-y-4">
            {deleteError && (
              <div className="bg-red-100 border border-red-300 text-red-900 px-4 py-3 rounded-lg">
                {deleteError}
              </div>
            )}

            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-red-900 mb-1">
                  Introdu parola pentru a confirma ștergerea *
                </label>
                <input
                  type="password"
                  required
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="w-full px-4 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Parola ta"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={deleting}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? "Se șterge..." : "Confirm ștergerea contului"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeletePassword("");
                    setDeleteError("");
                  }}
                  className="px-6 py-2 bg-white border border-red-300 text-red-900 rounded-lg hover:bg-red-50 transition-colors font-medium"
                >
                  Anulează
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Preferences Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Preferințe notificări
        </h2>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="emailOrders"
              defaultChecked
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
            />
            <div>
              <label htmlFor="emailOrders" className="text-sm font-medium text-gray-900 block">
                Email pentru comenzi
              </label>
              <p className="text-xs text-gray-600">
                Primește actualizări despre comenzile tale
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="emailPromotions"
              defaultChecked
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
            />
            <div>
              <label htmlFor="emailPromotions" className="text-sm font-medium text-gray-900 block">
                Email pentru promoții
              </label>
              <p className="text-xs text-gray-600">
                Primește oferte speciale și noutăți
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="emailNewsletter"
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
            />
            <div>
              <label htmlFor="emailNewsletter" className="text-sm font-medium text-gray-900 block">
                Newsletter
              </label>
              <p className="text-xs text-gray-600">
                Abonează-te la newsletter pentru știri și tendințe
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Salvează preferințele
        </button>
      </div>
    </div>
  );
}

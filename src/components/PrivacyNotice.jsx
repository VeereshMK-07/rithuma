export default function PrivacyNotice() {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-lavender/10">
      <p className="text-sm font-medium text-gray-800 mb-1 flex items-center gap-2">
        🔐 Your privacy matters
      </p>

      <p className="text-sm text-gray-600">
        Your cycle data is stored securely on your device.
        We don’t upload or share anything without your permission.
      </p>
    </div>
  );
}

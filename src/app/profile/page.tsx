import ProfileForm from "@/components/ProfileForm";

export default function ProfilePage() {
  return (
    <div className="p-6 max-w-md mx-auto bg-gray-900 text-gray-100 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-purple-400 text-center">
        My Profile
      </h1>
      <ProfileForm />
    </div>
  );
}
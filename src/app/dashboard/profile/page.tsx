import UserProfile from '../../../components/profile/UserProfile';
import AuthGuard from '../../../components/common/AuthGuard';

export default function Profile() {
  return (
    <AuthGuard>
      <UserProfile />
    </AuthGuard>
  );
}
import NotificationCenter from '../../../components/notifications/NotificationCenter';
import AuthGuard from '../../../components/common/AuthGuard';

export default function Notifications() {
  return (
    <AuthGuard>
      <NotificationCenter />
    </AuthGuard>
  );
}
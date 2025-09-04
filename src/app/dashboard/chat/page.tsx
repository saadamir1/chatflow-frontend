import ChatDashboard from '../../../components/chat/ChatDashboard';
import AuthGuard from '../../../components/common/AuthGuard';

export default function Chat() {
  return (
    <AuthGuard>
      <ChatDashboard />
    </AuthGuard>
  );
}